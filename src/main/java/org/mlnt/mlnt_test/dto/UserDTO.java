package org.mlnt.mlnt_test.dto;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class UserDTO {
        private int id;
        private String name;
        private int roleId;
}
