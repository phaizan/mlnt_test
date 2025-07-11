package org.mlnt.mlnt_test.api;

import lombok.RequiredArgsConstructor;
import org.mlnt.mlnt_test.entity.Equipment;
import org.mlnt.mlnt_test.entity.Request;
import org.mlnt.mlnt_test.entity.RequestEquipment;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

//TODO посмотреть предупреждения

@Service
@RequiredArgsConstructor
public class RequestApi {

    private final JdbcTemplate jdbcTemplate;
    private final EquipmentApi equipmentApi;

    final int OBJ_TYPE_REQUEST = 3;
    final int OBJ_TYPE_REQUEST_EQUIPMENT = 4;
    final int REQUEST_STATUS_ACCEPTED = 1;
    final int REQUEST_STATUS_COMPLETED = 2;
    final int BND_REQUEST_STATUS = 3;
    final int BND_REQUEST_EQUIPMENT_STATUS = 4;

    public List<Request> getRequests() {

        String sql = """
            SELECT
                obr.id AS request_id,
                obr.created_at AS request_created,
                obr.closed_at AS request_closed,
                rrs_request.id AS request_status_id,
                rrs_request.name AS request_status_name,
            
                ore.id AS equipment_id,
                ren.id AS nomenclature_id,
                ren.name AS nomenclature_name,
                ore.amount,
                rrs_equipment.id AS equipment_status_id,
                rrs_equipment.name AS equipment_status_name,
                obr.created_at AS equipment_created,
                ore.closed_at AS equipment_closed
            
            FROM obj_requests obr
            
            -- статус заявки
            JOIN bnd_object_rubricator bor_request ON bor_request.object_id = obr.id
            JOIN bnd_object_rubricator_type bort_request ON bor_request.type_id = bort_request.id
            JOIN rubr_request_statuses rrs_request ON bor_request.rubr_id = rrs_request.id
            
            -- связи с позициями
            JOIN bnd_object_object boo ON boo.main_object_id = obr.id
            JOIN bnd_object_object_type boot ON boot.id = boo.type_id
            JOIN obj_request_equipments ore ON ore.id = boo.secondary_object_id
            
            -- номенклатура
            JOIN bnd_object_rubricator bor_name ON ore.id = bor_name.object_id
            JOIN bnd_object_rubricator_type bort_name ON bor_name.type_id = bort_name.id
            JOIN rubr_equipment_nomenclatures ren ON bor_name.rubr_id = ren.id
            
            -- статус позиции
            JOIN bnd_object_rubricator bor_status ON ore.id = bor_status.object_id
            JOIN bnd_object_rubricator_type bort_status ON bort_status.id = bor_status.type_id
            JOIN rubr_request_statuses rrs_equipment ON bor_status.rubr_id = rrs_equipment.id
            
            WHERE
                bort_request.name = 'Статус заявки' AND
                boot.name = 'Заявка содержит позицию' AND
                bort_name.name = 'Номенклатура ТМЦ' AND
                bort_status.name = 'Статус позиции в заявке'

            ORDER BY ore.id""";

        return jdbcTemplate.query(sql, rs -> {
            Map<Integer, Request> requestMap = new LinkedHashMap<>();
            while (rs.next()) {
                int requestId = rs.getInt("request_id");
                Request request = requestMap.get(requestId);
                if (request == null) {
                    request = new Request()
                            .setId(requestId)
                            .setCreatedAt(rs.getTimestamp("request_created").toLocalDateTime())
                            .setClosedAt(rs.getTimestamp("request_closed") != null
                                    ? rs.getTimestamp("request_closed").toLocalDateTime()
                                    : null)
                            .setStatusId(rs.getInt("request_status_id"))
                            .setStatusName(rs.getString("request_status_name"))
                            .setRequestEquipments(new ArrayList<>());
                    requestMap.put(requestId, request);
                }

                RequestEquipment equipment = new RequestEquipment()
                        .setId(rs.getInt("equipment_id"))
                        .setNomenclatureId(rs.getInt("nomenclature_id"))
                        .setName(rs.getString("nomenclature_name"))
                        .setAmount(rs.getInt("amount"))
                        .setStatusId(rs.getInt("equipment_status_id"))
                        .setStatusName(rs.getString("equipment_status_name"))
                        .setCreatedAt(rs.getTimestamp("equipment_created").toLocalDateTime())
                        .setClosedAt(rs.getTimestamp("equipment_closed") != null
                                ? rs.getTimestamp("equipment_closed").toLocalDateTime()
                                : null);

                request.getRequestEquipments().add(equipment);
            }
            return new ArrayList<>(requestMap.values());
        });
    }

    @Transactional
    public Request addRequest (List<RequestEquipment> requestEquipments) {
        try {
            Request request = new Request()
                    .setCreatedAt(LocalDateTime.now())
                    .setRequestEquipments(requestEquipments)
                    .setStatusId(REQUEST_STATUS_ACCEPTED)
                    .setStatusName("Принята");

            String sqlInsertMeta = "INSERT INTO obj_metadata (obj_type_id) VALUES (?) RETURNING id;";
            Integer requestId = jdbcTemplate.queryForObject(sqlInsertMeta, Integer.class, OBJ_TYPE_REQUEST);

            if (requestId == null) {
                throw new NoSuchElementException("Не удалось вставить заявку");
            }
            request.setId(requestId);

            String sqlInsertRequest = "INSERT INTO obj_requests (id, created_at) VALUES (?, ?)";
            String sqlInsertBndRequest_RubricatorStatus = "INSERT INTO bnd_object_rubricator (object_id, rubr_id, rubr_list_id, type_id) VALUES (?, ?, 3, 3);";

            jdbcTemplate.update(sqlInsertRequest, request.getId(), request.getCreatedAt());
            jdbcTemplate.update(sqlInsertBndRequest_RubricatorStatus, request.getId(), request.getStatusId());

            String sqlInsertRequestEquipment = "INSERT INTO obj_request_equipments (id, amount) VALUES (?, ?);";
            String sqlInsertBndRequest_RequestEquipment = "INSERT INTO bnd_object_object (main_object_id, secondary_object_id, type_id) VALUES (?, ?, 2);";
            String sqlInsertBndRequestEquipment_RubricatorStatus = "INSERT INTO bnd_object_rubricator (object_id, rubr_id, rubr_list_id, type_id) VALUES (?, ?, 3, 4);";
            String sqlInsertBndRequestEquipment_RubricatorName = "INSERT INTO bnd_object_rubricator (object_id, rubr_id, rubr_list_id, type_id) VALUES (?, ?, 2, 2);";

            for (RequestEquipment requestEquipment : requestEquipments) {
                requestEquipment
                        .setCreatedAt(request.getCreatedAt())
                        .setStatusId(REQUEST_STATUS_ACCEPTED)
                        .setStatusName("Принята");

                Integer requestEquipmentId = jdbcTemplate.queryForObject(sqlInsertMeta, Integer.class, OBJ_TYPE_REQUEST_EQUIPMENT);

                if (requestEquipmentId == null) {
                    throw new NoSuchElementException("Не удалось вставить ТМЦ заявки");
                }
                requestEquipment.setId(requestEquipmentId);

                jdbcTemplate.update(sqlInsertRequestEquipment, requestEquipment.getId(), requestEquipment.getAmount());
                jdbcTemplate.update(sqlInsertBndRequest_RequestEquipment, request.getId(), requestEquipment.getId());
                jdbcTemplate.update(sqlInsertBndRequestEquipment_RubricatorStatus, requestEquipment.getId(), requestEquipment.getStatusId());
                jdbcTemplate.update(sqlInsertBndRequestEquipment_RubricatorName, requestEquipment.getId(), requestEquipment.getNomenclatureId());
            }

            List<Equipment> storage = equipmentApi.getEquipments();

            for (Equipment eq : storage) {
                processRequestsOnEquipmentUpdate(eq);
            }

            return request;
        } catch (DataAccessException e) {
            throw new IllegalStateException("Ошибка при доступе к базе данных" + e);
        }
    }

    public void processRequestsOnEquipmentUpdate (Equipment equipment) {

        if (equipment.getNomenclatureId() == 0) {
            equipment.setNomenclatureId(equipmentApi.getNomenclatureIdFromRubr(equipment.getName()));
        }

        String sqlGetQueue = """
                SELECT ore.id AS id, ore.amount
                
                FROM obj_request_equipments ore
                JOIN bnd_object_rubricator bor_status ON object_id = ore.id
                JOIN rubr_request_statuses rrs ON rrs.id = bor_status.rubr_id
                JOIN bnd_object_object boo ON boo.secondary_object_id = ore.id
                JOIN obj_requests obr ON obr.id = boo.main_object_id
                JOIN bnd_object_rubricator bor_name ON bor_name.object_id = ore.id
                JOIN rubr_equipment_nomenclatures ren ON bor_name.rubr_id = ren.id
                
                WHERE bor_status.type_id = 4
                   AND rrs.id = 1
                   AND bor_name.type_id = 2
                   AND ren.id = ?
                
                ORDER BY obr.created_at""";

        List<RequestEquipment> requestEquipments = jdbcTemplate.query(sqlGetQueue, requestEquipmentRowMapper(), equipment.getNomenclatureId());
        List<RequestEquipment> updatedRequestEquipments = new ArrayList<>();
        for (RequestEquipment re : requestEquipments) {
            if (re.getAmount() <= equipment.getAmount()) {
                equipment.setAmount(equipment.getAmount() - re.getAmount());
                equipmentApi.updateEquipment(equipment, equipment.getId());
                re.setStatusId(REQUEST_STATUS_COMPLETED);
                re.setClosedAt(LocalDateTime.now());
                updatedRequestEquipments.add(re);
            }
            else {
                break;
            }
        }

        if(!updatedRequestEquipments.isEmpty()) {
            updateRequestEquipmentStatus(updatedRequestEquipments);
            updateRequestStatus(updatedRequestEquipments);
        }
    }

    private RowMapper<RequestEquipment> requestEquipmentRowMapper ()
    {
        return ((rs, rowNum) -> new RequestEquipment()
                .setId(rs.getInt("id"))
                .setAmount(rs.getInt("amount")));
    }

    private void updateRequestEquipmentStatus (List<RequestEquipment> requestEquipments) {
        String sqlInsertStatus = """
                UPDATE bnd_object_rubricator bor
                SET rubr_id = ?
                WHERE bor.object_id = ?
                    AND bor.type_id = ?""";

        String sqlInsertRequestEquipmentClosedAt = """
                UPDATE obj_request_equipments
                SET closed_at = ?
                WHERE obj_request_equipments.id = ?
                """;

        String sqlGetStatusName = """
                SELECT rrs.name
                FROM rubr_request_statuses rrs
                JOIN bnd_object_rubricator bor ON bor.rubr_id = rrs.id
                WHERE bor.object_id = ?
                    AND bor.type_id = ?""";

        for (RequestEquipment rE : requestEquipments) {
            jdbcTemplate.update(sqlInsertStatus, rE.getStatusId(), rE.getId(), BND_REQUEST_EQUIPMENT_STATUS);
            jdbcTemplate.update(sqlInsertRequestEquipmentClosedAt, rE.getClosedAt(), rE.getId());
            rE.setStatusName(jdbcTemplate.queryForObject(sqlGetStatusName, String.class, rE.getId(), BND_REQUEST_EQUIPMENT_STATUS));
        }
    }

    private void updateRequestStatus(List<RequestEquipment> requestEquipments) {

        List<Integer> requestEquipmentIds = requestEquipments.stream()
                .map(RequestEquipment::getId)
                .toList();

        String inSqlGetRequestsByRE = requestEquipmentIds.stream().map(id -> "?").collect(Collectors.joining(",", "(", ")"));

        String sqlGetRequestsByRE = """
                SELECT obr.id
                
                FROM obj_requests obr
                
                JOIN bnd_object_object boo_changed ON boo_changed.main_object_id = obr.id
                JOIN obj_request_equipments ore_changed ON boo_changed.secondary_object_id = ore_changed.id
                JOIN bnd_object_rubricator bor_obr ON bor_obr.object_id = obr.id
                JOIN rubr_request_statuses rrs_obr ON rrs_obr.id = bor_obr.rubr_id
                
                
                
                WHERE boo_changed.type_id = 2
                  AND bor_obr.type_id = 3
                  AND bor_obr.rubr_id = 1
                  AND rrs_obr.id = 1
                  AND ore_changed.id in""" + inSqlGetRequestsByRE + "ORDER BY obr.created_at";

        Set<Integer> requestsIds = jdbcTemplate.query(
                        sqlGetRequestsByRE,
                        requestEquipmentIds.toArray(),
                        (rs, rowNum) -> rs.getInt("id")).stream().collect(Collectors.toSet());

        String inSql = requestsIds.stream().map(id -> "?").collect(Collectors.joining(",", "(", ")"));
        String sqlGetREStatuses = """
                SELECT obr.id, rrs.id as request_status_id
                FROM obj_requests obr
                JOIN bnd_object_object boo ON boo.main_object_id = obr.id
                JOIN obj_request_equipments ore ON boo.secondary_object_id = ore.id
                JOIN bnd_object_rubricator bor ON bor.object_id = ore.id
                JOIN rubr_request_statuses rrs ON bor.rubr_id = rrs.id
                
                WHERE bor.type_id = 4
                    AND boo.type_id = 2
                    AND obr.id IN""" + inSql + "ORDER BY obr.id";

        Map<Integer, Set<Integer>> requestREStatuses = jdbcTemplate.query(
                sqlGetREStatuses,
                requestsIds.toArray(),
                rs -> {
                    Map<Integer, Set<Integer>> map = new HashMap<>();
                    while (rs.next()) {
                        map.computeIfAbsent(rs.getInt("id"), k -> new HashSet<>()).add(rs.getInt("request_status_id"));
                    }
                    return map;
                });

        List<Request> requestsToUpdate = new ArrayList<>();

        for (Map.Entry<Integer, Set<Integer>> entry : requestREStatuses.entrySet()) {
            if (entry.getValue().size() == 1 && entry.getValue().contains(2)) {
                requestsToUpdate.add(new Request()
                        .setId(entry.getKey())
                        .setClosedAt(LocalDateTime.now())
                        .setStatusId(REQUEST_STATUS_COMPLETED));
            }
        }

        for (Request request : requestsToUpdate) {
            setRequestStatus(request);
        }
    }

    public Request setRequestStatus(Request request) {
        String sqlInsertStatus = """
                UPDATE bnd_object_rubricator bor
                SET rubr_id = ?
                WHERE bor.object_id = ?
                    AND bor.type_id = ?""";

        String sqlInsertRequestClosedAt = """
                UPDATE obj_requests
                SET closed_at = ?
                WHERE obj_requests.id = ?
                """;

        String sqlGetStatusName = """
                SELECT rrs.name
                FROM rubr_request_statuses rrs
                JOIN bnd_object_rubricator bor ON bor.rubr_id = rrs.id
                WHERE bor.object_id = ?
                    AND bor.type_id = ?""";

        jdbcTemplate.update(sqlInsertStatus, request.getStatusId(), request.getId(), BND_REQUEST_STATUS);
        jdbcTemplate.update(sqlInsertRequestClosedAt, request.getClosedAt(), request.getId());
        request.setStatusName(jdbcTemplate.queryForObject(sqlGetStatusName, String.class, request.getId(), BND_REQUEST_STATUS));


        return request;
    }

    public void deleteNotTest() {
        String sql = "DELETE FROM obj_metadata WHERE id NOT BETWEEN 1 AND 9";
        jdbcTemplate.update(sql);
    }
}