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

//TODO прописать ошибки при вставлении (?)

@Service
@RequiredArgsConstructor
public class EquipmentApi {

    private final JdbcTemplate jdbcTemplate;

    public List<Equipment> getEquipment() {
        String sql = """
                SELECT oe.id, ren.name, oe.amount FROM obj_equipments oe
                
                JOIN obj_metadata om ON om.id=oe.id
                JOIN bnd_object_rubricator bor ON om.id = bor.object_id
                JOIN bnd_object_rubricator_type bort ON bor.type_id = bort.id
                JOIN rubr_equipment_nomenclatures ren ON ren.id = bor.rubr_id
                
                WHERE bort.name = 'Номенклатура ТМЦ'""";
        return jdbcTemplate.query(sql, equipmentRowMapper());
    }

    public Equipment addEquipment(Equipment equipment) {
        Integer nomenclatureId = getNomenclatureIdFromRubr(equipment.getName());
        if (nomenclatureId == null) {
            throw new NoSuchElementException("Оборудование \"" + equipment.getName() + "\" не найдено");
        }
        if (getEquipmentFromStorage(nomenclatureId) != null) {
            throw new IllegalArgumentException ("Оборудование \"" + equipment.getName() +  "\" уже существует");
        }
        String sqlInsertMeta = "INSERT INTO obj_metadata (obj_type_id) VALUES (2) RETURNING id";
        Integer objectId = jdbcTemplate.queryForObject(sqlInsertMeta, Integer.class);
        equipment.setId(objectId);
        String sqlInsertEquip = "INSERT INTO obj_equipments (id, amount) VALUES (?, ?)";
        jdbcTemplate.update(sqlInsertEquip, equipment.getId(), equipment.getAmount());
        String sqlInsertBnd = """
                                INSERT INTO bnd_object_rubricator (object_id, rubr_id, rubr_list_id, type_id)
                                VALUES (?, ?, 2, 2)""";
        jdbcTemplate.update(sqlInsertBnd, equipment.getId(), nomenclatureId);
        return equipment;
    }

    public Equipment updateEquipment(Equipment equipment, Integer id) {
        String sql = "UPDATE obj_equipments SET amount = ? WHERE id = ?";
        equipment.setId(id);
        int updated = jdbcTemplate.update(sql, equipment.getAmount(), equipment.getId());
        if (updated > 0)
            return equipment;
        else
            throw new NoSuchElementException("Не найдено оборудование с id " + id);
    }

    public void deleteEquipment(Integer id) {
        String sql = "DELETE FROM obj_metadata WHERE id = ?";
        int deleted = jdbcTemplate.update(sql, id);
        if (deleted == 0)
            throw new NoSuchElementException("Не найдено оборудование с id " + id);
    }

    public List<Nomenclature> getNomenclatures() {
        String sql = "select * from rubr_equipment_nomenclatures";
        return jdbcTemplate.query(sql, nomenclatureRowMapper());
    }

    public Nomenclature addNomenclature(Nomenclature nomenclature) {
        String sql = "INSERT INTO rubr_equipment_nomenclatures (name) VALUES (?) RETURNING id";
        Integer nomenclatureId = jdbcTemplate.queryForObject(sql, Integer.class, nomenclature.getName());
        nomenclature.setId(nomenclatureId);
        return nomenclature;
    }

    public Nomenclature updateNomenclature(Nomenclature nomenclature, Integer id) {
        String sql = "UPDATE rubr_equipment_nomenclatures SET name = ? WHERE id = ?";
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

    private Equipment getEquipmentFromStorage(int nomenclatureId) {
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