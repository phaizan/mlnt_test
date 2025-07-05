package org.mlnt.mlnt_test.controller.rest;

import lombok.RequiredArgsConstructor;
import org.mlnt.mlnt_test.entity.Equipment;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// TODO раскидать код по папкам правильно
// TODO переписать get (?)
// TODO переписать put
// TODO переписать delete
// TODO просмотреть код ещё раз и реакт

@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class EquipmentRestController {

    private final JdbcTemplate jdbcTemplate;

    @GetMapping
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

    @PostMapping
    public ResponseEntity<?> addEquipment(@RequestBody Equipment equipmentToAdd) {
        Integer nomenclatureId = getNomenclatureIdFromRubr(equipmentToAdd.getName());
        if(nomenclatureId == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Номенклатура с названием " + equipmentToAdd.getName() + " не найдена");
        }
        if (getEquipmentFromStorage(nomenclatureId) != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Номенклатура с названием " + equipmentToAdd.getName() +  " уже существует");
        }

        String sqlInsertMeta = "INSERT INTO obj_metadata (obj_type_id) VALUES (2) RETURNING id";
        Integer objectId = jdbcTemplate.queryForObject(sqlInsertMeta, Integer.class);

        equipmentToAdd.setId(objectId);

        String sqlInsertEquip = "INSERT INTO obj_equipments (id, amount) VALUES (?, ?)";
        jdbcTemplate.update(sqlInsertEquip, equipmentToAdd.getId(), equipmentToAdd.getAmount());
        String sqlInsertBnd = """
                                INSERT INTO bnd_object_rubricator (object_id, rubr_id, rubr_list_id, type_id)
                                VALUES (?, ?, 2, 2)""";
        jdbcTemplate.update(sqlInsertBnd, equipmentToAdd.getId(), nomenclatureId);
        return ResponseEntity.status(HttpStatus.CREATED).body(equipmentToAdd);
    }


    @PutMapping("/{id}")
    public ResponseEntity<String> updateEquipment(@RequestBody Equipment equipmentToUpdate, @PathVariable Integer id) {
        String sql = "UPDATE obj_equipments SET amount = ? WHERE id = ?";
        try {
            int updated = jdbcTemplate.update(sql, equipmentToUpdate.getAmount(), id);
            if (updated > 0) {
                return ResponseEntity.ok("Количество оборудования обновлено");
            }
            else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Не найдено оборудование с id " + id);
            }
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Ошибка обновления: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEquipment(@PathVariable Integer id) {
        String sql = "DELETE FROM obj_equipments WHERE id = ?";
        int deleted = jdbcTemplate.update(sql, id);
        if (deleted > 0) {
            return ResponseEntity.ok("Оборудование удалено");
        }
        else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Не найдено оборудование с id " + id);
        }
    }

    private RowMapper<Equipment> equipmentRowMapper() {
        return (rs, rowNum) -> new Equipment()
                .setId(rs.getInt("id"))
                .setName(rs.getString("name"))
                .setAmount(rs.getInt("amount"));

    }

    private Integer getNomenclatureIdFromRubr(String name) {
        String sql = """
                SELECT ren.id
                FROM rubr_equipment_nomenclatures ren
                WHERE ren.name = ?""";
        try
        {
            return jdbcTemplate.queryForObject(sql, Integer.class, name);
        }
        catch (EmptyResultDataAccessException e)
        {
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
        try
        {
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> new Equipment()
                    .setId(rs.getInt("id"))
                    .setAmount(rs.getInt("amount")), nomenclatureId);
        }
        catch (EmptyResultDataAccessException e)
        {
            return null;
        }
    }
}
