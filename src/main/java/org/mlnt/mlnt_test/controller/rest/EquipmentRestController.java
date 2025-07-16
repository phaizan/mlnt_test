package org.mlnt.mlnt_test.controller.rest;

import lombok.RequiredArgsConstructor;
import org.mlnt.mlnt_test.api.EquipmentApi;
import org.mlnt.mlnt_test.api.RequestApi;
import org.mlnt.mlnt_test.entity.Equipment;
import org.mlnt.mlnt_test.entity.Nomenclature;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.NoSuchElementException;
import io.swagger.annotations.Api;

@Api ("Контроллер для работы с ТМЦ на складе и номенклатурами")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class EquipmentRestController {

    private final EquipmentApi equipmentApi;
    private final RequestApi requestApi;

    @GetMapping("/equipment")
    public ResponseEntity<?> getEquipment() {
        return ResponseEntity.ok(equipmentApi.getEquipments());
    }

    @PostMapping("/equipment")
    public ResponseEntity<?> addEquipment(@RequestBody Equipment equipment) {
        try {
            Equipment added = equipmentApi.addEquipment(equipment);
            requestApi.processRequestsOnEquipmentUpdate(added);
            return ResponseEntity.ok(added);
        }
        catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
        catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Внутренняя ошибка сервера");
        }
    }

    @PutMapping("/equipment/{id}")
    public ResponseEntity<?> updateEquipment(@RequestBody Equipment equipment, @PathVariable Integer id) {
        try {
            Equipment updated = equipmentApi.updateEquipment(equipment, id);
            requestApi.processRequestsOnEquipmentUpdate(updated);
            return ResponseEntity.ok(updated);

        }
        catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
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
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
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
            return ResponseEntity.ok(added);
        }
        catch (DuplicateKeyException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Номенклатура \"" + nomenclature.getName() + "\" уже существует");
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Ошибка обновления: " + e.getMessage());
        }
    }

    @PutMapping("/nomenclature/{id}")
    public ResponseEntity<?> updateNomenclature(@RequestBody Nomenclature nomenclature, @PathVariable Integer id) {
        try {
            Nomenclature updated = equipmentApi.updateNomenclature(nomenclature, id);
            return ResponseEntity.ok(updated);
        }
        catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
        catch (DuplicateKeyException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Номенклатура \"" + nomenclature.getName() + "\" уже существует");
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Ошибка обновления: " + e.getMessage());
        }
    }

    @DeleteMapping("/nomenclature/{id}")
    public ResponseEntity<String> deleteNomenclature(@PathVariable Integer id) {
        try {
            Equipment equipment = equipmentApi.getEquipmentFromStorage(id);
            equipmentApi.deleteNomenclature(id);
            if (equipment != null)
                equipmentApi.deleteEquipment(equipment.getId());
            return ResponseEntity.ok().build();
        }
        catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Ошибка при удалении: " + e.getMessage());
        }
    }
}
