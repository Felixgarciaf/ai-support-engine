import { analyzeWithTraditionalEngine } from '../src/engines/traditional.engine.js';
import { validateAnalyzeResponse } from '../src/validators/response.validator.js';
import { TEST_CASES } from './cases.js';

console.log('=== PRUEBA INDIVIDUAL DEL MOTOR TRADICIONAL ===\n');

let passed = 0;
for (const testCase of TEST_CASES) {
  const result = analyzeWithTraditionalEngine(testCase.message);
  const validation = validateAnalyzeResponse(result, 'traditional');
  const isCatOk = result.category === testCase.expectedCategory;
  const isPrioOk = result.priority === testCase.expectedPriority;

  if (validation.valid && isCatOk) {
    passed++;
  }

  console.log(
    `[${testCase.id}] ${testCase.type}\n` +
      `  Mensaje: "${testCase.message}"\n` +
      `  Esperado: ${testCase.expectedCategory} (${testCase.expectedPriority}) | Obtenido: ${result.category} (${result.priority})\n` +
      `  requiresHumanReview: ${result.requiresHumanReview} | Contrato JSON válido: ${validation.valid}\n`
  );
}

console.log(`Resumen Motor Tradicional: ${passed}/${TEST_CASES.length} categorías acertadas.`);
