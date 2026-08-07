/**
 * Athena Skill
 * Validates the git diff against the architectural constraints in architecture.md.
 * 
 * @param {string} diffString - The git diff content.
 * @param {string} architectureDocs - Content of architecture.md.
 * @param {object} ai - The GoogleGenAI client instance.
 * @returns {Promise<string>} Architectural compliance review report (Markdown).
 */
async function checkCompliance(diffString, architectureDocs, ai) {
  if (!diffString || diffString.trim() === '') {
    return 'No changes to check for architectural compliance.';
  }

  const prompt = `
You are Athena, the architecture compliance guard of ARGUS.
Evaluate the following git diff against the rules, guidelines, and technology stack defined in architecture.md.

Specifically:
1. Verify if the stack conforms to the Node.js/Gemini guidelines.
2. Verify if the 3-stage pipeline (Atlas, Athena, Hermes) constraints are respected.
3. Identify any violations or architectural mismatches.

Provide a concise, professional markdown compliance report. Use a clear structure highlighting:
- **Compliance Status** (e.g. COMPLIANT, WARNING, or VIOLATION)
- **Observations**
- **Recommendations**

---
### architecture.md:
${architectureDocs}

---
### Git Diff:
${diffString}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || 'No response from Athena compliance analysis.';
  } catch (error) {
    throw new Error(`Athena Skill Error: ${error.message}`);
  }
}

module.exports = checkCompliance;
