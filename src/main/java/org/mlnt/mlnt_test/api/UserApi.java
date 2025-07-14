package org.mlnt.mlnt_test.api;


import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.mlnt.mlnt_test.dto.LoginRequest;
import org.mlnt.mlnt_test.dto.UserDTO;
import org.mlnt.mlnt_test.entity.Role;
import org.mlnt.mlnt_test.entity.User;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Objects;

//TODO не работает удалить все тестовые?
//TODO разобраться со всеми .query

@Service
@RequiredArgsConstructor
public class UserApi {

    private final JdbcTemplate jdbcTemplate;
    private final DbManager dbManager;

    public static final String USER_DATA_SESSION_KEY = "UserData";
    private static final int OBJ_USER_TYPE_ID = 1;
    private static final int RUBR_USER_ROLES_LIST_ID = 1;
    private static final int BND_O_R_USER_ROLES_TYPE_ID = 1;

    public User login (LoginRequest loginRequest) {
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

    public User register (User user) {
        user.setId(dbManager.createObjectMeta(OBJ_USER_TYPE_ID));
        String sql = "INSERT INTO obj_users (id, name, login, password) VALUES (?, ?, ?, ?)";
        jdbcTemplate.update(sql, user.getId(), user.getName(), user.getLogin(), user.getPassword());
        dbManager.createBndObjectRubricator(user.getId(), user.getRoleId(), RUBR_USER_ROLES_LIST_ID, BND_O_R_USER_ROLES_TYPE_ID);

        return user;
    }

    public List<Role> getRoles() {
        String sql = "SELECT * FROM rubr_user_roles ORDER BY name";
        return jdbcTemplate.query(sql, (rs, rowNum) -> new Role()
                        .setId(rs.getInt("id"))
                        .setName(rs.getString("name")));
    }

    public UserDTO getUserDTO (HttpSession session) {
        return (UserDTO) session.getAttribute(USER_DATA_SESSION_KEY);
    }
}
