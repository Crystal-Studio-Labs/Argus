/**
 * Atlas Skill
 * Generates a Mermaid.js flowchart mapping the structural changes in a git diff.
 * 
 * @param {string} diffText - Git diff content.
 * @param {object} [aiClient] - Optional GoogleGenAI or OpenAI client instance.
 * @returns {Promise<string>} Mermaid.js flowchart markdown string starting with `flowchart TD`.
 */
async function generateTopologyMap(diffText, aiClient = null) {
  if (!diffText || typeof diffText !== 'string' || diffText.trim() === '') {
    return '```mermaid\nflowchart TD\n    NoChanges["No structural changes detected"]\n```';
  }

  if (!aiClient) {
    // Fallback static diagram generator when AI client is not supplied
    const fileMatches = [...diffText.matchAll(/diff --git a\/(.+?) b\/(.+?)/g)];
    if (fileMatches.length === 0) {
      return '```mermaid\nflowchart TD\n    PR["Pull Request"] --> Diff["Modified Files"]\n```';
    }
    let diagram = '```mermaid\nflowchart TD\n';
    fileMatches.forEach((m, idx) => {
      const fileName = m[2].replace(/[^a-zA-Z0-9_.]/g, '_');
      diagram += `    Node${idx}["📄 ${m[2]}"]\n`;
    });
    diagram += '```';
    return diagram;
  }

  const prompt = `
You are Atlas, the system visualizer agent of ARGUS.
Analyze the following git diff and convert it into a Mermaid.js flowchart diagram.
Map changed components, modified files, structural dependency changes, or function control flows.

Output ONLY the Mermaid.js code block wrapped in \`\`\`mermaid and \`\`\`.
Ensure the diagram syntax begins with \`flowchart TD\`.

Git Diff:
${diffText}
`;

  try {
    let responseText = '';
    if (aiClient.models && typeof aiClient.models.generateContent === 'function') {
      const res = await aiClient.models.generateContent({
        model: 'gemini-2.0-flash',
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

    const match = responseText.match(/```mermaid([\s\S]*?)```/);
    let diagramContent = match ? match[1].trim() : responseText.trim();
    if (!diagramContent.startsWith('flowchart') && !diagramContent.startsWith('graph')) {
      diagramContent = `flowchart TD\n${diagramContent}`;
    }
    return `\`\`\`mermaid\n${diagramContent}\n\`\`\``;
  } catch (error) {
    return `\`\`\`mermaid\nflowchart TD\n    Error["Atlas error: ${error.message.replace(/"/g, "'")}"]\n\`\`\``;
  }
}

module.exports = generateTopologyMap;
module.exports.generateTopologyMap = generateTopologyMap;
