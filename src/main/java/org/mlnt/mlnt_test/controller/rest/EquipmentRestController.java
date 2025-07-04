package org.mlnt.mlnt_test.controller.rest;

import lombok.RequiredArgsConstructor;
import org.mlnt.mlnt_test.entity.Equipment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;


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




    private RowMapper<Equipment> equipmentRowMapper() {
        return (rs, rowNum) -> new Equipment()
                .setId(rowNum)
                .setName(rs.getString("name"))
                .setAmount(rs.getInt("amount"));

    }

}
