package org.mlnt.mlnt_test.controller.rest;

import io.swagger.annotations.Api;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.mlnt.mlnt_test.api.UserApi;
import org.mlnt.mlnt_test.entity.User;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Api("Контроллер для работы с пользователями")
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class UserRestController {

    private final UserApi userApi;

    @PostMapping()
    public ResponseEntity<?> doAuth(@RequestBody User user) {
        try {
            user = userApi.auth(user);
            if (user != null) {
                return ResponseEntity.ok(user);
            }
            else
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        catch (EmptyResultDataAccessException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Не найден пользователь с логином: " + user.getLogin());
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

}
