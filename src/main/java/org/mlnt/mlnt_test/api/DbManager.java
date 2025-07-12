package org.mlnt.mlnt_test.api;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

/**
 * Сервис для работы с бд
 */


@Service
@RequiredArgsConstructor
public class DbManager {

    private final JdbcTemplate jdbcTemplate;

    public Integer createObjectMeta(int obj_type) {
        String sql = "INSERT INTO obj_metadata (obj_type_id) VALUES (?) RETURNING id";
        return jdbcTemplate.queryForObject(sql, Integer.class, obj_type);
    }

    public void createBndObjectRubricator (int objId, int rubrId, int rubrListId, int typeId) {
        String sql = """
                        INSERT INTO bnd_object_rubricator (object_id, rubr_id, rubr_list_id, type_id)
                        VALUES (?, ?, ?, ?)""";
        jdbcTemplate.update(sql, objId, rubrId, rubrListId, typeId);
    }

    public Integer getUserRoleId (int userId) {
         String sql = """
                 SELECT rur.id
                 FROM obj_users ou
                 JOIN bnd_object_rubricator bor ON bor.object_id = ou.id
                 JOIN rubr_user_roles rur ON rur.id = bor.rubr_id
                 
                 WHERE bor.type_id = 1 AND
                       ou.id = ?""";
         return jdbcTemplate.queryForObject(sql, Integer.class, userId);
    }
}
