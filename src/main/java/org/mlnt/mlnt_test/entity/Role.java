package org.mlnt.mlnt_test.entity;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class Role {
    private int id;
    private String name;
}
