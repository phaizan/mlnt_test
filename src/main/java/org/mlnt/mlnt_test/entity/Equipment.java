package org.mlnt.mlnt_test.entity;

import lombok.Data;
import lombok.experimental.Accessors;

/**
 * ИО ТМЦ
 */
@Data
@Accessors(chain = true)
public class Equipment {
    /**
     * Уникальный идентификатор
     */
    private int id;
    /**
     * Уникальный индетификатор номенклатуры
     */
    private int nomenclatureId;
    /**
     * Номенклатурное наименование
     */
    private String name;
    /**
     * Количество
     */
    private int amount;
}
