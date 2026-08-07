const { describe, it } = require('node:test');
const assert = require('assert');
const generateTopologyMap = require('../skills/atlas');
const evaluateArchitecture = require('../skills/athena');
const detectTechnicalDebt = require('../skills/hermes');

describe('ARGUS Skills Unit Test Suite', () => {
  it('Atlas (generateTopologyMap) - returns valid flowchart TD block', async () => {
    const emptyMap = await generateTopologyMap('');
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
  });

  it('Athena (evaluateArchitecture) - cross-references diff against architecture.md', async () => {
    const emptyAthena = await evaluateArchitecture('', '');
    assert.strictEqual(emptyAthena.pass, true, 'Athena pass should be true for empty diff');
    assert.strictEqual(typeof emptyAthena.summary, 'string', 'Athena summary must be a string');
    assert.strictEqual(Array.isArray(emptyAthena.violations), true, 'Athena violations must be an array');

    const sampleDiff = `diff --git a/index.js b/index.js`;
    const archDocs = '# Stack\n* Node.js GitHub Action';
    const evalResult = await evaluateArchitecture(sampleDiff, archDocs);
    assert.strictEqual(typeof evalResult.pass, 'boolean', 'Athena eval result pass must be a boolean');
    assert.strictEqual(typeof evalResult.summary, 'string', 'Athena summary must be a string');
  });

  it('Hermes (detectTechnicalDebt) - scans TODOs, FIXMEs, and empty function stubs', async () => {
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
  });
});
