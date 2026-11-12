import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import analyzeRoutes from './routes/analyze.routes.js';

const app = express();

// Middlewares de seguridad y parseo JSON
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '32kb' }));

// Manejo de JSON malformado en el body
app.use((err, _req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'El cuerpo de la petición no es un JSON válido.',
    });
  }
  return next(err);
});

// Healthcheck informativo
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'ai-support-engine',
  });
});

// Endpoint principal requerido: POST /api/analyze
app.use('/api', analyzeRoutes);

// Ruta no encontrada
app.use((_req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada. Utilice POST /api/analyze',
  });
});

export default app;
