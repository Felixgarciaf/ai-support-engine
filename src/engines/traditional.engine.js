import {
  CATEGORIES,
  DEFAULT_RESPONSES,
  MODES,
  PRIORITIES,
} from '../config/constants.js';
import { detectSecurityIncident } from '../security/security.detector.js';
import { detectPromptInjection } from '../security/injection.detector.js';

/**
 * Reglas simbólicas ponderadas por categoría.
 * Cada regla aporta un peso específico cuando coincide con el mensaje.
 */
const CATEGORY_RULES = {
  [CATEGORIES.SECURITY]: [
    { pattern: /\b(sql\s*injection|sqli|inyecci[oó]n\s*sql|xss|csrf|rce)\b/i, weight: 8 },
    { pattern: /\b(vulnerabilidad|exploit|brecha|fuga\s*de\s*datos|token\s*expuesto|api\s*key)\b/i, weight: 7 },
    { pattern: /\b(hackearon|comprometid[oa]|acceso\s*no\s*autorizado|intruso|suplantaci[oó]n|phishing)\b/i, weight: 7 },
    { pattern: /\b(seguridad|ciberseguridad|incidente\s*de\s*seguridad)\b/i, weight: 4 },
  ],
  [CATEGORIES.ACCESS]: [
    { pattern: /\b(no\s*puedo\s*(iniciar\s*sesi[oó]n|entrar|acceder|loguearme))\b/i, weight: 5 },
    { pattern: /\b(iniciar\s*sesi[oó]n|inicio\s*de\s*sesi[oó]n|login|log\s*in|sign\s*in)\b/i, weight: 3 },
    { pattern: /\b(contrase[ñn]a|password|credenciales|olvid[eé]\s*mi\s*clave|recuperar\s*cuenta)\b/i, weight: 5 },
    { pattern: /\b(2fa|autenticaci[oó]n\s*de\s*dos\s*factores|doble\s*factor|c[oó]digo\s*sms|token\s*de\s*acceso|otp)\b/i, weight: 5 },
    { pattern: /\b(cuenta\s*bloqueada|acceso\s*denegado|permisos\s*de\s*acceso|bloqueo\s*de\s*usuario)\b/i, weight: 4 },
  ],
  [CATEGORIES.BUG]: [
    { pattern: /\b(error\s*(500|502|503|504|404|400)|internal\s*server\s*error|excepci[oó]n|stack\s*trace)\b/i, weight: 7 },
    { pattern: /\b(se\s*(cae|cierra|congela|traba)|pantalla\s*(blanca|en\s*blanco|azul)|crash)\b/i, weight: 5 },
    { pattern: /\b(no\s*(carga|funciona|responde|guarda)|falla|fallo|bug|defecto|roto)\b/i, weight: 4 },
    { pattern: /\b(desalinead[oa]|encimad[oa]|cortad[oa]|interfaz\s*rota|lentitud|muy\s*lento|tarda\s*mucho)\b/i, weight: 4 },
  ],
  [CATEGORIES.FEATURE]: [
    { pattern: /\b(modo\s*oscuro|dark\s*mode|tema\s*oscuro)\b/i, weight: 6 },
    { pattern: /\b(nueva\s*(funci[oó]n|funcionalidad|caracter[ií]stica)|feature\s*request)\b/i, weight: 6 },
    { pattern: /\b(me\s*gustar[ií]a|ser[ií]a\s*(bueno|excelente|[uú]til)|sugerencia|propuesta|mejora)\b/i, weight: 4 },
    { pattern: /\b(agregar|a[ñn]adir|implementar|incluir|integrar|exportar\s*a\s*(pdf|excel|csv))\b/i, weight: 4 },
    { pattern: /\b(quiero\s*que\s*la\s*plataforma|podr[ií]an\s*agregar)\b/i, weight: 4 },
  ],
};

/**
 * Orden de desempate determinista (de mayor a menor criticidad operativa):
 * SECURITY > BUG > ACCESS > FEATURE
 */
const TIE_BREAK_ORDER = [
  CATEGORIES.SECURITY,
  CATEGORIES.BUG,
  CATEGORIES.ACCESS,
  CATEGORIES.FEATURE,
];

function determinePriority(category, message, securityCheck, injectionCheck) {
  // Si es intento de inyección + menciona vulnerabilidad o sistema, es HIGH o CRITICAL
  if (injectionCheck.isInjectionAttempt) {
    if (securityCheck.isCriticalSecurity || /\b(vulnerabilidad|producci[oó]n|cr[ií]tic[oa])\b/i.test(message)) {
      return PRIORITIES.HIGH;
    }
    return PRIORITIES.HIGH;
  }

  // Modificadores explícitos de criticidad e impacto
  const hasCriticalImpact =
    /\b(producci[oó]n|todos\s*los\s*(usuarios|clientes)|ca[ií]do\s*por\s*completo|p[eé]rdida\s*de\s*datos|datos\s*expuestos|urgente\s*en\s*producci[oó]n)\b/i.test(
      message
    );

  const hasHighImpact =
    /\b(urgente|inmediatamente|bloquea\s*el\s*trabajo|no\s*podemos\s*operar|varios\s*usuarios|vulnerabilidad|sql\s*injection|xss|comprometid[oa]|hackearon)\b/i.test(
      message
    );

  const hasLowImpact =
    /\b(detalle\s*visual|est[eé]tico|desalinead[oa]|sugerencia|cuando\s*puedan|no\s*es\s*urgente|modo\s*oscuro|exportar\s*reportes)\b/i.test(
      message
    );

  if (category === CATEGORIES.SECURITY) {
    if (hasCriticalImpact) return PRIORITIES.CRITICAL;
    return PRIORITIES.HIGH;
  }

  if (category === CATEGORIES.BUG) {
    if (hasCriticalImpact) return PRIORITIES.CRITICAL;
    if (hasHighImpact || /\b(error\s*500)\b/i.test(message)) return PRIORITIES.HIGH;
    if (hasLowImpact) return PRIORITIES.LOW;
    return PRIORITIES.MEDIUM;
  }

  if (category === CATEGORIES.ACCESS) {
    if (hasCriticalImpact) return PRIORITIES.CRITICAL;
    if (hasHighImpact) return PRIORITIES.HIGH;
    if (hasLowImpact) return PRIORITIES.LOW;
    return PRIORITIES.MEDIUM;
  }

  // FEATURE
  if (hasHighImpact) return PRIORITIES.MEDIUM;
  return PRIORITIES.LOW;
}

export function analyzeWithTraditionalEngine(message) {
  const securityCheck = detectSecurityIncident(message);
  const injectionCheck = detectPromptInjection(message);

  const scores = {
    [CATEGORIES.SECURITY]: securityCheck.score,
    [CATEGORIES.BUG]: 0,
    [CATEGORIES.ACCESS]: 0,
    [CATEGORIES.FEATURE]: 0,
  };

  for (const [category, rules] of Object.entries(CATEGORY_RULES)) {
    for (const rule of rules) {
      if (rule.pattern.test(message)) {
        scores[category] += rule.weight;
      }
    }
  }

  // Si se detecta un intento de Prompt Injection (ej. T11 o T12),
  // se clasifica como evento de SECURITY y se activa revisión humana.
  if (injectionCheck.isInjectionAttempt) {
    scores[CATEGORIES.SECURITY] += 10;
  }

  // Selección de categoría con orden de desempate determinista
  let selectedCategory = CATEGORIES.ACCESS;
  let maxScore = -1;

  for (const category of TIE_BREAK_ORDER) {
    if (scores[category] > maxScore) {
      maxScore = scores[category];
      selectedCategory = category;
    }
  }

  // Si ninguna regla coincidió (maxScore === 0), asignamos ACCESS / MEDIUM por defecto
  if (maxScore === 0) {
    selectedCategory = CATEGORIES.ACCESS;
  }

  const priority = determinePriority(
    selectedCategory,
    message,
    securityCheck,
    injectionCheck
  );

  const requiresHumanReview =
    selectedCategory === CATEGORIES.SECURITY ||
    priority === PRIORITIES.CRITICAL ||
    securityCheck.isSecurityIncident ||
    injectionCheck.isInjectionAttempt;

  const responseText =
    DEFAULT_RESPONSES[selectedCategory]?.[priority] ||
    DEFAULT_RESPONSES[CATEGORIES.ACCESS][PRIORITIES.MEDIUM];

  return {
    category: selectedCategory,
    priority,
    response: responseText,
    requiresHumanReview,
    mode: MODES.TRADITIONAL,
  };
}
