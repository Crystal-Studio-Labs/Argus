/**
 * Atlas Skill
 * Converts git diffs into a Mermaid.js diagram string using the Gemini API.
 * 
 * @param {string} diffString - The git diff content.
 * @param {object} ai - The GoogleGenAI client instance.
 * @returns {Promise<string>} Mermaid.js diagram markup.
 */
async function generateMermaidDiagram(diffString, ai) {
  if (!diffString || diffString.trim() === '') {
    return '```mermaid\ngraph TD\n    NoChanges[No structural changes detected]\n```';
  }

  const prompt = `
You are Atlas, the system visualizer agent of ARGUS.
Analyze the following git diff and convert it into a Mermaid.js flowchart showing the structural changes, modified paths, module dependency changes, or function control flows.

Output ONLY the Mermaid.js code block wrapped in \`\`\`mermaid and \`\`\`. Do not add any extra explanations outside the block.

Here is the Git Diff:
${diffString}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text || '';
    // Extract the mermaid code block if present
    const match = text.match(/```mermaid([\s\S]*?)```/);
    return match ? match[0].trim() : text.trim();
  } catch (error) {
    throw new Error(`Atlas Skill Error: ${error.message}`);
  }
}

module.exports = generateMermaidDiagram;
