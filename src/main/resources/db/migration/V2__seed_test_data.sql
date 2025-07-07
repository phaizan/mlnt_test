-- ==============================================
-- Скрипт: V2__seed_test_data.sql
-- Назначение: Создание структуры БД
-- ==============================================

INSERT INTO obj_metadata (id, obj_type_id) VALUES
                                               (1, 1),  -- пользователь
                                               (2, 2),
                                               (3, 2),
                                               (4, 2),
                                               (5, 2),
                                               (6, 3),  -- заявка
                                               (7, 4),
                                               (8, 4),
                                               (9, 4);


INSERT INTO obj_users (id, name, login, password) VALUES
                                                  (1, 'Иванов Иван Иванович', 'vanek@ya.ru', 'theBestPasswordEver');

INSERT INTO obj_equipments (id, amount) VALUES
                                        (2, 5),
                                        (3, 3),
                                        (4, 1),
                                        (5, 8);

INSERT INTO obj_requests (id, created_at) VALUES
                                          (6, '2025-07-02 14:30:00');


INSERT INTO obj_request_equipments (id, amount, closed_at) VALUES
                                                           (7,2, '2025-07-02 15:00:00'),
                                                           (8,1, '2025-07-02 15:00:00');

INSERT INTO obj_request_equipments (id, amount) VALUES
                                                (9, 10);

INSERT INTO rubr_user_roles (name) VALUES
                                       ('Сотрудник'),
                                       ('Кладовщик'),
                                       ('Администратор');

INSERT INTO rubr_equipment_nomenclatures (name) VALUES
                                                    ('Бумага'),
                                                    ('Карандаш'),
                                                    ('Маркер'),
                                                    ('Ноутбук');

INSERT INTO rubr_request_statuses (name) VALUES
                                             ('Принята'),
                                             ('Исполнена');


INSERT INTO bnd_object_object_type (name) VALUES
                                              ('Пользователь создал заявку'),
                                              ('Заявка содержит позицию');

INSERT INTO bnd_object_object (main_object_id, secondary_object_id, type_id) VALUES
                                                                                 (1, 6, 1),
                                                                                 (6, 7, 2),
                                                                                 (6, 8, 2),
                                                                                 (6, 9, 2);

INSERT INTO bnd_object_rubricator_type (name) VALUES
                                                  ('Роль пользватaafеля'),
                                                  ('Номенклатура ТМЦ'),
                                                  ('Статус заявки'),
                                                  ('Статус позиции в заявке');

INSERT INTO bnd_object_rubricator (object_id, rubr_list_id, rubr_id, type_id) VALUES
                                                                                  (1,1, 1, 1),
                                                                                  (2,2, 1, 2),
                                                                                  (3,2, 2, 2),
                                                                                  (4,2, 3, 2),
                                                                                  (5,2, 4, 2),
                                                                                  (6,3, 1, 3),
                                                                                  (7,2, 1, 2), --Бумага
                                                                                  (8,2, 2, 2), --Карандаш
                                                                                  (9,2, 4, 2), --Ноутбук
                                                                                  (7,3, 2, 4),
                                                                                  (8,3, 2, 4),
                                                                                  (9,3, 1, 4);