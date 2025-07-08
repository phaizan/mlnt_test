package org.mlnt.mlnt_test.dto;

import lombok.Data;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;

@Data
@Accessors(chain = true)
public class RequestEquipmentDTO {
    private String name;
    private int amount;
    private LocalDateTime createdAt;
    private LocalDateTime closedAt;
    private String statusName;
}
