export const CATEGORIES = Object.freeze({
  ACCESS: 'ACCESS',
  BUG: 'BUG',
  FEATURE: 'FEATURE',
  SECURITY: 'SECURITY',
});

export const CATEGORY_VALUES = Object.freeze(Object.values(CATEGORIES));

export const PRIORITIES = Object.freeze({
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
});

export const PRIORITY_VALUES = Object.freeze(Object.values(PRIORITIES));

export const MODES = Object.freeze({
  TRADITIONAL: 'traditional',
  GENERATIVE: 'generative',
});

export const MODE_VALUES = Object.freeze(Object.values(MODES));

export const MAX_MESSAGE_LENGTH = 4000;

export const DEFAULT_RESPONSES = Object.freeze({
  ACCESS: {
    LOW: 'Hemos recibido su consulta sobre el acceso a la cuenta. Puede gestionar sus opciones de sesión desde el panel de perfil o utilizar el enlace de recuperación.',
    MEDIUM: 'Lamentamos el inconveniente. Verifique sus credenciales y utilice la recuperación de contraseña o restablecimiento de 2FA si es necesario.',
    HIGH: 'Su solicitud de acceso ha sido priorizada. Nuestro equipo de soporte verificará el bloqueo de su cuenta a la brevedad.',
    CRITICAL: 'Incidente crítico de acceso detectado. Se ha escalado inmediatamente al equipo de infraestructura y gestión de identidades.',
  },
  BUG: {
    LOW: 'Gracias por reportar este detalle visual o menor. Lo hemos registrado en el backlog para corregirlo en una próxima actualización.',
    MEDIUM: 'Hemos registrado la falla reportada. Nuestro equipo técnico revisará el comportamiento para solucionarlo pronto.',
    HIGH: 'Lamentamos las molestias. El error reportado afecta una funcionalidad importante y ya fue asignado con prioridad alta a ingeniería.',
    CRITICAL: 'Alerta crítica recibida. El equipo de ingeniería de guardia ya está interviniendo para restablecer la estabilidad del servicio en producción.',
  },
  FEATURE: {
    LOW: 'Gracias por su sugerencia. Hemos registrado su solicitud de nueva funcionalidad para evaluarla en futuras versiones del producto.',
    MEDIUM: 'Agradecemos su propuesta de mejora. El equipo de producto analizará su viabilidad e impacto para incorporarla al roadmap.',
    HIGH: 'Su solicitud de funcionalidad ha sido registrada con alta relevancia para su evaluación prioritaria por el equipo de producto.',
    CRITICAL: 'Solicitud de capacidad crítica registrada y escalada a la dirección de producto.',
  },
  SECURITY: {
    LOW: 'Gracias por su reporte relacionado con seguridad. Nuestro equipo de seguridad de la información revisará la solicitud manualmente.',
    MEDIUM: 'Su notificación de seguridad ha sido registrada y marcada para revisión humana por el equipo de ciberseguridad.',
    HIGH: 'Alerta de seguridad recibida. Hemos activado el protocolo de revisión humana prioritaria con el equipo de SecOps.',
    CRITICAL: 'Incidente crítico de seguridad detectado. La solicitud ha sido bloqueada preventivamente y escalada de inmediato al equipo de respuesta a incidentes (CSIRT).',
  },
});
