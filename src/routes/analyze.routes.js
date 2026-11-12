import { Router } from 'express';
import { MODES } from '../config/constants.js';
import { analyzeWithTraditionalEngine } from '../engines/traditional.engine.js';
import { analyzeWithGenerativeEngine } from '../engines/generative.engine.js';
import { GeminiProviderError } from '../services/gemini.service.js';
import { validateAnalyzeRequest } from '../validators/analyze.validator.js';
import { validateAnalyzeResponse } from '../validators/response.validator.js';

const router = Router();

router.post('/analyze', async (req, res) => {
  // Paso 1: Validar solicitud recibida
  const requestValidation = validateAnalyzeRequest(req.body);

  if (!requestValidation.valid) {
    return res.status(400).json({
      error: 'Solicitud inválida',
      details: requestValidation.errors,
    });
  }

  const { message, mode } = requestValidation.data;

  try {
    // Paso 2: Enrutar según el modo seleccionado
    let result;
    if (mode === MODES.TRADITIONAL) {
      result = analyzeWithTraditionalEngine(message);
    } else {
      result = await analyzeWithGenerativeEngine(message);
    }

    // Paso 3: Validar contrato de salida antes de responder
    const responseValidation = validateAnalyzeResponse(result, mode);
    if (!responseValidation.valid) {
      return res.status(502).json({
        error: 'El motor produjo una respuesta con formato inválido.',
        details: responseValidation.errors,
      });
    }

    return res.status(200).json(responseValidation.data);
  } catch (error) {
    if (error instanceof GeminiProviderError) {
      return res.status(error.statusCode || 503).json({
        error: error.message,
      });
    }

    return res.status(500).json({
      error: 'Error interno al procesar la solicitud de soporte.',
    });
  }
});

export default router;
