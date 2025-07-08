package org.mlnt.mlnt_test.controller.rest;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.mlnt.mlnt_test.api.RequestApi;
import org.mlnt.mlnt_test.entity.Request;
import org.mlnt.mlnt_test.entity.RequestEquipment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/request")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class RequestRestController {

    private final RequestApi requestApi;

    @GetMapping()
    public ResponseEntity<?> getRequest() {
        return ResponseEntity.ok(requestApi.getRequests());
    }

    @PostMapping()
    public ResponseEntity<?> addRequest(@RequestBody List<RequestEquipment> requestEquipment) {
        try {
            Request added = requestApi.addRequest(requestEquipment);
            return ResponseEntity.status(HttpStatus.CREATED).body(added);
        }
        catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
        catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }



}
