package org.mlnt.mlnt_test.entity;

import lombok.Data;
import lombok.experimental.Accessors;

//TODO документацию

@Data
@Accessors(chain = true)
public class Equipment {
    private int id;
    private int nomenclatureId;
    /**
     * Номенклатурное наименование
     */
    private String name;
    private int amount;
}
