const { describe, it } = require('node:test');
const assert = require('assert');
const { run } = require('./index');

describe('ARGUS Action Entry Point Test', () => {
  it('index.js exports run function', () => {
    assert.strictEqual(typeof run, 'function', 'index.js must export run function');
  });
});
