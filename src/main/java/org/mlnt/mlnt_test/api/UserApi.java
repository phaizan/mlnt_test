package org.mlnt.mlnt_test.api;


import lombok.RequiredArgsConstructor;
import org.mlnt.mlnt_test.dto.LoginRequest;
import org.mlnt.mlnt_test.entity.User;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class UserApi {

    private final JdbcTemplate jdbcTemplate;

    public User auth(LoginRequest loginRequest) {
        String sql = "SELECT ou.id, ou.password, ou.name FROM obj_users ou WHERE ou.login = ?";
        User user = jdbcTemplate.queryForObject(sql, (rs, rowNum) ->
                new User()
                        .setId(rs.getInt("id"))
                        .setPassword(rs.getString("password"))
                        .setName(rs.getString("name")), loginRequest.getLogin());
        if (Objects.equals(user.getPassword(), loginRequest.getPassword())) {
            return user;
        }
        else
            return null;
    }

    public User register(LoginRequest loginRequest) {}

}
