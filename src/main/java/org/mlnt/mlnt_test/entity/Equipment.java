package org.mlnt.mlnt_test.entity;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class Equipment {
    private int id;
    private String name;
    private int amount;
}
