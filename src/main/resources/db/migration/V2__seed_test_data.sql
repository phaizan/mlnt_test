-- ==============================================
-- Скрипт: V2__seed_test_data.sql
-- Назначение: Создание структуры БД
-- ==============================================




INSERT INTO obj_metadata (obj_type_id) VALUES
                                           (1),
                                           (2),
                                           (2),
                                           (2),
                                           (2),
                                           (3),
                                           (4),
                                           (4),
                                           (4);

INSERT INTO obj_users (name, login, password) VALUES
                                                  ('Иванов Иван Иванович', 'vanek@ya.ru', 'theBestPasswordEver');

INSERT INTO obj_equipments (amount) VALUES
                                        (5),
                                        (3),
                                        (1),
                                        (8);

INSERT INTO obj_requests (created_at) VALUES
                                          ('2025-07-02 14:30:00');


INSERT INTO obj_request_equipments (amount, closed_at) VALUES
                                                           (2, '2025-07-02 15:00:00'),
                                                           (1, '2025-07-02 15:00:00');

INSERT INTO obj_request_equipments (amount) VALUES
                                                (10);

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
                                                  ('Роль пользвателя'),
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
                                                                                  (7,2, 1, 2),
                                                                                  (8,2, 2, 2),
                                                                                  (9,2, 3, 2),
                                                                                  (7,3, 2, 4),
                                                                                  (8,3, 2, 4),
                                                                                  (9,3, 1, 4);