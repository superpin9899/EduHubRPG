import { useState, useEffect, useMemo, useRef } from 'react';
import 'nes.css/css/nes.min.css';

interface Monster {
  id: number;
  code: string;
  name: string;
  description: string;
  icon: string;
  base_hp: number;
  base_attack: number;
  base_defense: number;
  base_speed: number;
  base_wisdom: number;
  base_crit_chance: number;
  hp_per_level: number;
  attack_per_level: number;
  defense_per_level: number;
  speed_per_level: number;
  wisdom_per_level: number;
  crit_chance_per_level: number;
  variant: string;
  floor_hp_multiplier: number;
  floor_attack_multiplier: number;
  floor_defense_multiplier: number;
}

interface Enemy {
  id: string;
  name: string;
  icon: string;
  maxHp: number;
  currentHp: number;
  level: number;
  attack: number;
  defense: number;
  speed: number;
  wisdom: number;
  crit_chance: number;
  description: string;
  code: string;
}

interface UserStats {
  attack: number;
  defense: number;
  hp: number;
  speed: number;
  wisdom: number;
  crit_chance: number;
}

interface UserItem {
  id: number;
  item_id: number;
  quantity: number;
  equipped: boolean;
  items: {
    id: number;
    code: string;
    name: string;
    description: string;
    icon_url: string;
    type: string;
    slot_type?: string;
    rarity: string;
    attack: number;
    defense: number;
    hp: number;
    speed: number;
    wisdom: number;
    crit_chance: number;
  };
}

interface DungeonsProps {
  userData: any;
  onBack: () => void;
}

export default function Dungeons({ userData, onBack }: DungeonsProps) {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userItems, setUserItems] = useState<UserItem[]>([]);
  const [currentHp, setCurrentHp] = useState<number | null>(null);
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [isInCombat, setIsInCombat] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [currentFloor] = useState(1); // TODO: implementar cambio de piso
  const [enemiesDefeated, setEnemiesDefeated] = useState(0);
  const [progressLoadedFromDB, setProgressLoadedFromDB] = useState(false);
  const [savedProgress, setSavedProgress] = useState<any>(null);
  
  // Ref para acceder al valor actual de isPlayerTurn sin closures
  const isPlayerTurnRef = useRef(true);
  const isInCombatRef = useRef(false);
  
  // URLs de funciones serverless
  const API_BASE = import.meta.env.VITE_NETLIFY_SITE_URL 
    ? `${import.meta.env.VITE_NETLIFY_SITE_URL}/.netlify/functions` 
    : '/.netlify/functions';

  // Cargar stats, items y monstruos
  useEffect(() => {
    const loadUserData = async () => {
      if (!userData?.id) return;
      
      try {
        const [statsResponse, itemsResponse, monstersResponse, progressResponse] = await Promise.all([
          fetch(`${API_BASE}/getUserStats?userId=${userData.id}`),
          fetch(`${API_BASE}/getUserItems?userId=${userData.id}`),
          fetch(`${API_BASE}/getMonsters?variant=normal`),
          fetch(`${API_BASE}/getDungeonProgress?userId=${userData.id}`)
        ]);
        
        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          if (stats) setUserStats(stats);
        }
        
        if (itemsResponse.ok) {
          const items = await itemsResponse.json();
          if (items) setUserItems(items);
        }

        if (monstersResponse.ok) {
          const monstersData = await monstersResponse.json();
          if (monstersData) setMonsters(monstersData);
        }

        // Cargar progreso guardado de la dungeon
        if (progressResponse.ok) {
          const progress = await progressResponse.json();
          console.log('📥 Progreso cargado:', progress);
          if (progress && progress.is_active) {
            // Cargar estado guardado
            setCurrentHp(progress.current_hp);
            // TODO: setCurrentFloor(progress.current_floor);
            // TODO: setEnemiesDefeated(progress.enemies_defeated);
            setSavedProgress(progress);
            setProgressLoadedFromDB(true);
          } else {
            // Marcar explícitamente que no hay progreso
            setSavedProgress({});
          }
        } else {
          // Si falla la respuesta, marcar como sin progreso
          setSavedProgress({});
        }
      } catch (error) {
        console.error('❌ Error cargando datos:', error);
      }
    };

    loadUserData();
  }, [userData?.id]);

  // Calcular stats totales del usuario (stats base + items equipados)
  const totalStats = useMemo(() => {
    if (!userStats) return { attack: 0, defense: 0, hp: 0, speed: 0, wisdom: 0, crit_chance: 0 };
    
    const equippedItems = userItems.filter(item => item.equipped);
    
    return equippedItems.reduce((totals, item) => {
      return {
        attack: totals.attack + item.items.attack,
        defense: totals.defense + item.items.defense,
        hp: totals.hp + item.items.hp,
        speed: totals.speed + item.items.speed,
        wisdom: totals.wisdom + item.items.wisdom,
        crit_chance: totals.crit_chance + item.items.crit_chance,
      };
    }, { 
      attack: userStats.attack, 
      defense: userStats.defense, 
      hp: userStats.hp, 
      speed: userStats.speed, 
      wisdom: userStats.wisdom, 
      crit_chance: userStats.crit_chance 
    });
  }, [userStats, userItems]);
  
  // Inicializar HP al máximo cuando totalStats está listo (solo si NO se cargó desde DB)
  useEffect(() => {
    if (!progressLoadedFromDB && totalStats.hp > 0 && (currentHp === null || currentHp !== totalStats.hp)) {
      setCurrentHp(totalStats.hp);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalStats.hp, progressLoadedFromDB]);

  // Seleccionar monstruo o cargar el guardado
  useEffect(() => {
    const selectOrLoadMonster = async () => {
      if (monsters.length === 0 || currentFloor !== 1) return;
      
      // Esperar a que se complete la carga de datos (incluyendo progreso)
      // Si savedProgress es null, significa que aún no se ha cargado nada
      // Si savedProgress es un objeto vacío {}, significa que no hay progreso guardado
      if (savedProgress === null) {
        console.log('⏳ Esperando carga de progreso...');
        return;
      }
      
      try {
        // Si hay progreso guardado con enemigo, cargarlo
        if (savedProgress && savedProgress.current_enemy) {
          const savedEnemy = savedProgress.current_enemy;
          console.log('📥 Cargando enemigo guardado:', savedEnemy);
          
          const enemy: Enemy = {
            id: savedEnemy.id,
            name: savedEnemy.name,
            icon: savedEnemy.icon,
            maxHp: savedEnemy.maxHp,
            currentHp: savedEnemy.currentHp,
            level: savedEnemy.level,
            attack: savedEnemy.attack,
            defense: savedEnemy.defense,
            speed: savedEnemy.speed,
            wisdom: savedEnemy.wisdom,
            crit_chance: savedEnemy.crit_chance,
            description: savedEnemy.description,
            code: savedEnemy.code
          };
          
          setCurrentEnemy(enemy);
          return;
        }
        
        // Si no hay progreso guardado, generar monstruo aleatorio
        console.log('🎲 Generando monstruo aleatorio (sin progreso guardado)');
        const randomMonster = monsters[Math.floor(Math.random() * monsters.length)];
        const monsterLevel = 1;
        
        const statsResponse = await fetch(
          `${API_BASE}/getMonsterStats?monsterCode=${randomMonster.code}&level=${monsterLevel}&floor=${currentFloor}`
        );
        
        if (statsResponse.ok) {
          const calculatedStats = await statsResponse.json();
          
          const enemy: Enemy = {
            id: randomMonster.code,
            name: randomMonster.name,
            icon: randomMonster.icon,
            maxHp: calculatedStats.hp,
            currentHp: calculatedStats.hp,
            level: monsterLevel,
            attack: calculatedStats.attack,
            defense: calculatedStats.defense,
            speed: calculatedStats.speed,
            wisdom: calculatedStats.wisdom,
            crit_chance: calculatedStats.crit_chance,
            description: randomMonster.description,
            code: randomMonster.code
          };
          
          setCurrentEnemy(enemy);
        }
      } catch (error) {
        console.error('❌ Error generando monstruo:', error);
      }
    };

    selectOrLoadMonster();
  }, [monsters, currentFloor, API_BASE, savedProgress]);

  const [selectedEnemy, setSelectedEnemy] = useState<Enemy | null>(null);

  // Sincronizar refs con states
  useEffect(() => {
    isPlayerTurnRef.current = isPlayerTurn;
  }, [isPlayerTurn]);
  
  useEffect(() => {
    isInCombatRef.current = isInCombat;
  }, [isInCombat]);

  const getHpPercentage = (current: number, max: number) => {
    return Math.max(0, (current / max) * 100);
  };

  // Guardar progreso automáticamente cuando cambia
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!userData?.id || currentHp === null) return;
      
      try {
        const progressData = {
          userId: userData.id,
          currentFloor,
          currentHp,
          enemiesDefeated,
          totalExpEarned: 0, // TODO: implementar EXP ganada
          itemsFound: [], // TODO: implementar items encontrados
          currentEnemy: currentEnemy || null
        };
        
        await fetch(`${API_BASE}/updateDungeonProgress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(progressData)
        });
        
        console.log('💾 Progreso guardado');
      } catch (error) {
        console.error('❌ Error guardando progreso:', error);
      }
    }, 2000); // Esperar 2 segundos después del último cambio
    
    return () => clearTimeout(timer);
  }, [currentHp, currentEnemy, currentFloor, enemiesDefeated, userData?.id, API_BASE]);

  // Iniciar combate cuando se selecciona un enemigo
  const handleStartCombat = () => {
    if (!currentEnemy || isInCombat) return;
    
    console.log('🟡 handleStartCombat INICIANDO');
    isInCombatRef.current = true;
    setIsInCombat(true);
    setCombatLog([`⚔️ ¡Combate iniciado contra ${currentEnemy.name}!`]);
    
    // Determinar quien ataca primero por SPEED
    const playerSpeed = totalStats.speed;
    const enemySpeed = currentEnemy.speed;
    console.log('⚡ Speed check', { playerSpeed, enemySpeed });
    
    if (playerSpeed > enemySpeed) {
      console.log('✅ Jugador ataca primero');
      isPlayerTurnRef.current = true;
      setIsPlayerTurn(true);
    } else if (playerSpeed < enemySpeed) {
      console.log('✅ Enemigo ataca primero, programando timeout');
      isPlayerTurnRef.current = false;
      setIsPlayerTurn(false);
      // Si el enemigo ataca primero, ejecutar su ataque
      setTimeout(() => handleEnemyAttack(), 500);
    } else {
      // Empate: random 50/50
      const goesFirst = Math.random() > 0.5;
      console.log('⚖️ Empate, random:', goesFirst ? 'Jugador' : 'Enemigo');
      isPlayerTurnRef.current = goesFirst;
      setIsPlayerTurn(goesFirst);
      if (!goesFirst) {
        setTimeout(() => handleEnemyAttack(), 500);
      }
    }
  };

  // Ataque del jugador
  const handlePlayerAttack = () => {
    if (!isPlayerTurn || !currentEnemy || !isInCombat) return;
    
    // Calcular daño base
    const baseDamage = Math.max(1, totalStats.attack - currentEnemy.defense);
    
    // Calcular crítico
    const isCrit = Math.random() * 100 < totalStats.crit_chance;
    const finalDamage = isCrit ? baseDamage * 2 : baseDamage;
    
    // Actualizar HP del enemigo
    const newEnemyHp = Math.max(0, currentEnemy.currentHp - finalDamage);
    setCurrentEnemy({ ...currentEnemy, currentHp: newEnemyHp });
    
    // Log
    const critText = isCrit ? ' ¡CRÍTICO!' : '';
    setCombatLog(prev => [...prev, 
      `Atacas a ${currentEnemy.name} por ${finalDamage} HP${critText}`
    ]);
    
    // Si el enemigo muere, victoria
    if (newEnemyHp === 0) {
      console.log('🎯 Enemigo derrotado! Llamando handleVictory');
      handleVictory();
      return;
    }
    
    // Pasar turno al enemigo
    isPlayerTurnRef.current = false;
    setIsPlayerTurn(false);
    // Usar un callback que NO dependa de isPlayerTurn del closure
    setTimeout(() => {
      handleEnemyAttack();
    }, 1000);
  };

  // Ataque del enemigo
  const handleEnemyAttack = () => {
    console.log('🔴 handleEnemyAttack llamado', { isInCombatRef: isInCombatRef.current, hasEnemy: !!currentEnemy });
    if (!currentEnemy || !isInCombatRef.current) {
      console.log('🔴 handleEnemyAttack ABORTADO - sin enemigo o combate');
      return;
    }
    
    console.log('🟢 handleEnemyAttack EJECUTANDO');
    // Calcular daño base recibido
    const baseDamage = Math.max(1, currentEnemy.attack - totalStats.defense);
    
    // Aplicar reducción por WISDOM
    const wisdomReduction = 1 - (totalStats.wisdom / 100);
    const finalDamage = Math.max(1, Math.floor(baseDamage * wisdomReduction));
    
    // Actualizar HP del jugador
    const newPlayerHp = Math.max(0, (currentHp || 0) - finalDamage);
    setCurrentHp(newPlayerHp);
    
    // Log
    setCombatLog(prev => [...prev, 
      `${currentEnemy.name} te ataca por ${finalDamage} HP`
    ]);
    
    // Si el jugador muere, game over
    if (newPlayerHp === 0) {
      handleGameOver();
      return;
    }
    
    // Devolver turno al jugador
    isPlayerTurnRef.current = true;
    setIsPlayerTurn(true);
  };

  // Victoria
  const handleVictory = () => {
    console.log('🎉 HANDLE VICTORY EJECUTANDO');
    const expGained = (currentEnemy?.level || 1) * 10;
    setCombatLog(prev => [...prev, 
      `🎉 ¡Victoria! Ganas ${expGained} EXP`
    ]);
    setEnemiesDefeated(prev => prev + 1);
    isInCombatRef.current = false;
    isPlayerTurnRef.current = true;
    setIsInCombat(false);
    setIsPlayerTurn(true);
    // TODO: Generar nuevo monstruo o avanzar piso
  };

  // Game Over
  const handleGameOver = () => {
    setCombatLog(prev => [...prev, '💀 GAME OVER - Has sido derrotado']);
    isInCombatRef.current = false;
    isPlayerTurnRef.current = true;
    setIsInCombat(false);
    setIsPlayerTurn(true);
    // TODO: Resetear HP y volver al inicio o mostrar pantalla de game over
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      `}</style>
      <div style={{
        width: '100%',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 100%)',
        padding: '20px',
        fontFamily: '"Press Start 2P", "Courier New", monospace',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '15px 20px',
          background: 'rgba(93, 0, 8, 0.2)',
          border: '3px solid #5d0008',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <h1 style={{
              fontSize: '24px',
              color: '#fff',
              margin: 0,
              textShadow: '3px 3px 0px #000'
            }}>
              ⚔️ DUNGEONS
            </h1>
            <div style={{
              fontSize: '14px',
              color: '#fff',
              textShadow: '2px 2px 0px #000'
            }}>
              FLOOR {currentFloor}
            </div>
          </div>
          <button
            onClick={onBack}
            className="nes-btn is-error"
            style={{
              fontSize: '12px',
              padding: '8px 16px'
            }}
          >
            ← Volver
          </button>
        </div>

        {/* Contenido principal: 2 columnas principales */}
        <div style={{
          display: 'flex',
          gap: '20px',
          flex: 1
        }}>
          {/* Columna izquierda */}
          <div style={{
            width: '300px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* Panel superior izquierdo */}
            <div style={{
              background: 'rgba(93, 0, 8, 0.2)',
              border: '3px solid #5d0008',
              borderRadius: '8px',
              padding: '15px'
            }}>
              <div style={{
                fontSize: '12px',
                color: '#fff',
                marginBottom: '15px',
                textAlign: 'center'
              }}>
                {userData?.firstname || 'Jugador'}
              </div>

              {/* HP Bar */}
              <div>
                <div style={{
                  fontSize: '8px',
                  color: '#aaa',
                  marginBottom: '5px'
                }}>HP</div>
                <div style={{
                  width: '100%',
                  height: '20px',
                  backgroundColor: '#333',
                  border: '2px solid #555',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${currentHp !== null ? (currentHp / totalStats.hp) * 100 : 100}%`,
                    backgroundColor: '#27ae60',
                    border: '1px solid #229954',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    transition: 'width 0.3s ease'
                  }}></div>
                  <span style={{
                    fontSize: '8px',
                    color: '#fff',
                    fontWeight: 'bold',
                    textShadow: '1px 1px 0px #000',
                    zIndex: 10,
                    position: 'relative'
                  }}>
                    {currentHp !== null ? `${currentHp}/${totalStats.hp}` : '0/0'}
                  </span>
                </div>
              </div>
            </div>

            {/* STATS - Panel inferior izquierdo */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '2px solid #888',
              borderRadius: '8px',
              padding: '15px',
              flex: 1
            }}>
              <div style={{
                fontSize: '10px',
                color: '#fff',
                marginBottom: '15px',
                textAlign: 'center'
              }}>
                STATS
              </div>

              {/* Stats reales */}
              <div style={{
                fontSize: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#ff6b6b' }}>ATK:</span>
                  <span style={{ color: '#fff', fontWeight: 'bold' }}>{totalStats.attack}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#4ecdc4' }}>DEF:</span>
                  <span style={{ color: '#fff', fontWeight: 'bold' }}>{totalStats.defense}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#ff6b6b' }}>HP:</span>
                  <span style={{ color: '#fff', fontWeight: 'bold' }}>{totalStats.hp}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#feca57' }}>SPD:</span>
                  <span style={{ color: '#fff', fontWeight: 'bold' }}>{totalStats.speed}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#a29bfe' }}>WIS:</span>
                  <span style={{ color: '#fff', fontWeight: 'bold' }}>{totalStats.wisdom}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#fd79a8' }}>CRT:</span>
                  <span style={{ color: '#fff', fontWeight: 'bold' }}>{totalStats.crit_chance}%</span>
                </div>
              </div>

              {/* Separador */}
              <div style={{
                width: '100%',
                height: '2px',
                backgroundColor: '#888',
                margin: '15px 0'
              }}></div>

              {/* Placeholder buffs/debuffs */}
              <div style={{
                fontSize: '8px',
                color: '#aaa'
              }}>
                Bonuses/sets/buffs/debuffs, etc.
              </div>
            </div>
          </div>

          {/* Columna derecha */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* Grid de enemigos - Panel superior derecho */}
            {currentEnemy && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '20px',
                alignContent: 'start'
              }}>
                <div
                  key={currentEnemy.id}
                  onClick={() => setSelectedEnemy(selectedEnemy?.id === currentEnemy.id ? null : currentEnemy)}
                  style={{
                    border: selectedEnemy?.id === currentEnemy.id ? '4px solid #5d0008' : '4px solid #444',
                    backgroundColor: selectedEnemy?.id === currentEnemy.id ? 'rgba(93, 0, 8, 0.2)' : 'rgba(40, 40, 60, 0.5)',
                    borderRadius: '8px',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: selectedEnemy?.id === currentEnemy.id 
                      ? '0 0 20px rgba(93, 0, 8, 0.5)' 
                      : '4px 4px 0px rgba(0,0,0,0.3)'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedEnemy?.id !== currentEnemy.id) {
                      e.currentTarget.style.borderColor = '#666';
                      e.currentTarget.style.transform = 'translateY(-5px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedEnemy?.id !== currentEnemy.id) {
                      e.currentTarget.style.borderColor = '#444';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <div style={{
                    fontSize: '50px',
                    filter: 'drop-shadow(4px 4px 0px rgba(0,0,0,0.5))',
                    marginBottom: '8px'
                  }}>
                    {currentEnemy.icon}
                  </div>

                  <h3 style={{
                    fontSize: '10px',
                    color: '#fff',
                    margin: '0 0 4px 0'
                  }}>
                    {currentEnemy.name}
                  </h3>

                  <div style={{
                    fontSize: '8px',
                    color: '#aaa',
                    marginBottom: '6px'
                  }}>
                    Lv.{currentEnemy.level}
                  </div>

                  <div style={{
                    width: '100%',
                    height: '14px',
                    backgroundColor: '#333',
                    border: '2px solid #555',
                    borderRadius: '4px',
                    padding: '2px',
                    overflow: 'hidden',
                    marginBottom: '4px'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${getHpPercentage(currentEnemy.currentHp, currentEnemy.maxHp)}%`,
                      backgroundColor: '#e74c3c',
                      borderRadius: '2px',
                      transition: 'width 0.3s'
                    }}></div>
                  </div>

                  <div style={{
                    fontSize: '8px',
                    color: '#aaa'
                  }}>
                    {currentEnemy.currentHp} / {currentEnemy.maxHp}
                  </div>
                </div>
              </div>
            )}

            {/* Botón de Atacar */}
            {currentEnemy && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '0px'
              }}>
                <button
                  onClick={isInCombat ? handlePlayerAttack : handleStartCombat}
                  disabled={isInCombat && !isPlayerTurn}
                  className="nes-btn is-primary"
                  style={{
                    fontSize: '14px',
                    padding: '12px 24px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}
                >
                  {isInCombat ? (isPlayerTurn ? '⚔️ Atacar' : '⏳ Turno del Enemigo...') : '⚔️ Iniciar Combate'}
                </button>
              </div>
            )}

            {/* INFO - Panel inferior derecho */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '2px solid #888',
              borderRadius: '8px',
              padding: '15px'
            }}>
              <div style={{
                fontSize: '10px',
                color: '#fff',
                marginBottom: '15px'
              }}>
                INFO
              </div>

              {/* Separador horizontal */}
              <div style={{
                width: '100%',
                height: '2px',
                backgroundColor: '#888',
                marginBottom: '15px'
              }}></div>

              {/* Contenedor dividido en 2 columnas */}
              {selectedEnemy ? (
                <div style={{
                  display: 'flex',
                  gap: '15px'
                }}>
                  {/* Columna izquierda del INFO */}
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <div style={{
                      fontSize: '8px',
                      color: '#bbb',
                      lineHeight: '1.6'
                    }}>
                      "{selectedEnemy.description}"
                    </div>

                    {/* Stats del enemigo */}
                    <div style={{
                      fontSize: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#ff6b6b' }}>ATK:</span>
                        <span style={{ color: '#fff', fontWeight: 'bold' }}>{selectedEnemy.attack}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#4ecdc4' }}>DEF:</span>
                        <span style={{ color: '#fff', fontWeight: 'bold' }}>{selectedEnemy.defense}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#ff6b6b' }}>HP:</span>
                        <span style={{ color: '#fff', fontWeight: 'bold' }}>{selectedEnemy.maxHp}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#feca57' }}>SPD:</span>
                        <span style={{ color: '#fff', fontWeight: 'bold' }}>{selectedEnemy.speed}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#a29bfe' }}>WIS:</span>
                        <span style={{ color: '#fff', fontWeight: 'bold' }}>{selectedEnemy.wisdom}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#fd79a8' }}>CRT:</span>
                        <span style={{ color: '#fff', fontWeight: 'bold' }}>{selectedEnemy.crit_chance}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Separador vertical */}
                  <div style={{
                    width: '2px',
                    backgroundColor: '#888'
                  }}></div>

                  {/* Columna derecha del INFO */}
                  <div style={{
                    flex: 1,
                    fontSize: '8px',
                    color: '#aaa'
                  }}>
                    <div style={{ marginBottom: '8px', color: '#888' }}>No hay buffs activos</div>
                  </div>
                </div>
              ) : (
                <div style={{
                  fontSize: '8px',
                  color: '#aaa',
                  textAlign: 'center',
                  padding: '20px 0'
                }}>
                  Selecciona un enemigo para ver información
                </div>
              )}
            </div>

            {/* Log de combate - Panel adicional debajo del INFO */}
            {isInCombat && combatLog.length > 0 && (
              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '2px solid #5d0008',
                borderRadius: '8px',
                padding: '15px',
                maxHeight: '150px',
                overflowY: 'auto'
              }}>
                <div style={{
                  fontSize: '10px',
                  color: '#fff',
                  marginBottom: '10px',
                  textAlign: 'center'
                }}>
                  LOG DE COMBATE
                </div>
                <div style={{
                  fontSize: '8px',
                  color: '#eee',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  {combatLog.map((log, idx) => (
                    <div key={idx}>{log}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
