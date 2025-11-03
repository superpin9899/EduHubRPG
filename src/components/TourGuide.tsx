import { useState, useEffect } from 'react'
import { X, ArrowRight, ArrowLeft } from 'lucide-react'

interface TourStep {
  id: string
  title: string
  description: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  target?: string // Selector CSS del elemento a resaltar
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: '¡Bienvenido a la Plataforma de Formación!',
    description: 'Estás en el centro de aprendizaje de la Fundación San Ezequiel Moreno. Este tour te mostrará las principales funcionalidades.',
    position: 'bottom'
  },
  {
    id: 'courses',
    title: 'Explora los Cursos',
    description: 'Accede a la lista completa de cursos disponibles. Aquí encontrarás todo el contenido formativo de la Fundación para tu desarrollo profesional.',
    position: 'left',
    target: '.lanyard-wrapper'
  },
  {
    id: 'howitworks',
    title: 'Cómo Funciona',
    description: 'Descubre cómo utilizar la plataforma de forma eficiente con explicaciones detalladas y ejemplos prácticos paso a paso.',
    position: 'left',
    target: '.lanyard-wrapper'
  },
  {
    id: 'support',
    title: 'Centro de Soporte',
    description: '¿Necesitas ayuda? Accede al centro de soporte con preguntas frecuentes y contacto directo con nuestro equipo técnico.',
    position: 'right',
    target: '.lanyard-wrapper'
  },
  {
    id: 'gamification',
    title: 'Sistema de Gamificación',
    description: 'Gana experiencia, sube de nivel y desbloquea logros mientras aprendes. ¡Haz del aprendizaje un juego!',
    position: 'top',
    target: '[data-tour="gamification"]'
  }
]

const TourGuide = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const step = TOUR_STEPS[currentStep]
    // Delay para asegurar que el DOM esté actualizado
    const timer = setTimeout(() => {
      if (step?.target) {
        let element: HTMLElement | null = null
        
        // Si el target es .lanyard-wrapper, seleccionar por índice
        if (step.target === '.lanyard-wrapper') {
          const elements = document.querySelectorAll(step.target) as NodeListOf<HTMLElement>
          // Paso 1 (welcome): no tiene target
          // Paso 2 (courses): índice 0
          // Paso 3 (howitworks): índice 1  
          // Paso 4 (support): índice 2
          const cardIndex = currentStep - 1 // Restamos 1 porque el paso 0 no tiene target
          element = elements[cardIndex] || null
        } else {
          element = document.querySelector(step.target) as HTMLElement
        }
        
        setTargetElement(element)
        
        // Scrollear al elemento objetivo (instantáneo porque el scroll está bloqueado)
        if (element) {
          element.scrollIntoView({ behavior: 'auto', block: 'center' })
        }
      } else {
        setTargetElement(null)
      }
    }, 100)
    
    return () => clearTimeout(timer)
  }, [currentStep])

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    // Marcar el tour como completado en localStorage
    localStorage.setItem('tour_completed', 'true')
    
    // Desbloquear scroll inmediatamente
    const root = document.getElementById('root')
    const html = document.documentElement
    html.style.overflowX = 'clip'
    html.style.overflowY = 'auto'
    document.body.style.overflow = 'visible'
    if (root) {
      root.style.overflow = 'unset'
    }
    
    // Hacer scroll al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
    // Recargar para ocultar el tour
    window.location.reload()
  }

  const currentStepData = TOUR_STEPS[currentStep]

  // Calcular posición del tooltip - Simplificado a posición fija
  const getTooltipStyle = () => {
    return {
      bottom: '40px',
      left: '50%',
      transform: 'translateX(-50%)',
      position: 'fixed' as const
    }
  }

  // Bloquear scroll del html, body y root
  useEffect(() => {
    const root = document.getElementById('root')
    const html = document.documentElement
    
    html.style.overflowX = 'hidden'
    html.style.overflowY = 'hidden'
    document.body.style.overflow = 'hidden'
    if (root) {
      root.style.overflow = 'hidden'
    }

    // Prevenir scroll con wheel
    const preventScroll = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    // Prevenir scroll con touch
    const preventTouch = (e: TouchEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    window.addEventListener('wheel', preventScroll, { passive: false })
    window.addEventListener('touchmove', preventTouch, { passive: false })

    return () => {
      // Restaurar valores originales del CSS
      html.style.overflowX = 'clip'
      html.style.overflowY = 'auto'
      document.body.style.overflow = 'visible'
      if (root) {
        root.style.overflow = 'unset'
      }
      window.removeEventListener('wheel', preventScroll)
      window.removeEventListener('touchmove', preventTouch)
    }
  }, [])

  return (
    <>
      {/* Overlay oscuro con recorte en el elemento objetivo */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 9998,
        pointerEvents: 'auto'
      }}>
        {targetElement && (() => {
          const rect = targetElement.getBoundingClientRect()
          const padding = 5
          return (
            <>
              {/* Overlay en 4 partes para crear el recorte */}
              {/* Top overlay */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: rect.top - padding,
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                pointerEvents: 'auto',
                animation: 'fadeInOverlay 0.3s ease-in-out 0s'
              }} />
              {/* Bottom overlay */}
              <div style={{
                position: 'absolute',
                top: rect.bottom + padding,
                left: 0,
                width: '100%',
                height: `calc(100% - ${rect.bottom + padding}px)`,
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                pointerEvents: 'auto',
                animation: 'fadeInOverlay 0.3s ease-in-out 0.05s'
              }} />
              {/* Left overlay */}
              <div style={{
                position: 'absolute',
                top: rect.top - padding,
                left: 0,
                width: rect.left - padding,
                height: rect.height + (padding * 2),
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                pointerEvents: 'auto',
                animation: 'fadeInOverlay 0.3s ease-in-out 0.1s'
              }} />
              {/* Right overlay */}
              <div style={{
                position: 'absolute',
                top: rect.top - padding,
                left: rect.right + padding,
                width: `calc(100% - ${rect.right + padding}px)`,
                height: rect.height + (padding * 2),
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                pointerEvents: 'auto',
                animation: 'fadeInOverlay 0.3s ease-in-out 0.15s'
              }} />
              {/* Borde del elemento objetivo */}
              <div style={{
                position: 'absolute',
                top: rect.top - padding,
                left: rect.left - padding,
                width: rect.width + (padding * 2),
                height: rect.height + (padding * 2),
                border: '3px solid #5d0008',
                borderRadius: '12px',
                pointerEvents: 'none',
                animation: 'fadeInBorder 0.4s ease-in-out 0.2s'
              }} />
            </>
          )
        })()}
      </div>

      {/* Tooltip del tour */}
      <div style={{
        ...getTooltipStyle(),
        zIndex: 9999,
        minWidth: '320px',
        maxWidth: '400px',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        padding: '0',
        pointerEvents: 'auto'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #5d0008 0%, #70000a 100%)',
          padding: '20px',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '12px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'white',
              margin: 0,
              paddingRight: '20px'
            }}>
              {currentStepData.title}
            </h3>
            <button
              onClick={handleComplete}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            >
              <X size={16} color="white" />
            </button>
          </div>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.9)',
            margin: 0,
            lineHeight: '1.6'
          }}>
            {currentStepData.description}
          </p>
        </div>

        <div style={{
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button
            onClick={handleComplete}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: '2px solid #5d0008',
              borderRadius: '8px',
              color: '#5d0008',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '14px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#5d0008'
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#5d0008'
            }}
          >
            Saltar
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                style={{
                  padding: '10px 16px',
                  background: '#f3f4f6',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#374151',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e5e7eb'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f3f4f6'
                }}
              >
                <ArrowLeft size={16} />
                Anterior
              </button>
            )}
            <button
              onClick={handleNext}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #5d0008 0%, #70000a 100%)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '14px',
                boxShadow: '0 4px 12px rgba(93, 0, 8, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(93, 0, 8, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(93, 0, 8, 0.3)'
              }}
            >
              {currentStep === TOUR_STEPS.length - 1 ? 'Finalizar' : 'Siguiente'}
              {currentStep < TOUR_STEPS.length - 1 && <ArrowRight size={16} />}
            </button>
          </div>
        </div>

        {/* Indicador de progreso */}
        <div style={{
          display: 'flex',
          gap: '6px',
          justifyContent: 'center',
          padding: '12px 20px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb'
        }}>
          {TOUR_STEPS.map((_, index) => (
            <div
              key={index}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: index === currentStep ? '#5d0008' : '#d1d5db',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      </div>
    </>
  )
}

export default TourGuide


