import { z } from 'zod';
import { MAX_MESSAGE_LENGTH, MODE_VALUES } from '../config/constants.js';

export const analyzeRequestSchema = z
  .object({
    message: z
      .string({
        required_error: 'El campo "message" es obligatorio.',
        invalid_type_error: 'El campo "message" debe ser una cadena de texto.',
      })
      .trim()
      .min(1, 'El campo "message" no puede estar vacío.')
      .max(
        MAX_MESSAGE_LENGTH,
        `El campo "message" no puede superar los ${MAX_MESSAGE_LENGTH} caracteres.`
      ),
    mode: z.enum(MODE_VALUES, {
      required_error: 'El campo "mode" es obligatorio.',
      invalid_type_error: 'El campo "mode" debe ser "traditional" o "generative".',
      message: 'El campo "mode" solo acepta los valores "traditional" o "generative".',
    }),
  })
  .strict({
    message: 'La solicitud contiene propiedades no permitidas. Solo se aceptan "message" y "mode".',
  });

export function validateAnalyzeRequest(payload) {
  const result = analyzeRequestSchema.safeParse(payload);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.') || 'body',
      message: issue.message,
    }));

    return {
      valid: false,
      errors,
    };
  }

  return {
    valid: true,
    data: result.data,
  };
}
