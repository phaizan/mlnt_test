-- ==============================================
-- Скрипт: V3__rubr_unique.sql
-- Назначение: Сделать поле name в
-- рубрикаторах уникальным
-- ==============================================

ALTER TABLE rubr_user_roles
    ADD CONSTRAINT rubr_user_roles_name_uq UNIQUE (name);
ALTER TABLE rubr_equipment_nomenclatures
    ADD CONSTRAINT rubr_equipment_nomenclatures_name_uq UNIQUE (name);
ALTER TABLE rubr_request_statuses
    ADD CONSTRAINT rubr_request_statuses_name_uq UNIQUE (name);
ALTER TABLE bnd_object_object_type
    ADD CONSTRAINT bnd_object_object_type_name_uq UNIQUE (name);
ALTER TABLE bnd_object_rubricator_type
    ADD CONSTRAINT bnd_object_rubricator_type_name_uq UNIQUE (name);