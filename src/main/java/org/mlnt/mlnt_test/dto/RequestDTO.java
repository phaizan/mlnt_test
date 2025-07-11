package org.mlnt.mlnt_test.dto;

import lombok.Data;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Accessors(chain = true)
public class RequestDTO {
    private int statusName;
    private LocalDateTime createdAt;
    private LocalDateTime closedAt;
    private List<RequestEquipmentDTO> requestEquipmentDTOS;
}
