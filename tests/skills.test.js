const assert = require('assert');
const generateTopologyMap = require('../skills/atlas');
const evaluateArchitecture = require('../skills/athena');
const detectTechnicalDebt = require('../skills/hermes');

async function runTests() {
  console.log('Running ARGUS Skills Unit Test Suite...\n');

  // Test 1: Atlas - generateTopologyMap
  console.log('1. Testing Atlas (generateTopologyMap)...');
  const emptyDiff = '';
  const emptyMap = await generateTopologyMap(emptyDiff);
  assert.strictEqual(emptyMap.includes('flowchart TD'), true, 'Atlas output must contain flowchart TD');
  assert.strictEqual(emptyMap.includes('mermaid'), true, 'Atlas output must be wrapped in mermaid block');

  const sampleDiff = `diff --git a/index.js b/index.js
index 123456..789abc 100644
--- a/index.js
+++ b/index.js
@@ -1,3 +1,4 @@
+const core = require('@actions/core');
`;
  const topologyMap = await generateTopologyMap(sampleDiff);
  assert.strictEqual(topologyMap.includes('flowchart TD'), true, 'Atlas output for diff must contain flowchart TD');
  console.log('   ✔ Atlas tests passed!\n');

  // Test 2: Athena - evaluateArchitecture
  console.log('2. Testing Athena (evaluateArchitecture)...');
  const emptyAthena = await evaluateArchitecture('', '');
  assert.strictEqual(emptyAthena.pass, true, 'Athena pass should be true for empty diff');
  assert.strictEqual(typeof emptyAthena.summary, 'string', 'Athena summary must be a string');
  assert.strictEqual(Array.isArray(emptyAthena.violations), true, 'Athena violations must be an array');

  const archDocs = '# Stack\n* Node.js GitHub Action';
  const evalResult = await evaluateArchitecture(sampleDiff, archDocs);
  assert.strictEqual(typeof evalResult.pass, 'boolean', 'Athena eval result pass must be a boolean');
  assert.strictEqual(typeof evalResult.summary, 'string', 'Athena summary must be a string');
  console.log('   ✔ Athena tests passed!\n');

  // Test 3: Hermes - detectTechnicalDebt
  console.log('3. Testing Hermes (detectTechnicalDebt)...');
  const noDebt = await detectTechnicalDebt([]);
  assert.strictEqual(noDebt.debtFound, false, 'Hermes debtFound should be false for empty files');
  assert.deepStrictEqual(noDebt.items, [], 'Hermes items should be empty array for empty files');

  const sampleFiles = [
    {
      path: 'src/app.js',
      content: `
function processData() {
  // TODO: implement real logic
  throw new Error("Not implemented");
}
// FIXME: handle null case
`,
    },
  ];
  const debtResult = await detectTechnicalDebt(sampleFiles);
  assert.strictEqual(debtResult.debtFound, true, 'Hermes should detect technical debt');
  assert.strictEqual(debtResult.items.length >= 2, true, 'Hermes should flag at least 2 items');

  const todoItem = debtResult.items.find(i => i.issue.includes('TODO'));
  assert.ok(todoItem, 'Hermes should flag TODO');
  assert.strictEqual(todoItem.file, 'src/app.js', 'Hermes should log correct filename');
  assert.strictEqual(todoItem.line, 3, 'Hermes should log correct line number for TODO');
  console.log('   ✔ Hermes tests passed!\n');

  console.log('🎉 All ARGUS skills unit tests passed successfully!');
}

runTests().catch(err => {
  console.error('❌ Skills test runner failed:', err);
  process.exit(1);
});
