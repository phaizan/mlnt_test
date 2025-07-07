package org.mlnt.mlnt_test.api;

import lombok.RequiredArgsConstructor;
import org.mlnt.mlnt_test.entity.Request;
import org.mlnt.mlnt_test.entity.RequestEquipment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

//TODO из obj_metadata не удаляются старые объекты


@Service
@RequiredArgsConstructor
public class RequestApi {

    private final JdbcTemplate jdbcTemplate;

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
                obr.closed_at AS equipment_closed
            
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
            """;

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



}