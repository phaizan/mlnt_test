package org.mlnt.mlnt_test.controller.rest;

import io.swagger.annotations.Api;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.mlnt.mlnt_test.api.UserApi;
import org.mlnt.mlnt_test.dto.LoginRequest;
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

    public static final String USER_DATA_SESSION_KEY = "UserData";
    @PostMapping("/login")
    public ResponseEntity<?> doAuth(@RequestBody LoginRequest loginRequest, HttpSession session) {
        try {
            User user = userApi.auth(loginRequest);
            if (user != null) {
                session.setAttribute(USER_DATA_SESSION_KEY, user);
                return ResponseEntity.ok(user);
            }
            else
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Неправильно введен пароль");
        }
        catch (EmptyResultDataAccessException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Не найден пользователь с логином: " + loginRequest.getLogin());
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping("/registration")
    public ResponseEntity<?> doRegistration(@RequestBody User user) {


    }

}
