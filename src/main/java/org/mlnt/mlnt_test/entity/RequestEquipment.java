package org.mlnt.mlnt_test.entity;

import lombok.Data;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;

/**
 * ИО позиция заявки
 */
@Data
@Accessors(chain = true)
public class RequestEquipment {
    /**
     * Уникальный индетификатор
     */
    private int id;
    /**
     * Уникальный индетификатор номенклатуры
     */
    private int nomenclatureId;
    /**
     * Дата и время создания заявки на ТМЦ(совпадает с датой и временем создания заявки)
     */
    private LocalDateTime createdAt;
    /**
     * Дата и время выдачи позиции ТМЦ
     */
    private LocalDateTime closedAt;
    /**
     * Номенклатурное наименование
     */
    private String name;
    /**
     * Количество
     */
    private int amount;
    /**
     * Уникальный идентификатор статуса позиции заявки
     */
    private int statusId;
    /**
     * Статус позиции заявки
     */
    private String statusName;
}
