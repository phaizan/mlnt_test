-- ==============================================
-- Скрипт: V3__add_metadata_fk.sql
-- Назначение: Связывание obj_metadata с
-- остальными объектными таблицами
-- ==============================================

-- Связываем obj_users с obj_metadata
ALTER TABLE obj_users
    ADD CONSTRAINT id_fk FOREIGN KEY (id) REFERENCES obj_metadata(id) ON DELETE CASCADE;

-- Связываем obj_equipments с obj_metadata
ALTER TABLE obj_equipments
    ADD CONSTRAINT id_fk FOREIGN KEY (id) REFERENCES obj_metadata(id) ON DELETE CASCADE;

-- Связываем obj_requests с obj_metadata
ALTER TABLE obj_requests
    ADD CONSTRAINT id_fk FOREIGN KEY (id) REFERENCES obj_metadata(id) ON DELETE CASCADE;

-- Связываем obj_request_equipments с obj_metadata
ALTER TABLE obj_request_equipments
    ADD CONSTRAINT id_fk FOREIGN KEY (id) REFERENCES obj_metadata(id) ON DELETE CASCADE;