package org.mlnt.mlnt_test.controller.rest;

import lombok.RequiredArgsConstructor;
import org.mlnt.mlnt_test.api.EquipmentApi;
import org.mlnt.mlnt_test.entity.Equipment;
import org.mlnt.mlnt_test.entity.Nomenclature;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class EquipmentRestController {

    private final EquipmentApi equipmentApi;

    @GetMapping("/equipment")
    public ResponseEntity<?> getEquipment() {
        return ResponseEntity.ok(equipmentApi.getEquipment());
    }

    @PostMapping("/equipment")
    public ResponseEntity<?> addEquipment(@RequestBody Equipment equipment) {
        try {
            Equipment added = equipmentApi.addEquipment(equipment);
            return ResponseEntity.status(HttpStatus.CREATED).body(added);
        }
        catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
        catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @PutMapping("/equipment/{id}")
    public ResponseEntity<?> updateEquipment(@RequestBody Equipment equipment, @PathVariable Integer id) {
        try {
            Equipment updated = equipmentApi.updateEquipment(equipment, id);
            return ResponseEntity.status(HttpStatus.OK).body(updated);
        }
        catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Ошибка обновления: " + e.getMessage());
        }
    }

    @DeleteMapping("/equipment/{id}")
    public ResponseEntity<String> deleteEquipment(@PathVariable Integer id) {
        try {
            equipmentApi.deleteEquipment(id);
            return ResponseEntity.ok().build();
        }
        catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Ошибка при удалении: " + e.getMessage());
        }
    }

    @GetMapping("/nomenclature")
    public ResponseEntity<?> getNomenclatures() {
        return ResponseEntity.ok(equipmentApi.getNomenclatures());
    }

    @PostMapping("/nomenclature")
    public ResponseEntity<?> addNomenclature(@RequestBody Nomenclature nomenclature) {
        try {
            Nomenclature added = equipmentApi.addNomenclature(nomenclature);
            return ResponseEntity.status(HttpStatus.CREATED).body(added);
        }
        catch (DuplicateKeyException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Оборудование уже существует");
        }
    }

    @PutMapping("/nomenclature/{id}")
    public ResponseEntity<?> updateNomenclature(@RequestBody Nomenclature nomenclature, @PathVariable Integer id) {
        try {
            Nomenclature updated = equipmentApi.updateNomenclature(nomenclature, id);
            return ResponseEntity.status(HttpStatus.OK).body(updated);
        }
        catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
        catch (DuplicateKeyException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Оборудование \"" + nomenclature.getName() + "\" уже существует");
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Ошибка обновления: " + e.getMessage());
        }
    }

    @DeleteMapping("/nomenclature/{id}")
    public ResponseEntity<String> deleteNomenclature(@PathVariable Integer id) {
        try {
            equipmentApi.deleteNomenclature(id);
            return ResponseEntity.ok().build();
        }
        catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Ошибка при удалении: " + e.getMessage());
        }
    }
}
