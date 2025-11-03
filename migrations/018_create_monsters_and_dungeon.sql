-- ================================================
-- MIGRACIÓN 018: Sistema de Monstruos y Dungeon
-- ================================================
-- Fecha: 2025-01-28
-- Descripción: Tabla de monstruos y sistema de dungeon con
--              escalado progresivo por nivel y piso
-- ================================================

-- ============================================
-- TABLA: monsters
-- ============================================
-- Catálogo de monstruos disponibles
CREATE TABLE IF NOT EXISTS monsters (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(10), -- emoji o identificador del icono
  
  -- Stats base (nivel 1)
  base_hp INTEGER NOT NULL DEFAULT 100,
  base_attack INTEGER NOT NULL DEFAULT 10,
  base_defense INTEGER NOT NULL DEFAULT 5,
  base_speed INTEGER NOT NULL DEFAULT 1,
  base_wisdom INTEGER NOT NULL DEFAULT 1,
  base_crit_chance INTEGER NOT NULL DEFAULT 1,
  
  -- Escalado por nivel (crecimiento por nivel)
  hp_per_level INTEGER NOT NULL DEFAULT 50,
  attack_per_level INTEGER NOT NULL DEFAULT 5,
  defense_per_level INTEGER NOT NULL DEFAULT 3,
  speed_per_level INTEGER NOT NULL DEFAULT 0,
  wisdom_per_level INTEGER NOT NULL DEFAULT 0,
  crit_chance_per_level INTEGER NOT NULL DEFAULT 0,
  
  -- Variante del monstruo
  variant VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (variant IN ('normal', 'elite', 'boss')),
  
  -- Multiplicadores de piso (porcentaje extra por piso)
  floor_hp_multiplier DECIMAL(5,2) NOT NULL DEFAULT 1.00,
  floor_attack_multiplier DECIMAL(5,2) NOT NULL DEFAULT 1.00,
  floor_defense_multiplier DECIMAL(5,2) NOT NULL DEFAULT 1.00,
  
  -- Buffs y debuffs (JSON opcional para futuras mecánicas)
  special_abilities JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_monsters_code ON monsters(code);
CREATE INDEX IF NOT EXISTS idx_monsters_variant ON monsters(variant);

-- Comentarios
COMMENT ON TABLE monsters IS 'Catálogo de monstruos del dungeon';
COMMENT ON COLUMN monsters.code IS 'Código único del monstruo (ej: SLIME_BASIC)';
COMMENT ON COLUMN monsters.base_hp IS 'HP base del monstruo (nivel 1)';
COMMENT ON COLUMN monsters.hp_per_level IS 'HP adicional por cada nivel';
COMMENT ON COLUMN monsters.variant IS 'Variante: normal, elite, boss';
COMMENT ON COLUMN monsters.floor_hp_multiplier IS 'Multiplicador de HP por piso (ej: 1.15 = +15% por piso)';
COMMENT ON COLUMN monsters.special_abilities IS 'Habilidades especiales en formato JSON';

-- ============================================
-- TABLA: dungeon_progress
-- ============================================
-- Progreso del usuario en el dungeon
CREATE TABLE IF NOT EXISTS dungeon_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Estado actual
  current_floor INTEGER NOT NULL DEFAULT 1,
  current_hp INTEGER NOT NULL DEFAULT 100,
  
  -- Progreso de la run actual
  enemies_defeated INTEGER NOT NULL DEFAULT 0,
  total_exp_earned INTEGER NOT NULL DEFAULT 0,
  items_found INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Bandera de run activa
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_dungeon_progress_user ON dungeon_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_dungeon_progress_active ON dungeon_progress(user_id, is_active) WHERE is_active = TRUE;

-- Comentarios
COMMENT ON TABLE dungeon_progress IS 'Progreso del usuario en el dungeon';
COMMENT ON COLUMN dungeon_progress.current_hp IS 'HP actual del usuario en la run';
COMMENT ON COLUMN dungeon_progress.is_active IS 'Si la run está activa (HP > 0)';

-- ============================================
-- FUNCIÓN: Calcular stats del monstruo
-- ============================================
CREATE OR REPLACE FUNCTION calculate_monster_stats(
  monster_code VARCHAR,
  monster_level INTEGER,
  floor_number INTEGER
)
RETURNS TABLE (
  hp INTEGER,
  attack INTEGER,
  defense INTEGER,
  speed INTEGER,
  wisdom INTEGER,
  crit_chance INTEGER
) AS $$
DECLARE
  monster_record RECORD;
  hp_calc INTEGER;
  attack_calc INTEGER;
  defense_calc INTEGER;
BEGIN
  SELECT * INTO monster_record FROM monsters WHERE code = monster_code;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Monstruo % no encontrado', monster_code;
  END IF;
  
  -- Calcular stats con escalado por nivel y piso
  hp_calc := FLOOR(
    (monster_record.base_hp + (monster_level - 1) * monster_record.hp_per_level) * 
    POWER(monster_record.floor_hp_multiplier, floor_number - 1)
  );
  
  attack_calc := FLOOR(
    (monster_record.base_attack + (monster_level - 1) * monster_record.attack_per_level) * 
    POWER(monster_record.floor_attack_multiplier, floor_number - 1)
  );
  
  defense_calc := FLOOR(
    (monster_record.base_defense + (monster_level - 1) * monster_record.defense_per_level) * 
    POWER(monster_record.floor_defense_multiplier, floor_number - 1)
  );
  
  RETURN QUERY SELECT
    hp_calc,
    attack_calc,
    defense_calc,
    monster_record.base_speed + (monster_level - 1) * monster_record.speed_per_level,
    monster_record.base_wisdom + (monster_level - 1) * monster_record.wisdom_per_level,
    monster_record.base_crit_chance + (monster_level - 1) * monster_record.crit_chance_per_level;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- INSERTAR MONSTRUOS INICIALES
-- ============================================
-- 4 monstruos con diferentes roles y dificultad

-- SLIME (Tanque débil, lento)
INSERT INTO monsters (
  code, name, description, icon,
  base_hp, base_attack, base_defense, base_speed, base_wisdom, base_crit_chance,
  hp_per_level, attack_per_level, defense_per_level,
  variant, floor_hp_multiplier, floor_attack_multiplier, floor_defense_multiplier
) VALUES (
  'SLIME_BASIC',
  'Slime',
  'Una masa gelatinosa que se arrastra lentamente. Aunque es débil, puede sobrevivir varios golpes gracias a su cuerpo flexible.',
  '🟢',
  150,  -- HP base
  8,    -- ATK base
  3,    -- DEF base
  1,    -- SPD base
  1,    -- WIS base
  2,    -- CRT base
  75,   -- HP por nivel
  3,    -- ATK por nivel
  2,    -- DEF por nivel
  'normal',
  1.10, -- +10% HP por piso
  1.05, -- +5% ATK por piso
  1.05  -- +5% DEF por piso
) ON CONFLICT (code) DO NOTHING;

-- GOBLIN (Ataque rápido, poco HP)
INSERT INTO monsters (
  code, name, description, icon,
  base_hp, base_attack, base_defense, base_speed, base_wisdom, base_crit_chance,
  hp_per_level, attack_per_level, defense_per_level,
  variant, floor_hp_multiplier, floor_attack_multiplier, floor_defense_multiplier
) VALUES (
  'GOBLIN_SCOUT',
  'Goblin',
  'Un pequeño duende agresivo y ágil. Ataca rápido pero es muy frágil. Sus emboscadas sorprenden a los desprevenidos.',
  '👹',
  80,   -- HP base
  15,   -- ATK base
  2,    -- DEF base
  3,    -- SPD base
  1,    -- WIS base
  5,    -- CRT base (goblins críticos)
  40,   -- HP por nivel
  7,    -- ATK por nivel
  1,    -- DEF por nivel
  'normal',
  1.05, -- +5% HP por piso
  1.10, -- +10% ATK por piso
  1.02  -- +2% DEF por piso
) ON CONFLICT (code) DO NOTHING;

-- SKELETON (Balanceado)
INSERT INTO monsters (
  code, name, description, icon,
  base_hp, base_attack, base_defense, base_speed, base_wisdom, base_crit_chance,
  hp_per_level, attack_per_level, defense_per_level,
  variant, floor_hp_multiplier, floor_attack_multiplier, floor_defense_multiplier
) VALUES (
  'SKELETON_WARRIOR',
  'Skeleton',
  'Los restos de un antiguo guerrero. Mantiene algo de su destreza y armadura, siendo un oponente balanceado y predecible.',
  '💀',
  120,  -- HP base
  12,   -- ATK base
  8,    -- DEF base
  2,    -- SPD base
  2,    -- WIS base
  3,    -- CRT base
  60,   -- HP por nivel
  5,    -- ATK por nivel
  4,    -- DEF por nivel
  'normal',
  1.08, -- +8% HP por piso
  1.07, -- +7% ATK por piso
  1.08  -- +8% DEF por piso
) ON CONFLICT (code) DO NOTHING;

-- ORC (Tanque fuerte)
INSERT INTO monsters (
  code, name, description, icon,
  base_hp, base_attack, base_defense, base_speed, base_wisdom, base_crit_chance,
  hp_per_level, attack_per_level, defense_per_level,
  variant, floor_hp_multiplier, floor_attack_multiplier, floor_defense_multiplier
) VALUES (
  'ORC_BRUTE',
  'Orc',
  'Un bárbaro masivo con una armadura improvisada. Aunque lento, sus golpes pueden partir la armadura de un enemigo.',
  '🦹',
  200,  -- HP base
  14,   -- ATK base
  12,   -- DEF base
  1,    -- SPD base
  1,    -- WIS base
  2,    -- CRT base
  100,  -- HP por nivel
  6,    -- ATK por nivel
  5,    -- DEF por nivel
  'elite',
  1.12, -- +12% HP por piso
  1.08, -- +8% ATK por piso
  1.12  -- +12% DEF por piso
) ON CONFLICT (code) DO NOTHING;

-- ============================================
-- TRIGGER: Actualizar last_updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_dungeon_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_dungeon_progress_timestamp
  BEFORE UPDATE ON dungeon_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_dungeon_progress_timestamp();

-- ============================================
-- Comentario final
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'Migración 018 completada: Sistema de monstruos y dungeon creado';
  RAISE NOTICE '  - Tabla monsters creada con escalado por nivel y piso';
  RAISE NOTICE '  - Tabla dungeon_progress creada para guardar estado';
  RAISE NOTICE '  - Función calculate_monster_stats para stats dinámicos';
  RAISE NOTICE '  - 4 monstruos iniciales insertados (Slime, Goblin, Skeleton, Orc)';
END $$;

