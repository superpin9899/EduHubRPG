import { useState, useEffect } from 'react';
import 'nes.css/css/nes.min.css';
import testDummieSprite from './test_dummie.png';

interface DungeonsProps {
  userData: any;
  onBack: () => void;
}

export default function Dungeons({ userData: _userData, onBack }: DungeonsProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [spriteDimensions, setSpriteDimensions] = useState<{ width: number; height: number; frameWidth: number; frameHeight: number } | null>(null);
  
  // Spritesheet: 2 filas x 2 columnas = 4 frames totales
  // Dimensiones: 1024x1024px total, cada frame es 512x512px
  const totalFrames = 4;
  const columns = 2;
  const rows = 2;
  const frameDuration = 150; // ms por frame

  // Cargar imagen y obtener dimensiones reales
  useEffect(() => {
    const img = new Image();
    img.src = testDummieSprite;
    img.onload = () => {
      // Calcular dimensiones de cada frame
      const frameWidth = img.width / columns;
      const frameHeight = img.height / rows;
      setSpriteDimensions({
        width: img.width,
        height: img.height,
        frameWidth,
        frameHeight
      });
    };
  }, []);

  // Animación en bucle
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % totalFrames);
    }, frameDuration);

    return () => clearInterval(interval);
  }, [totalFrames, frameDuration]);

  // Calcular posición del frame en el spritesheet (2x2 grid)
  // Frame 0: fila 0, col 0 (Top-Left) - (0, 0) a (512, 512)
  // Frame 1: fila 0, col 1 (Top-Right) - (512, 0) a (1024, 512)
  // Frame 2: fila 1, col 0 (Bottom-Left) - (0, 512) a (512, 1024)
  // Frame 3: fila 1, col 1 (Bottom-Right) - (512, 512) a (1024, 1024)
  const currentRow = Math.floor(currentFrame / columns);
  const currentCol = currentFrame % columns;

  // Escala para visualización (40% del tamaño original)
  const displayScale = 0.4;

  // Calcular posición exacta en píxeles si tenemos las dimensiones
  const getBackgroundPosition = () => {
    if (!spriteDimensions) {
      // Fallback a porcentajes mientras carga
      return `${(currentCol / (columns - 1)) * 100}% ${(currentRow / (rows - 1)) * 100}%`;
    }
    // Calcular en píxeles exactos, usando valores redondeados para evitar subpíxeles
    // Esto asegura que todos los frames se alineen exactamente igual
    const exactFrameWidth = Math.round(spriteDimensions.frameWidth);
    const exactFrameHeight = Math.round(spriteDimensions.frameHeight);
    
    // Calcular posición exacta del frame usando valores enteros
    // Multiplicar primero los valores enteros y luego escalar para mayor precisión
    const x = -Math.round(currentCol * exactFrameWidth * displayScale);
    const y = -Math.round(currentRow * exactFrameHeight * displayScale);
    
    return `${x}px ${y}px`;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      `}</style>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        padding: '20px',
        fontFamily: '"Press Start 2P", "Courier New", monospace',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Container principal */}
        <div style={{
          maxWidth: '800px',
          width: '100%',
          backgroundColor: '#fff',
          border: '4px solid #333',
          boxShadow: '8px 8px 0px rgba(0,0,0,0.3)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #5d0008 0%, #70000a 100%)',
            padding: '20px',
            borderBottom: '4px solid #333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: 'white',
              textShadow: '2px 2px 0px rgba(0,0,0,0.3)',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>
              ⚔️ DUNGEONS
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

          {/* Contenido - Vista de previsualización */}
          <div style={{
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            backgroundColor: '#f9f9f9'
          }}>
            <div style={{
              fontSize: '14px',
              marginBottom: '30px',
              color: '#333',
              textAlign: 'center',
              lineHeight: '1.8'
            }}>
              PREVISUALIZACIÓN<br/>
              Animación Idle
            </div>

            {/* Sprite animado */}
            {spriteDimensions && (() => {
              // Calcular valores exactos redondeados para asegurar consistencia
              const exactFrameWidth = Math.round(spriteDimensions.frameWidth);
              const exactFrameHeight = Math.round(spriteDimensions.frameHeight);
              const exactSpriteWidth = Math.round(spriteDimensions.width);
              const exactSpriteHeight = Math.round(spriteDimensions.height);
              
              const scaledWidth = Math.round(exactFrameWidth * displayScale);
              const scaledHeight = Math.round(exactFrameHeight * displayScale);
              const scaledSpriteWidth = Math.round(exactSpriteWidth * displayScale);
              const scaledSpriteHeight = Math.round(exactSpriteHeight * displayScale);
              
              return (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end', // Alinear por la parte inferior
                  justifyContent: 'center',
                  width: `${scaledWidth}px`,
                  height: `${scaledHeight}px`,
                  minWidth: `${scaledWidth}px`,
                  maxWidth: `${scaledWidth}px`,
                  minHeight: `${scaledHeight}px`,
                  maxHeight: `${scaledHeight}px`,
                  margin: '0 auto',
                  position: 'relative',
                  overflow: 'hidden',
                  boxSizing: 'border-box'
                }}>
                  <div style={{
                    position: 'absolute',
                    width: `${scaledWidth}px`,
                    height: `${scaledHeight}px`,
                    backgroundImage: `url(${testDummieSprite})`,
                    backgroundSize: `${scaledSpriteWidth}px ${scaledSpriteHeight}px`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: getBackgroundPosition(),
                    backgroundAttachment: 'local',
                    imageRendering: 'pixelated',
                    bottom: 0, // Anclar por la parte inferior
                    left: 0,
                    filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.5))',
                    transformOrigin: 'center bottom', // Usar la parte inferior como origen
                    willChange: 'background-position'
                  }} />
                </div>
              );
            })()}
            {!spriteDimensions && (
              <div style={{
                width: '200px',
                height: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: '#999'
              }}>
                Cargando...
              </div>
            )}

            {/* Debug info */}
            {spriteDimensions && (
              <div style={{
                marginTop: '40px',
                fontSize: '8px',
                color: '#999',
                textAlign: 'center',
                lineHeight: '1.6'
              }}>
                Frame: {currentFrame + 1}/{totalFrames}
                <br/>
                Fila: {currentRow + 1} | Col: {currentCol + 1}
                <br/>
                Sprite: {spriteDimensions.width}×{spriteDimensions.height}px
                <br/>
                Frame: {spriteDimensions.frameWidth}×{spriteDimensions.frameHeight}px
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

