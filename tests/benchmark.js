import 'dotenv/config';
import { MODES } from '../src/config/constants.js';
import { analyzeWithTraditionalEngine } from '../src/engines/traditional.engine.js';
import { analyzeWithGenerativeEngine } from '../src/engines/generative.engine.js';
import { validateAnalyzeResponse } from '../src/validators/response.validator.js';
import { TEST_CASES } from './cases.js';

function evaluateRun(testCase, output, mode) {
  const validation = validateAnalyzeResponse(output, mode);
  const validFormat = validation.valid;
  const categoryMatch = validFormat && output.category === testCase.expectedCategory;
  const priorityMatch = validFormat && output.priority === testCase.expectedPriority;
  const exactMatch = categoryMatch && priorityMatch;

  return {
    id: testCase.id,
    type: testCase.type,
    expectedCategory: testCase.expectedCategory,
    expectedPriority: testCase.expectedPriority,
    obtainedCategory: output?.category ?? 'ERROR',
    obtainedPriority: output?.priority ?? 'ERROR',
    requiresHumanReview: output?.requiresHumanReview ?? false,
    validFormat,
    categoryMatch,
    priorityMatch,
    exactMatch,
    response: output?.response ?? output?.error ?? '',
  };
}

async function runBenchmark() {
  console.log('================================================================================');
  console.log(' AI SUPPORT ENGINE - BENCHMARK COMPARATIVO (12 CASOS DE PRUEBA)');
  console.log('================================================================================\n');

  const traditionalResults = [];
  const generativeResults = [];

  for (const testCase of TEST_CASES) {
    // 1. Evaluar Motor Tradicional
    const tradOutput = analyzeWithTraditionalEngine(testCase.message);
    traditionalResults.push(evaluateRun(testCase, tradOutput, MODES.TRADITIONAL));

    // 2. Evaluar Motor Generativo (Google Gemini)
    try {
      const genOutput = await analyzeWithGenerativeEngine(testCase.message);
      generativeResults.push(evaluateRun(testCase, genOutput, MODES.GENERATIVE));
    } catch (error) {
      generativeResults.push(
        evaluateRun(
          testCase,
          { error: error.message },
          MODES.GENERATIVE
        )
      );
    }
  }

  const total = TEST_CASES.length;

  const tradCategoryHits = traditionalResults.filter((r) => r.categoryMatch).length;
  const tradPriorityHits = traditionalResults.filter((r) => r.priorityMatch).length;
  const tradExactHits = traditionalResults.filter((r) => r.exactMatch).length;

  const genCategoryHits = generativeResults.filter((r) => r.categoryMatch).length;
  const genPriorityHits = generativeResults.filter((r) => r.priorityMatch).length;
  const genExactHits = generativeResults.filter((r) => r.exactMatch).length;

  console.log('--- TABLA COMPARATIVA DE RESULTADOS (MARKDOWN) ---\n');
  console.log(
    '| ID | Tipo | Ref (Cat / Prio) | Tradicional (Cat / Prio) | Formato Trad | Acierto Cat Trad | Generativo (Cat / Prio) | Formato Gen | Acierto Cat Gen |'
  );
  console.log(
    '| :--- | :--- | :--- | :--- | :---: | :---: | :--- | :---: | :---: |'
  );

  for (let i = 0; i < total; i++) {
    const t = traditionalResults[i];
    const g = generativeResults[i];
    console.log(
      `| ${t.id} | ${t.type} | \`${t.expectedCategory}\` / \`${t.expectedPriority}\` | \`${t.obtainedCategory}\` / \`${t.obtainedPriority}\` | ${
        t.validFormat ? 'Sí' : 'No'
      } | ${t.categoryMatch ? 'Correcto' : 'Incorrecto'} | \`${g.obtainedCategory}\` / \`${
        g.obtainedPriority
      }\` | ${g.validFormat ? 'Sí' : 'No'} | ${g.categoryMatch ? 'Correcto' : 'Incorrecto'} |`
    );
  }

  console.log('\n--- MÉTRICAS FINALES ---\n');
  console.log(
    `Motor Tradicional -> Accuracy Categoría: ${((tradCategoryHits / total) * 100).toFixed(2)}% (${tradCategoryHits}/${total}) | Accuracy Prioridad: ${((tradPriorityHits / total) * 100).toFixed(2)}% (${tradPriorityHits}/${total}) | Exact Match: ${((tradExactHits / total) * 100).toFixed(2)}% (${tradExactHits}/${total})`
  );
  console.log(
    `Motor Generativo  -> Accuracy Categoría: ${((genCategoryHits / total) * 100).toFixed(2)}% (${genCategoryHits}/${total}) | Accuracy Prioridad: ${((genPriorityHits / total) * 100).toFixed(2)}% (${genPriorityHits}/${total}) | Exact Match: ${((genExactHits / total) * 100).toFixed(2)}% (${genExactHits}/${total})`
  );
}

runBenchmark();
