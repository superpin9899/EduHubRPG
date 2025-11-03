import { useState } from 'react';
import 'nes.css/css/nes.min.css';

interface Enemy {
  id: number;
  name: string;
  icon: string;
  maxHp: number;
  currentHp: number;
  level: number;
  attack?: number;
  defense?: number;
}

interface Floor {
  id: number;
  name: string;
  enemies: Enemy[];
}

interface DungeonsProps {
  userData: any;
  onBack: () => void;
}

export default function Dungeons({ userData: _userData, onBack }: DungeonsProps) {
  const [currentFloor] = useState(1);
  const [floors] = useState<Floor[]>([
    {
      id: 1,
      name: 'Planta Baja',
      enemies: [
        { id: 1, name: 'Slime', icon: '🟢', maxHp: 100, currentHp: 80, level: 1, attack: 5, defense: 3 },
        { id: 2, name: 'Goblin', icon: '👹', maxHp: 150, currentHp: 100, level: 2, attack: 12, defense: 8 },
        { id: 3, name: 'Skeleton', icon: '💀', maxHp: 120, currentHp: 50, level: 1, attack: 8, defense: 5 }
      ]
    },
    {
      id: 2,
      name: 'Sótano 1',
      enemies: [
        { id: 4, name: 'Orc', icon: '👹', maxHp: 200, currentHp: 150, level: 3 },
        { id: 5, name: 'Spider', icon: '🕷️', maxHp: 80, currentHp: 60, level: 2 },
        { id: 6, name: 'Bat', icon: '🦇', maxHp: 60, currentHp: 40, level: 1 }
      ]
    },
    {
      id: 3,
      name: 'Sótano 2',
      enemies: [
        { id: 7, name: 'Dragon', icon: '🐉', maxHp: 500, currentHp: 300, level: 5 },
        { id: 8, name: 'Demon', icon: '😈', maxHp: 300, currentHp: 200, level: 4 }
      ]
    }
  ]);

  const [selectedEnemy, setSelectedEnemy] = useState<Enemy | null>(null);

  const currentFloorData = floors.find(f => f.id === currentFloor);

  const getHpPercentage = (current: number, max: number) => {
    return Math.max(0, (current / max) * 100);
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
          <h1 style={{
            fontSize: '24px',
            color: '#fff',
            margin: 0,
            textShadow: '3px 3px 0px #000'
          }}>
            ⚔️ DUNGEONS
          </h1>
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
            {/* FLOOR 1 - Panel superior izquierdo */}
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
                FLOOR 1
              </div>

              {/* HP Bar */}
              <div style={{ marginBottom: '15px' }}>
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  padding: '2px'
                }}>
                  <div style={{
                    height: '100%',
                    width: '100%',
                    backgroundColor: '#27ae60',
                    border: '1px solid #229954'
                  }}></div>
                </div>
              </div>

              {/* Stats */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                fontSize: '10px',
                color: '#fff'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div>🛡️</div>
                  <div style={{ fontSize: '8px', color: '#aaa' }}>50</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div>⚔️</div>
                  <div style={{ fontSize: '8px', color: '#aaa' }}>28</div>
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

              {/* Placeholder stats */}
              <div style={{
                fontSize: '8px',
                color: '#aaa',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div>stat1: x</div>
                <div>stat2: x</div>
                <div>stat3: x</div>
                <div>stat4: x</div>
                <div>stat5: x</div>
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
            {currentFloorData && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '20px',
                alignContent: 'start'
              }}>
                {currentFloorData.enemies.map((enemy) => (
                  <div
                    key={enemy.id}
                    onClick={() => setSelectedEnemy(selectedEnemy?.id === enemy.id ? null : enemy)}
                    style={{
                      border: selectedEnemy?.id === enemy.id ? '4px solid #5d0008' : '4px solid #444',
                      backgroundColor: selectedEnemy?.id === enemy.id ? 'rgba(93, 0, 8, 0.2)' : 'rgba(40, 40, 60, 0.5)',
                      borderRadius: '8px',
                      padding: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: selectedEnemy?.id === enemy.id 
                        ? '0 0 20px rgba(93, 0, 8, 0.5)' 
                        : '4px 4px 0px rgba(0,0,0,0.3)'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedEnemy?.id !== enemy.id) {
                        e.currentTarget.style.borderColor = '#666';
                        e.currentTarget.style.transform = 'translateY(-5px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedEnemy?.id !== enemy.id) {
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
                      {enemy.icon}
                    </div>

                    <h3 style={{
                      fontSize: '10px',
                      color: '#fff',
                      margin: '0 0 4px 0'
                    }}>
                      {enemy.name}
                    </h3>

                    <div style={{
                      fontSize: '8px',
                      color: '#aaa',
                      marginBottom: '6px'
                    }}>
                      Lv.{enemy.level}
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
                        width: `${getHpPercentage(enemy.currentHp, enemy.maxHp)}%`,
                        backgroundColor: '#e74c3c',
                        borderRadius: '2px',
                        transition: 'width 0.3s'
                      }}></div>
                    </div>

                    <div style={{
                      fontSize: '8px',
                      color: '#aaa'
                    }}>
                      {enemy.currentHp} / {enemy.maxHp}
                    </div>
                  </div>
                ))}
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
                    color: '#aaa',
                    marginBottom: '10px'
                  }}>
                    "Descripción del enemigo"
                  </div>

                  {/* Placeholder stats */}
                  <div style={{
                    fontSize: '8px',
                    color: '#aaa',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px'
                  }}>
                    <div>stat1</div>
                    <div>stat2</div>
                    <div>stat3</div>
                    <div>stat4</div>
                    <div>stat5</div>
                    <div>etc</div>
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
                  inmunidades/bonificadores/estados/debuffs
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
