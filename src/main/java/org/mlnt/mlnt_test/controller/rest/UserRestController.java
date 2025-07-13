package org.mlnt.mlnt_test.controller.rest;

import io.swagger.annotations.Api;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.mlnt.mlnt_test.api.DbManager;
import org.mlnt.mlnt_test.api.UserApi;
import org.mlnt.mlnt_test.dto.LoginRequest;
import org.mlnt.mlnt_test.dto.UserDTO;
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
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserRestController {

    private final UserApi userApi;
    private final DbManager dbManager;
    public static final String USER_DATA_SESSION_KEY = "UserData";

    @PostMapping("/login")
    public ResponseEntity<?> doAuth(@RequestBody LoginRequest loginRequest, HttpSession session) {
        try {
            User user = userApi.login(loginRequest);
            if (user != null) {
                UserDTO userDTO = new UserDTO()
                        .setId(user.getId())
                        .setName(user.getName())
                        .setRoleId(dbManager.getUserRoleId(user.getId()));
                session.setAttribute(USER_DATA_SESSION_KEY, userDTO);

                return ResponseEntity.ok(userDTO);
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
        userApi.register(user);

        return ResponseEntity.ok(user);
    }

    @GetMapping("/roles")
    public ResponseEntity<?> getRoles() {
        return ResponseEntity.ok(userApi.getRoles());
    }

    @GetMapping("/data")
    public ResponseEntity<?> getUserData(HttpSession session) {
        UserDTO userDTO = userApi.getUserDTO(session);
        if (userDTO != null) {
            return ResponseEntity.ok(userDTO);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Вы вышли из системы");
    }
}
