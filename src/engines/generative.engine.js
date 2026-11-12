import { CATEGORIES, MODES, PRIORITIES } from '../config/constants.js';
import { detectPromptInjection } from '../security/injection.detector.js';
import { detectSecurityIncident } from '../security/security.detector.js';
import { classifyTicketWithGemini, GeminiProviderError } from '../services/gemini.service.js';
import { validateAnalyzeResponse } from '../validators/response.validator.js';

export async function analyzeWithGenerativeEngine(message) {
  const securityCheck = detectSecurityIncident(message);
  const injectionCheck = detectPromptInjection(message);

  // Llamada real a Google Gemini API (no se simulan respuestas)
  const modelResult = await classifyTicketWithGemini(message);

  // Aplicar reglas de seguridad y revisión humana (Guardrail de salida)
  let category = modelResult?.category;
  let priority = modelResult?.priority;

  // Si nuestro detector determinista detecta un intento de Prompt Injection
  // y el modelo hubiese sido engañado, forzamos la política de seguridad:
  if (injectionCheck.isInjectionAttempt) {
    category = CATEGORIES.SECURITY;
    if (priority === PRIORITIES.LOW || priority === PRIORITIES.MEDIUM) {
      priority = PRIORITIES.HIGH;
    }
  }

  const requiresHumanReview = Boolean(
    modelResult?.requiresHumanReview ||
      category === CATEGORIES.SECURITY ||
      priority === PRIORITIES.CRITICAL ||
      securityCheck.isSecurityIncident ||
      injectionCheck.isInjectionAttempt
  );

  const candidateResponse = {
    category,
    priority,
    response: typeof modelResult?.response === 'string' ? modelResult.response.trim() : '',
    requiresHumanReview,
    mode: MODES.GENERATIVE,
  };

  const validation = validateAnalyzeResponse(candidateResponse, MODES.GENERATIVE);

  if (!validation.valid) {
    throw new GeminiProviderError(
      'La respuesta generada por el modelo no cumplió con el contrato JSON esperado.',
      502,
      validation.errors
    );
  }

  return validation.data;
}
