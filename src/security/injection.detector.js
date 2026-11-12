/**
 * Injection Detector
 * Responsabilidad: Identificar instrucciones maliciosas dirigidas al modelo o al
 * clasificador (Prompt Injection, Jailbreak, extracción de System Prompt o
 * manipulación de prioridad/categoría).
 */

const INJECTION_PATTERNS = [
  {
    name: 'ignore_previous_instructions',
    pattern: /\b(ignora|olvida|descarta|ignore|disregard|forget)\b.{0,40}\b(instrucciones|reglas|anteriores|previas|previous|instructions|rules|system)\b/i,
  },
  {
    name: 'forced_classification_override',
    pattern: /\b(clasifica|asigna|pon|establece|classify|set|mark)\b.{0,50}\b(prioridad\s*(baja|low)|como\s*low|requiresHumanReview\s*[:=]?\s*false)\b/i,
  },
  {
    name: 'system_prompt_extraction',
    pattern: /\b(revela|muestra|imprime|dime|escribe|reveal|show|print|output)\b.{0,40}\b(prompt\s*del\s*sistema|system\s*prompt|instrucciones\s*ocultas|instrucciones\s*internas|configuraci[oó]n\s*interna|api\s*key)\b/i,
  },
  {
    name: 'roleplay_or_jailbreak',
    pattern: /\b(ahora\s*eres|act[uú]a\s*como\s*si\s*no\s*tuvieras\s*reglas|modo\s*desarrollador|developer\s*mode|dan\s*mode|jailbreak)\b/i,
  },
];

export function detectPromptInjection(message) {
  if (typeof message !== 'string' || !message.trim()) {
    return {
      isInjectionAttempt: false,
      matchedPatterns: [],
    };
  }

  const matchedPatterns = [];

  for (const rule of INJECTION_PATTERNS) {
    if (rule.pattern.test(message)) {
      matchedPatterns.push(rule.name);
    }
  }

  return {
    isInjectionAttempt: matchedPatterns.length > 0,
    matchedPatterns,
  };
}
