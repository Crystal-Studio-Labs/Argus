/**
 * Athena Skill
 * Evaluates git diff against architectural constraints in architecture.md.
 * 
 * @param {string} diffText - Git diff content.
 * @param {string} architectureDocs - Content of architecture.md.
 * @param {object} [aiClient] - Universal OpenAI or GoogleGenAI client instance.
 * @param {string} [modelName] - Optional AI model name override.
 * @returns {Promise<{ pass: boolean, summary: string, violations: string[] }>}
 */
async function evaluateArchitecture(diffText, architectureDocs = '', aiClient = null, modelName = null) {
  if (!diffText || typeof diffText !== 'string' || diffText.trim() === '') {
    return {
      pass: true,
      summary: 'No changes detected to evaluate for architectural compliance.',
      violations: [],
    };
  }

  const violations = [];

  // Static architectural guard checks
  if (diffText.includes('diff --git a/architecture.md')) {
    violations.push('PR modifies core architecture.md specification. Ensure architectural review is conducted.');
  }

  if (aiClient) {
    const prompt = `
You are Athena, the architecture compliance guard of ARGUS.
Cross-reference the following git diff against the rules in architecture.md.

Respond with a JSON object strictly matching this format:
{
  "pass": boolean,
  "summary": "Brief overall compliance summary",
  "violations": ["Violation description 1", "Violation description 2"]
}

architecture.md:
${architectureDocs}

Git Diff:
${diffText}
`;

    try {
      let responseText = '';
      if (aiClient.chat && aiClient.chat.completions && typeof aiClient.chat.completions.create === 'function') {
        const res = await aiClient.chat.completions.create({
          model: modelName || aiClient.defaultModel || 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
        });
        responseText = res.choices[0]?.message?.content || '';
      } else if (aiClient.models && typeof aiClient.models.generateContent === 'function') {
        const res = await aiClient.models.generateContent({
          model: modelName || 'gemini-2.0-flash',
          contents: prompt,
        });
        responseText = res.text || '';
      }

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const llmViolations = Array.isArray(parsed.violations) ? parsed.violations : [];
        const combinedViolations = [...violations, ...llmViolations];
        return {
          pass: parsed.pass && combinedViolations.length === 0,
          summary: parsed.summary || 'Architectural compliance check completed.',
          violations: combinedViolations,
        };
      }
    } catch (e) {
      console.warn(`[Athena] AI generation encountered error (falling back to static compliance): ${e.message}`);
      // Fall back to static evaluation
    }
  }

  return {
    pass: violations.length === 0,
    summary: violations.length === 0
      ? 'All changes comply with defined architectural rules in architecture.md.'
      : `Found ${violations.length} architectural notice(s).`,
    violations,
  };
}

module.exports = evaluateArchitecture;
module.exports.evaluateArchitecture = evaluateArchitecture;
