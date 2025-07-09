package org.mlnt.mlnt_test.api;

import lombok.RequiredArgsConstructor;
import org.mlnt.mlnt_test.entity.Equipment;
import org.mlnt.mlnt_test.entity.Request;
import org.mlnt.mlnt_test.entity.RequestEquipment;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

//TODO сделать чтобы статусы обновлялись
//TODO добавить проверку на дубликаты при добавлении заявки

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

            ORDER BY obr.id""";

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
                    .setRequestEquipments(requestEquipments);

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
                        .setCreatedAt(request.getCreatedAt());

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

            processRequest(request);

            return request;
        } catch (DataAccessException e) {
            throw new IllegalStateException("Ошибка при доступе к базе данных" + e);
        }
    }

    public void processRequest (Request request) {

        List<Integer> nomenclaturesIds = new ArrayList<>();
        for (RequestEquipment requestEquipment : request.getRequestEquipments()) {
            nomenclaturesIds.add(requestEquipment.getNomenclatureId());
        }
        String inSql = nomenclaturesIds.stream().map(id -> "?").collect(Collectors.joining(",", "(", ")"));

        String sql = """
                SELECT oe.id AS id, ren.id AS nomenclatureId, oe.amount 
                
                FROM obj_equipments oe
                JOIN bnd_object_rubricator bor ON bor.id = oe.id
                JOIN bnd_object_rubricator_type bort ON bor.type_id = bort.id
                JOIN rubr_equipment_nomenclatures ren ON ren.id = bor.rubr_id
                
                WHERE bort.name = 'Номенклатура ТМЦ'
                    AND bor.rubr_list_id = 2
                    AND ren.id IN""" + inSql;

        Map<Integer, Equipment> equipment = jdbcTemplate.query(
                sql,
                nomenclaturesIds.toArray(),
                rs -> {
                    Map<Integer, Equipment> map = new HashMap<>();
                    while (rs.next()) {
                        Equipment eq = new Equipment()
                                .setId(rs.getInt("id"))
                                .setNomenclatureId(rs.getInt("nomenclatureId"))
                                .setAmount(rs.getInt("amount"));
                        map.put(eq.getNomenclatureId(), eq);
                    }
                    return map;
                }
        );

        List<RequestEquipment> requestEquipment = request.getRequestEquipments();

        boolean isRequestCompleted = true;

        for (RequestEquipment re : requestEquipment) {
            Equipment eq = equipment.get(re.getNomenclatureId());
            if (eq != null) {
                if (re.getAmount() <= eq.getAmount()) {
                    eq.setAmount(eq.getAmount() - re.getAmount());
                    equipmentApi.updateEquipment(eq);
                    re.setStatusId(REQUEST_STATUS_COMPLETED);
                }
                else
                {
                    re.setStatusId(REQUEST_STATUS_ACCEPTED);
                    request.setStatusId(REQUEST_STATUS_ACCEPTED);
                }
            }
            else {
                throw new NoSuchElementException("Ошибка при обработке запроса");
            }
        }
        if (request.getStatusId() == 0) {
            request.setStatusId(REQUEST_STATUS_COMPLETED);
        }
        request = setRequestStatuses(request);

    }

    public Request setRequestStatuses (Request request) {
        String sqlInsertStatus = """
                UPDATE bnd_object_rubricator bor
                SET rubr_id = ?
                WHERE bor.object_id = ?
                    AND bor.type_id = ?""";

        String getStatusName = """
                SELECT rrs.name
                FROM rubr_request_statuses rrs
                JOIN bnd_object_rubricator bor ON bor.rubr_id = rrs.id
                WHERE bor.object_id = ?
                    AND bor.type_id = ?""";

        jdbcTemplate.update(sqlInsertStatus, request.getStatusId(), request.getId(), BND_REQUEST_STATUS);
        request.setStatusName(jdbcTemplate.queryForObject(getStatusName, String.class, request.getId(), BND_REQUEST_STATUS));

        for (RequestEquipment rE : request.getRequestEquipments()) {
            jdbcTemplate.update(sqlInsertStatus, rE.getStatusId(), rE.getId(), BND_REQUEST_EQUIPMENT_STATUS);
            rE.setStatusName(jdbcTemplate.queryForObject(getStatusName, String.class, rE.getId(), BND_REQUEST_EQUIPMENT_STATUS));
        }
        return request;
    }

}