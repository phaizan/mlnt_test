package org.mlnt.mlnt_test.controller.rest;


import io.swagger.annotations.Api;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.mlnt.mlnt_test.api.RequestApi;
import org.mlnt.mlnt_test.api.UserApi;
import org.mlnt.mlnt_test.dto.UserDTO;
import org.mlnt.mlnt_test.entity.Request;
import org.mlnt.mlnt_test.entity.RequestEquipment;
import org.mlnt.mlnt_test.entity.User;
import org.springframework.data.relational.core.sql.In;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

//TODO понять нужно ли userDTO и что в session присваивать

@Api ("Контроллер для работы с заявками")
@RestController
@RequestMapping("/api/request")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class RequestRestController {

    private final RequestApi requestApi;
    private final UserApi userApi;

    @GetMapping()
    public ResponseEntity<?> getRequests(HttpSession session) {
        UserDTO user = (UserDTO) session.getAttribute("UserData");
        return ResponseEntity.ok(requestApi.getRequests(user.getId()));
    }

    @PostMapping()
    public ResponseEntity<?> addRequest(@RequestBody List<RequestEquipment> requestEquipment, HttpSession session) {
        try {
            Request added = requestApi.addRequest(requestEquipment, userApi.getUserDTO(session).getId());
            return ResponseEntity.ok(added);
        }
        catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
        catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @DeleteMapping("/test")
    public void deleteNotTest() {
        requestApi.deleteNotTest();
    }
}
