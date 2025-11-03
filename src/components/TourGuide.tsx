import { useState, useEffect } from 'react'
import { X, ArrowRight, ArrowLeft, BookOpen, Trophy, HelpCircle, Headphones, TrendingUp, Award } from 'lucide-react'

interface TourStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: '¡Bienvenido a la Plataforma de Formación!',
    description: 'Estás en el centro de aprendizaje de la Fundación San Ezequiel Moreno. Esta plataforma combina formación continua con gamificación para hacer tu aprendizaje más efectivo y entretenido.',
    icon: <Trophy size={40} />
  },
  {
    id: 'interactive',
    title: 'Tarjetas Interactivas',
    description: '¿Ves las tarjetas con lanyards? Son totalmente interactivas. Arrástralas hacia abajo para acceder a diferentes secciones de la plataforma. Cada una te lleva a un área diferente.',
    icon: <TrendingUp size={40} />
  },
  {
    id: 'courses',
    title: 'Cursos y Materiales',
    description: 'Explora nuestra biblioteca completa de cursos. Desde habilidades básicas hasta formación avanzada, todo organizado para que puedas aprender a tu ritmo y según tus necesidades.',
    icon: <BookOpen size={40} />
  },
  {
    id: 'tutorial',
    title: 'Guías y Tutoriales',
    description: '¿No estás seguro cómo usar una función? Accede a nuestros tutoriales paso a paso que te guiarán por toda la plataforma de forma clara y sencilla.',
    icon: <HelpCircle size={40} />
  },
  {
    id: 'support',
    title: 'Soporte Técnico',
    description: '¿Necesitas ayuda? Nuestro equipo está disponible para resolver tus dudas. Accede al centro de soporte con preguntas frecuentes y contacto directo.',
    icon: <Headphones size={40} />
  },
  {
    id: 'gamification',
    title: 'Sistema de Gamificación',
    description: 'Gana experiencia completando cursos, sube de nivel y desbloquea logros únicos. Visualiza tu progreso en el ranking y compite sanamente con otros estudiantes.',
    icon: <Award size={40} />
  }
]

const TourGuide = () => {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const html = document.documentElement
    const body = document.body

    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'

    return () => {
      html.style.overflow = ''
      body.style.overflow = ''
    }
  }, [])

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
    localStorage.setItem('tour_completed', 'true')
    window.location.reload()
  }

  const currentStepData = TOUR_STEPS[currentStep]

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
        maxWidth: '500px',
        width: '90%',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #5d0008 0%, #70000a 100%)',
          padding: '30px 30px 20px',
          position: 'relative'
        }}>
          <button
            onClick={handleComplete}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            <X size={18} color="white" />
          </button>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            marginTop: '20px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {currentStepData.icon}
            </div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: 'white',
              margin: 0,
              textAlign: 'center'
            }}>
              {currentStepData.title}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div style={{
          padding: '30px',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '16px',
            color: '#374151',
            lineHeight: '1.6',
            margin: 0
          }}>
            {currentStepData.description}
          </p>
        </div>

        {/* Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 30px',
          borderTop: '1px solid #e5e7eb',
          gap: '12px'
        }}>
          <button
            onClick={handleComplete}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: '2px solid #d1d5db',
              borderRadius: '8px',
              color: '#6b7280',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '14px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#9ca3af'
              e.currentTarget.style.color = '#374151'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#d1d5db'
              e.currentTarget.style.color = '#6b7280'
            }}
          >
            Saltar
          </button>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                style={{
                  padding: '10px 20px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#374151',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
              >
                <ArrowLeft size={16} />
                Anterior
              </button>
            )}

            <button
              onClick={handleNext}
              style={{
                padding: '10px 24px',
                background: 'linear-gradient(135deg, #5d0008 0%, #70000a 100%)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
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
              {currentStep === TOUR_STEPS.length - 1 ? 'Empezar' : 'Siguiente'}
              {currentStep < TOUR_STEPS.length - 1 && <ArrowRight size={16} />}
            </button>
          </div>
        </div>

        {/* Progress dots */}
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          padding: '12px',
          background: '#f9fafb'
        }}>
          {TOUR_STEPS.map((_, index) => (
            <div
              key={index}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: index === currentStep ? '#5d0008' : '#d1d5db',
                transition: 'all 0.3s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default TourGuide
