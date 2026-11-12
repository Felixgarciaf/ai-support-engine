# Plan de Trabajo Definitivo — AI Support Engine

## Configuración del Proyecto

| Elemento | Configuración |
| :--- | :--- |
| **Repositorio** | `ai-support-engine` |
| **Visibilidad** | Público |
| **Backend** | Node.js + Express |
| **IA generativa** | Google Gemini API (`@google/genai`) |
| **Validaciones** | Zod |
| **Pruebas HTTP** | Postman / Benchmark Script |
| **Control de versiones** | Git + GitHub |
| **Lenguaje** | JavaScript ES Modules (`"type": "module"`) |

## Fases de Desarrollo

1. **Fase 0 — Crear el repositorio y preparar el entorno:** Inicialización de Git (`main`), configuración de `package.json`, `.gitignore` y `.env.example`.
2. **Fase 1 — Definir la arquitectura y el contrato JSON:** Constantes de dominio (`ACCESS`, `BUG`, `FEATURE`, `SECURITY` y prioridades `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) en `src/config/constants.js`.
3. **Fase 2 — Desarrollar el motor tradicional:** Reglas simbólicas ponderadas, expresiones regulares, desempate determinista y respuestas predeterminadas en `src/engines/traditional.engine.js`.
4. **Fase 3 — Integrar Google Gemini API:** Servicio `src/services/gemini.service.js` con `@google/genai`, instrucciones de sistema blindadas y JSON Schema estructurado; motor `src/engines/generative.engine.js`.
5. **Fase 4 — Seguridad y validaciones:** Validación estricta de entrada (`src/validators/analyze.validator.js`) y salida (`src/validators/response.validator.js`), más detectores dedicados de incidentes (`src/security/security.detector.js`) y Prompt Injection (`src/security/injection.detector.js`).
6. **Fase 5 — Desarrollar la API REST con Express:** Servidor HTTP (`src/app.js`, `src/server.js`) y ruta `POST /api/analyze` (`src/routes/analyze.routes.js`).
7. **Fase 6 — Construir las pruebas comparativas:** Dataset de 12 casos (`tests/cases.js`) y script de evaluación comparativa (`tests/benchmark.js`).
8. **Fase 7 y 8 — Documentación, evidencias y publicación en GitHub:** `README.md` con instrucciones de ejecución, tabla de resultados, conclusión técnica (< 150 palabras) y commits semánticos.
