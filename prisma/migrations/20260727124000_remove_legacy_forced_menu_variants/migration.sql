-- Remove forced legacy size rows created before variants became optional.
-- Requested seed variants use display names such as Normal and Full.
DELETE FROM "MenuItemVariant"
WHERE "name" IN ('NORMAL', 'FULL');
