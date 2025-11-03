-- ================================================
-- MIGRACIÓN 020: Add current_enemy to dungeon_progress
-- ================================================
-- Fecha: 2025-01-29
-- Descripción: Añadir campo current_enemy JSONB para
--              guardar el estado del enemigo actual
-- ================================================

-- Añadir columna current_enemy
ALTER TABLE dungeon_progress 
  ADD COLUMN IF NOT EXISTS current_enemy JSONB;

-- Comentario
COMMENT ON COLUMN dungeon_progress.current_enemy IS 'Estado del enemigo actual en formato JSON';

-- ================================================
-- Comentario final
-- ================================================
DO $$
BEGIN
  RAISE NOTICE 'Migración 020 completada: current_enemy añadido a dungeon_progress';
END $$;

