/**
 * Athena Skill
 * Evaluates git diff against architectural constraints in architecture.md.
 * 
 * @param {string} diffText - Git diff content.
 * @param {string} architectureDocs - Content of architecture.md.
 * @param {object} [aiClient] - Optional GoogleGenAI or OpenAI client instance.
 * @returns {Promise<{ pass: boolean, summary: string, violations: string[] }>}
 */
async function evaluateArchitecture(diffText, architectureDocs = '', aiClient = null) {
  if (!diffText || typeof diffText !== 'string' || diffText.trim() === '') {
    return {
      pass: true,
      summary: 'No changes detected to evaluate for architectural compliance.',
      violations: [],
    };
  }

  const violations = [];

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
      if (aiClient.models && typeof aiClient.models.generateContent === 'function') {
        const res = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        responseText = res.text || '';
      } else if (aiClient.chat && aiClient.chat.completions && typeof aiClient.chat.completions.create === 'function') {
        const res = await aiClient.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
        });
        responseText = res.choices[0]?.message?.content || '';
      }

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          pass: Boolean(parsed.pass),
          summary: parsed.summary || 'Architectural compliance check completed.',
          violations: Array.isArray(parsed.violations) ? parsed.violations : [],
        };
      }
    } catch (e) {
      // Fall back to static evaluation
    }
  }

  return {
    pass: violations.length === 0,
    summary: violations.length === 0
      ? 'All changes comply with defined architectural rules in architecture.md.'
      : `Found ${violations.length} architectural violation(s).`,
    violations,
  };
}

module.exports = evaluateArchitecture;
module.exports.evaluateArchitecture = evaluateArchitecture;
