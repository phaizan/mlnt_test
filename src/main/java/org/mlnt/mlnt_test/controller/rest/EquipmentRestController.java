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
// TODO поменять rowMapper

@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class EquipmentRestController {

    private final JdbcTemplate jdbcTemplate;

    @GetMapping
    public List<Equipment> getEquipment() {
        String sql = """
                SELECT ren.name, oe.amount FROM obj_equipments oe
                
                JOIN obj_metadata om ON om.id=oe.id
                JOIN bnd_object_rubricator bor ON om.id = bor.object_id
                JOIN bnd_object_rubricator_type bort ON bor.type_id = bort.id
                JOIN rubr_equipment_nomenclatures ren ON ren.id = bor.rubr_id
                
                WHERE bort.name = 'Номенклатура ТМЦ'""";
        return jdbcTemplate.query(sql, equipmentRowMapper());
    }

    @PostMapping
    public ResponseEntity<String> addEquipment(@RequestBody Equipment equipmentToAdd) {
        Integer nomenclatureId = getIdFromNomenclature(equipmentToAdd.getName());
        if(nomenclatureId == null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(equipmentToAdd.getName()
                                                                   + " не существует в списке номенклатур");
        }
        Equipment equipment = getEquipmentFromStorage(nomenclatureId);
        if (equipment == null) {
            String sqlInsertMeta = "INSERT INTO obj_metadata (obj_type_id) VALUES (2) RETURNING id";
            Integer objectId = jdbcTemplate.queryForObject(sqlInsertMeta, Integer.class);
            String sqlInsertEquip = "INSERT INTO obj_equipments (id, amount) VALUES (?, ?)";
            jdbcTemplate.update(sqlInsertEquip, objectId, equipmentToAdd.getAmount());
            String sqlInsertBnd = """
                                    INSERT INTO bnd_object_rubricator (object_id, rubr_id, rubr_list_id, type_id)
                                    VALUES (?, ?, 2, 2)""";
            jdbcTemplate.update(sqlInsertBnd, objectId, nomenclatureId);
            return ResponseEntity.status(HttpStatus.CREATED).body(equipmentToAdd.getName() + " добавлено");
        }
        else
        {
            String sql = "UPDATE obj_equipments SET amount = ? WHERE id = ?";
            jdbcTemplate.update(sql, equipmentToAdd.getAmount() + equipment.getAmount(), equipment.getId());
        }
        return ResponseEntity.ok("Оборудование добавлено");
    }

    private RowMapper<Equipment> equipmentRowMapper() {
        return (rs, rowNum) -> new Equipment()
                .setId(rowNum) //TODO исправить это
                .setName(rs.getString("name"))
                .setAmount(rs.getInt("amount"));

    }

    private Integer getIdFromNomenclature(String name) {
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
