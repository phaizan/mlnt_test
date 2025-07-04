-- ==============================================
-- Скрипт: V1__create_tables.sql
-- Назначение: Создание структуры БД
-- ==============================================

CREATE SEQUENCE seq_global_object_id;

-- Перечень таблиц, хранящих объекты
CREATE TABLE table_object_type
(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

INSERT INTO table_object_type(id, name) VALUES
                                            (1, 'obj_users'),
                                            (2, 'obj_equipments'),
                                            (3, 'obj_requests'),
                                            (4, 'obj_request_equipments');

-- Список объектов всех типов
CREATE TABLE obj_metadata
(
    id SERIAL PRIMARY KEY,
    obj_type_id int NOT NULL,

    CONSTRAINT obj_type_id_fk FOREIGN KEY (obj_type_id) REFERENCES table_object_type(id)
);



CREATE TABLE obj_users
(
    id INT PRIMARY KEY DEFAULT nextval('seq_global_object_id'),
    name VARCHAR(50) NOT NULL,
    login VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Таблица ТМЦ
CREATE TABLE obj_equipments
(
    id INT PRIMARY KEY DEFAULT nextval('seq_global_object_id'),
    amount INT NOT NULL
);

CREATE TABLE obj_requests
(
    id INT PRIMARY KEY DEFAULT nextval('seq_global_object_id'),
    created_at TIMESTAMP NOT NULL,
    closed_at TIMESTAMP
);

CREATE TABLE obj_request_equipments
(
    id INT PRIMARY KEY DEFAULT nextval('seq_global_object_id'),
    amount INT NOT NULL,
    closed_at TIMESTAMP
);

-- Перечень всех рубрикаторов
CREATE TABLE rubr_list
(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

INSERT INTO rubr_list(id, name) VALUES
                                    (1, 'rubr_user_roles'),
                                    (2, 'rubr_equipment_nomenclatures'),
                                    (3, 'rubr_request_statuses');

CREATE TABLE rubr_user_roles
(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE rubr_equipment_nomenclatures
(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE rubr_request_statuses
(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

-- Таблицы связей
CREATE TABLE bnd_object_object_type
(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE bnd_object_object
(
    id SERIAL PRIMARY KEY,
    main_object_id INT NOT NULL,
    secondary_object_id INT NOT NULL,
    type_id INT NOT NULL,

    CONSTRAINT main_object_id_fk FOREIGN KEY (main_object_id) REFERENCES obj_metadata(id) ,
    CONSTRAINT secondary_object_id_fk FOREIGN KEY (secondary_object_id) REFERENCES obj_metadata(id) ,
    CONSTRAINT type_id_fk FOREIGN KEY (type_id) REFERENCES bnd_object_object_type(id)
);

CREATE TABLE bnd_object_rubricator_type
(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE bnd_object_rubricator
(
    id SERIAL PRIMARY KEY,
    object_id INT NOT NULL,
    rubr_id INT NOT NULL,
    rubr_list_id INT NOT NULL,
    type_id INT NOT NULL,

    CONSTRAINT object_id_fk FOREIGN KEY (object_id) REFERENCES obj_metadata(id),
    CONSTRAINT rubr_list_id_fk FOREIGN KEY (rubr_list_id) REFERENCES rubr_list(id),
    CONSTRAINT type_id_fk FOREIGN KEY (type_id) REFERENCES bnd_object_rubricator_type(id)
);