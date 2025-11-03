-- ================================================
-- MIGRACIÓN 019: Fix dungeon_progress items_found
-- ================================================
-- Fecha: 2025-01-29
-- Descripción: Cambiar items_found de INTEGER a JSONB
--              para guardar info de enemigos y loot
-- ================================================

-- Cambiar tipo de items_found a JSONB
-- Paso 1: Eliminar el default actual
ALTER TABLE dungeon_progress 
  ALTER COLUMN items_found DROP DEFAULT;

-- Paso 2: Cambiar tipo
ALTER TABLE dungeon_progress 
  ALTER COLUMN items_found TYPE JSONB USING COALESCE(items_found::text::jsonb, '[]'::jsonb);

-- Paso 3: Restaurar default como JSONB
ALTER TABLE dungeon_progress 
  ALTER COLUMN items_found SET DEFAULT '[]'::jsonb;

-- Comentario actualizado
COMMENT ON COLUMN dungeon_progress.items_found IS 'Lista de items encontrados en formato JSON';

-- ================================================
-- Comentario final
-- ================================================
DO $$
BEGIN
  RAISE NOTICE 'Migración 019 completada: items_found cambiado a JSONB';
END $$;

