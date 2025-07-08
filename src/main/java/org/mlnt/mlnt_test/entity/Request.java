package org.mlnt.mlnt_test.entity;

import lombok.Data;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;
import java.util.List;

//TODO нужно ли поле status name?

/**
 * ИО заявка
 */
@Data
@Accessors(chain = true)
public class Request {
    /**
     * Уникальный идентификатор
     */
    private int id;
    /**
     * Создатель заявки
     */
    private int userId;
    /**
     * Список позиций ТМЦ
     */
    private List<RequestEquipment> requestEquipments;
    /**
     * Дата и время создания заявки
     */
    private LocalDateTime createdAt;
    /**
     * Дата и время закрытия заявки
     */
    private LocalDateTime closedAt;
    /**
     * Уникальный идентификатор статуса позиции заявки
     */
    private int statusId;
    /**
     * Статус позиции заявки
     */
    private String statusName;
}