const assert = require('assert');
const generateMermaidDiagram = require('./skills/atlas');
const checkCompliance = require('./skills/athena');
const scanFiles = require('./skills/hermes');
const { run } = require('./index');

async function runTests() {
  console.log('Running ARGUS Unit Tests...');

  // Test 1: Atlas with empty diff
  const atlasResult = await generateMermaidDiagram('', null);
  assert.strictEqual(atlasResult.includes('mermaid'), true, 'Atlas should return mermaid diagram block');
  console.log('✔ Atlas empty diff test passed');

  // Test 2: Athena with empty diff
  const athenaResult = await checkCompliance('', '', null);
  assert.strictEqual(typeof athenaResult, 'string', 'Athena should return string');
  console.log('✔ Athena empty diff test passed');

  // Test 3: Hermes with static TODO detection
  const hermesResult = await scanFiles([
    { path: 'sample.js', content: '// TODO: fix this\nfunction foo() {}' }
  ], null);
  assert.strictEqual(hermesResult.includes('TODOs found'), true, 'Hermes should detect TODOs');
  console.log('✔ Hermes static scan test passed');

  // Test 4: Verify index export
  assert.strictEqual(typeof run, 'function', 'index.js should export run function');
  console.log('✔ index.js export test passed');

  console.log('\nAll ARGUS unit tests passed successfully! 🎉');
}

runTests().catch((err) => {
  console.error('Test runner failed:', err);
  process.exit(1);
});
