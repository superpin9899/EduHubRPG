# 📋 Changelog



## [0.6.0] - 2025-11-03

### ✨ Una cosa menos
- **Sistema de inventario completo** con items equipables y efectos visuales por rareza
- **Sistema de dungeon** con combate por turnos
- **Monstruos dinámicos** con calculo de stats por nivel y piso
- **Funciones serverless en Netlify** para seguridad de keys
- **Migración de API** todas las llamadas sensibles movidas a backend
- **Tour guiado** para nuevos usuarios en landing page

### 🎮 Gamificación Expandida
- **Stats de jugador** ATK, DEF, HP, SPD, WIS, CRT con bonuses de items
- **Rareza de items** Común, Raro, Épico, Legendario con efectos glow y pulse
- **Tabla de monstruos** con 4 tipos iniciales: Slime, Goblin, Skeleton, Orc
- **Cálculo de stats** función SQL para escalado por nivel y piso
- **Persistencia de dungeon** guardado automático de progreso
- **Popup de continuar** opción para retomar run o empezar nueva

### 🔧 Changed
- **Manejo de equipamiento** trigger por slot_type en vez de item_type
- **Colores de marca** todos los acentos cambiados a #5d0008
- **Interacción de partículas** desactivada para movimiento libre
- **Cursor pixel art** mantenido durante toda la navegación

### 🐛 Sanitized
- **Closures en combate** useRef para evitar stale state en turnos
- **Guardado de progreso** verificacion de existencia antes de PATCH/POST
- **Datos vacíos JSON** manejo correcto de respuestas vacías de Supabase
- **Limpieza de builds** eliminados warnings de variables no usadas

### 📚 Database Migrations
- **018** Tabla monsters + dungeon_progress + función calculate_monster_stats
- **019** items_found como JSONB
- **020** columna current_enemy JSONB

### 🚀 Infraestructura
- **Netlify deployment** CI/CD automático desde GitHub
- **Serverless functions** 15+ endpoints para seguridad
- **Sistema de migraciones** script automatizado npm run migrate

## [0.5.0] - 2025-10-23

### ✨ Una cosa menos
- **Sistema de gamificación parcial** experiencia, niveles y logros
- **Interfaz 3D inmersiva** navegación drag & drop
- **Integración Moodle** Web Services API
- **Base de datos** Persistencia
- **Dashboard** Muestreo de datos y calculos en backend
- **Autenticación** integrado con Moodle
- **Animaciones avanzadas** GSAP
- **Diseño responsive** optimizado a todos los dispositivos
- **Físicas** Rapier
- **Cálculo dinámico** de niveles basado en progreso real de cursos

### 🐛 Sanitized
- **Sincronización de datos** Moodle y Database
- **Animaciones de nivel** Secuenciada
- **Nombres de cursos** Consultas directas a Moodle a través de API
- **Protección de puntos** contra pérdida de progreso/Bugs

### 📚 Documentación
- **README completo** con detalles del proyecto
- **Changelog** para tracking de cambios

## [0.4.0] - 2025-10-22

### ✨ Una cosa menos
- **Prototipo inicial** de interfaz 3D
- **Integración básica** Moodle API
- **Sistema de tarjetas** con física básica
- **Fondo de partículas** interactive

### 🔧 Changed
- **Estructura del proyecto** reorganizada en pos de sanidad mental
- **Configuración de desarrollo** optimizada por eficiencia

## [0.3.0] - 2025-10-15

### ✨ Añadido
- **Stack tecnológico** definido
- **Estructura de carpetas** establecida
- **Configuración de Git** y GitHub para checkpints

---

## 🔮 ROADMAP

### [0.7.0] - Próximo
- **EXP y loot** al derrotar enemigos
- **Sistema de pisos** progresión con monstruos más fuertes
- **Animaciones de combate** spritesheets para jugador y enemigos
- **Múltiples enemigos** por piso (3-5)
- **Balancing** ajuste de stats y fórmulas de daño

### [0.8.0] - Casi
- **UI de tienda** para items
- **Sistema de logros** desbloqueables en dungeon
- **Estadísticas de run** resumen de la partida
- **Leaderboard** del dungeon

### [0.9.0] - Futuro
- **App móvil nativa** con React Native
- **Sistema de misiones** dinámicas en base a cursos
- **Integración con empresas** para oportunidades laborales
- **Analytics avanzados** para gestores

---

**Nota**: Este changelog se mantiene actualizado con cada release importante del proyecto. Solo tengo dos manos :).
