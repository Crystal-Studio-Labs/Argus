/**
 * Atlas Skill
 * Generates a Mermaid.js flowchart mapping structural changes in a git diff.
 * 
 * @param {string} diffText - Git diff content.
 * @param {object} [aiClient] - Universal OpenAI or GoogleGenAI client instance.
 * @param {string} [modelName] - Optional AI model name override.
 * @returns {Promise<string>} Mermaid.js flowchart markdown string starting with `flowchart TD`.
 */
async function generateTopologyMap(diffText, aiClient = null, modelName = null) {
  if (!diffText || typeof diffText !== 'string' || diffText.trim() === '') {
    return '```mermaid\nflowchart TD\n    NoChanges["No structural changes detected"]\n```';
  }

  if (!aiClient) {
    // Static fallback diagram generator
    const fileMatches = [...diffText.matchAll(/diff --git a\/(.+?) b\/(.+?)/g)];
    if (fileMatches.length === 0) {
      return '```mermaid\nflowchart TD\n    PR["Pull Request"] --> Diff["Modified Files"]\n```';
    }
    let diagram = '```mermaid\nflowchart TD\n';
    fileMatches.forEach((m, idx) => {
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

    const match = responseText.match(/```mermaid([\s\S]*?)```/);
    let diagramContent = match ? match[1].trim() : responseText.trim();
    if (!diagramContent.startsWith('flowchart') && !diagramContent.startsWith('graph')) {
      diagramContent = `flowchart TD\n${diagramContent}`;
    }
    return `\`\`\`mermaid\n${diagramContent}\n\`\`\``;
  } catch (error) {
    // Fall back cleanly to static topology diagram on rate limit or API error
    const fileMatches = [...diffText.matchAll(/diff --git a\/(.+?) b\/(.+?)/g)];
    if (fileMatches.length === 0) {
      return '```mermaid\nflowchart TD\n    PR["Pull Request"] --> Diff["Modified Files"]\n```';
    }
    let diagram = '```mermaid\nflowchart TD\n';
    fileMatches.forEach((m, idx) => {
      diagram += `    Node${idx}["📄 ${m[2]}"]\n`;
    });
    diagram += '```';
    return diagram;
  }
}

module.exports = generateTopologyMap;
module.exports.generateTopologyMap = generateTopologyMap;
