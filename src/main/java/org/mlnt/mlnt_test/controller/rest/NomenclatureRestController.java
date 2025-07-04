package org.mlnt.mlnt_test.controller.rest;


import lombok.RequiredArgsConstructor;
import org.mlnt.mlnt_test.entity.Nomenclature;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nomenclature")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class NomenclatureRestController {

    private final JdbcTemplate jdbcTemplate;

    @GetMapping
    public List<Nomenclature> getAllNomenclatures() {
        String sql = "select * from rubr_equipment_nomenclatures";
        return jdbcTemplate.query(sql, nomenclatureRowMapper());
    }
    @PostMapping
    public ResponseEntity<String> addNomenclature(@RequestBody Nomenclature nomenclature) {
        if (nomenclatureExists(nomenclature.getName()))
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Nomenclature already exists");
        String sql = "INSERT INTO rubr_equipment_nomenclatures (name) VALUES (?)";
        jdbcTemplate.update(sql, nomenclature.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body("Nomenclature added");
    }


    private RowMapper<Nomenclature> nomenclatureRowMapper() {
        return (rs, rowNum) -> new Nomenclature()
                .setId(rs.getInt("id"))
                .setName(rs.getString("name"));
    }

    private boolean nomenclatureExists (String name) {
        String sql = "SELECT COUNT(*) FROM rubr_equipment_nomenclatures where name = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, name);
        return count > 0;
    }
}
