package org.mlnt.mlnt_test.api;

import lombok.RequiredArgsConstructor;
import org.mlnt.mlnt_test.entity.Equipment;
import org.mlnt.mlnt_test.entity.Nomenclature;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.NoSuchElementException;

/**
 * АПИ для работы с ИО ТМЦ и рубрикатором Номенклатура
 */
@Service
@RequiredArgsConstructor
public class EquipmentApi {

    private final JdbcTemplate jdbcTemplate;
    private final DbManager dbManager;

    private static final int OBJ_EQUIPMENT_TYPE_ID = 2;
    private static final int RUBR_EQUIPMENT_NOMENCLATURES_LIST_ID = 2;
    private static final int BND_O_R_EQUIPMENT_NOMENCLATURES_TYPE_ID = 2;
    /**
     *  Получение списка остатков на складе
     */
    public List<Equipment> getEquipments() {
        String sql = """
                SELECT oe.id, ren.name, oe.amount FROM obj_equipments oe
                
                JOIN obj_metadata om ON om.id=oe.id
                JOIN bnd_object_rubricator bor ON om.id = bor.object_id
                JOIN bnd_object_rubricator_type bort ON bor.type_id = bort.id
                JOIN rubr_equipment_nomenclatures ren ON ren.id = bor.rubr_id
                
                WHERE bort.name = 'Номенклатура ТМЦ'
                ORDER BY ren.name""";
        return jdbcTemplate.query(sql, equipmentRowMapper());
    }

    /**
     * Добавление ТМЦ на склад
     *
     * @param equipment ТМЦ
     * @return ТМЦ
     */
    public Equipment addEquipment(Equipment equipment) {
        Integer nomenclatureId = getNomenclatureIdFromRubr(equipment.getName());
        if (nomenclatureId == null) {
            throw new NoSuchElementException("Оборудование \"" + equipment.getName() + "\" не найдено");
        }
        equipment.setNomenclatureId(nomenclatureId);
        if (getEquipmentFromStorage(nomenclatureId) != null) {
            throw new IllegalArgumentException ("Оборудование \"" + equipment.getName() +  "\" уже существует");
        }
        Integer objectId = dbManager.createObjectMeta(OBJ_EQUIPMENT_TYPE_ID);
        equipment.setId(objectId);
        String sqlInsertEquip = "INSERT INTO obj_equipments (id, amount) VALUES (?, ?)";
        jdbcTemplate.update(sqlInsertEquip, equipment.getId(), equipment.getAmount());
        dbManager.createBndObjectRubricator(equipment.getId(), nomenclatureId, RUBR_EQUIPMENT_NOMENCLATURES_LIST_ID, BND_O_R_EQUIPMENT_NOMENCLATURES_TYPE_ID);
        return equipment;
    }

    /**
     * Обновление количества
     * @param equipment ТМЦ
     * @param id Уникальный идентификатор
     * @return ТМЦ
     */
    public Equipment updateEquipment(Equipment equipment, Integer id) {

        equipment.setId(id);
        if (equipment.getAmount() == 0) {
            deleteEquipment(equipment.getId());
            return null;
        }
        String sql = "UPDATE obj_equipments SET amount = ? WHERE id = ?";
        int updated = jdbcTemplate.update(sql, equipment.getAmount(), equipment.getId());
        if (updated > 0)
            return equipment;
        else
            throw new NoSuchElementException("Не найдено оборудование с id " + equipment.getId());
    }

    public void deleteEquipment(Integer id) {
        String sql = "DELETE FROM obj_metadata WHERE id = ?";
        int deleted = jdbcTemplate.update(sql, id);
        if (deleted == 0)
            throw new NoSuchElementException("Не найдено оборудование с id " + id);
    }
    /**
     *  Получение списка номенклатур
     */

    public List<Nomenclature> getNomenclatures() {
        String sql = "SELECT * from rubr_equipment_nomenclatures ORDER BY name";
        return jdbcTemplate.query(sql, nomenclatureRowMapper());
    }

    public Nomenclature addNomenclature(Nomenclature nomenclature) {
        String sql = "INSERT INTO rubr_equipment_nomenclatures (name) VALUES (?) RETURNING id";
        nomenclature.setName(normalizeName(nomenclature.getName()));
        Integer nomenclatureId = jdbcTemplate.queryForObject(sql, Integer.class, nomenclature.getName());
        nomenclature.setId(nomenclatureId);
        return nomenclature;
    }

    public Nomenclature updateNomenclature(Nomenclature nomenclature, Integer id) {
        String sql = "UPDATE rubr_equipment_nomenclatures SET name = ? WHERE id = ?";
        nomenclature.setName(normalizeName(nomenclature.getName()));
        nomenclature.setId(id);
        int updated = jdbcTemplate.update(sql, nomenclature.getName(), nomenclature.getId());
        if (updated > 0) {
            return nomenclature;
        }
        else {
            throw new NoSuchElementException("Не найдено оборудование с id " + id);
        }
    }

    public void deleteNomenclature(Integer id) {
        String sql = "DELETE FROM rubr_equipment_nomenclatures WHERE id = ?";
        int deleted = jdbcTemplate.update(sql, id);
        if (deleted == 0)
            throw new NoSuchElementException("Не найдена номенклатура с id " + id);
    }

    public Integer getNomenclatureIdFromRubr(String name) {
        String sql = """
                SELECT ren.id
                FROM rubr_equipment_nomenclatures ren
                WHERE ren.name = ?""";
        try {
            return jdbcTemplate.queryForObject(sql, Integer.class, name);
        }
        catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public Equipment getEquipmentFromStorage(int nomenclatureId) {
        String sql = """
                SELECT oe.id, oe.amount
                FROM obj_equipments oe
                
                JOIN obj_metadata om ON om.id = oe.id
                JOIN bnd_object_rubricator bor ON om.id = bor.object_id
                JOIN bnd_object_rubricator_type bort ON bor.type_id = bort.id
                JOIN rubr_equipment_nomenclatures ren ON ren.id = bor.rubr_id
                
                WHERE ren.id = ? AND bort.name = 'Номенклатура ТМЦ';""";
        try {
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> new Equipment()
                    .setId(rs.getInt("id"))
                    .setAmount(rs.getInt("amount")), nomenclatureId);
        }
        catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public String normalizeName(String name) {
        name = name.trim().toLowerCase();
        return name.substring(0, 1).toUpperCase() + name.substring(1);
    }

    private RowMapper<Equipment> equipmentRowMapper() {
        return (rs, rowNum) -> new Equipment()
                .setId(rs.getInt("id"))
                .setName(rs.getString("name"))
                .setAmount(rs.getInt("amount"));
    }

    private RowMapper<Nomenclature> nomenclatureRowMapper() {
        return (rs, rowNum) -> new Nomenclature()
                .setId(rs.getInt("id"))
                .setName(rs.getString("name"));
    }
}