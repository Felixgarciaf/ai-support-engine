/**
 * Security Detector
 * Responsabilidad: Identificar incidentes reales de seguridad, vulnerabilidades,
 * fugas de credenciales o accesos no autorizados reportados en el mensaje.
 */

const SECURITY_PATTERNS = [
  { pattern: /\b(sql\s*injection|sqli|inyecci[oó]n\s*sql)\b/i, weight: 6, critical: true },
  { pattern: /\b(xss|cross[\s-]*site\s*scripting|csrf|ssrf|rce|remote\s*code\s*execution)\b/i, weight: 6, critical: true },
  { pattern: /\b(vulnerabilidad|vulnerability|exploit|zero[\s-]*day|cve-\d{4}-\d+)\b/i, weight: 5, critical: false },
  { pattern: /\b(brecha|data\s*breach|fuga\s*de\s*datos|datos\s*expuestos|credenciales\s*expuestas|token\s*expuesto|api\s*key\s*filtrada)\b/i, weight: 6, critical: true },
  { pattern: /\b(hackearon|hackeado|comprometid[oa]|acceso\s*no\s*autorizado|intruso|suplantaci[oó]n|phishing|malware|ransomware)\b/i, weight: 5, critical: true },
  { pattern: /\b(bypass\s*de\s*autenticaci[oó]n|escalada\s*de\s*privilegios|privilege\s*escalation)\b/i, weight: 6, critical: true },
  { pattern: /\b(seguridad|ciberseguridad|auditor[ií]a\s*de\s*seguridad|certificado\s*ssl\s*vencido)\b/i, weight: 3, critical: false },
];

export function detectSecurityIncident(message) {
  if (typeof message !== 'string' || !message.trim()) {
    return {
      isSecurityIncident: false,
      isCriticalSecurity: false,
      score: 0,
      matchedRules: [],
    };
  }

  let score = 0;
  let isCriticalSecurity = false;
  const matchedRules = [];

  for (const rule of SECURITY_PATTERNS) {
    if (rule.pattern.test(message)) {
      score += rule.weight;
      if (rule.critical) {
        isCriticalSecurity = true;
      }
      matchedRules.push(rule.pattern.source);
    }
  }

  return {
    isSecurityIncident: score >= 3,
    isCriticalSecurity,
    score,
    matchedRules,
  };
}
