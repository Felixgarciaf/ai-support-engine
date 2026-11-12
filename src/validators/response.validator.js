import { z } from 'zod';
import { CATEGORY_VALUES, MODE_VALUES, PRIORITY_VALUES } from '../config/constants.js';

export const analyzeResponseSchema = z
  .object({
    category: z.enum(CATEGORY_VALUES),
    priority: z.enum(PRIORITY_VALUES),
    response: z.string().trim().min(1, 'La respuesta generada no puede estar vacía.'),
    requiresHumanReview: z.boolean(),
    mode: z.enum(MODE_VALUES),
  })
  .strict();

export function validateAnalyzeResponse(payload, expectedMode) {
  const result = analyzeResponseSchema.safeParse(payload);

  if (!result.success) {
    return {
      valid: false,
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    };
  }

  if (expectedMode && result.data.mode !== expectedMode) {
    return {
      valid: false,
      errors: [
        {
          field: 'mode',
          message: `El modo devuelto (${result.data.mode}) no coincide con el modo solicitado (${expectedMode}).`,
        },
      ],
    };
  }

  return {
    valid: true,
    data: result.data,
  };
}
