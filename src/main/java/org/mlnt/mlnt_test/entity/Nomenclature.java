package org.mlnt.mlnt_test.entity;


import lombok.Data;
import lombok.experimental.Accessors;

/**
 * Рубрикатор номенклатура
 */
@Data
@Accessors(chain = true)
public class Nomenclature {
    /**
     * Уникальный индетификатор
     */
    private int id;
    /**
     * Наименование
     */
    private String name;
}
