/**
 * Hermes Skill
 * Scans changed files for technical debt, TODOs, FIXMEs, and empty placeholder function bodies.
 * 
 * @param {Array<{path: string, content: string}>|Object<string, string>} fileContentsMap - File list or path->content map.
 * @param {object} [aiClient] - Optional GoogleGenAI or OpenAI client instance.
 * @returns {Promise<{ debtFound: boolean, items: Array<{ file: string, line: number, issue: string }> }>}
 */
async function detectTechnicalDebt(fileContentsMap, aiClient = null) {
  const items = [];

  // Normalize input into an array of { file, content }
  let filesList = [];
  if (Array.isArray(fileContentsMap)) {
    filesList = fileContentsMap.map(f => ({ file: f.path || f.file, content: f.content || '' }));
  } else if (fileContentsMap && typeof fileContentsMap === 'object') {
    filesList = Object.entries(fileContentsMap).map(([file, content]) => ({ file, content }));
  }

  if (filesList.length === 0) {
    return { debtFound: false, items: [] };
  }

  for (const { file, content } of filesList) {
    if (!content || typeof content !== 'string') continue;
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      if (/\/\/\s*TODO\b/i.test(trimmed) || /#\s*TODO\b/i.test(trimmed)) {
        items.push({ file, line: lineNum, issue: `TODO flagged: "${trimmed}"` });
      }
      if (/\/\/\s*FIXME\b/i.test(trimmed) || /#\s*FIXME\b/i.test(trimmed)) {
        items.push({ file, line: lineNum, issue: `FIXME flagged: "${trimmed}"` });
      }
      if (/throw\s+new\s+Error\s*\(\s*['"]Not implemented['"]\s*\)/i.test(trimmed)) {
        items.push({ file, line: lineNum, issue: 'Unimplemented method stub detected' });
      }
      if (/function\s+\w+\s*\([^)]*\)\s*\{\s*\}/.test(trimmed) || /\w+\s*\([^)]*\)\s*=>\s*\{\s*\}/.test(trimmed)) {
        items.push({ file, line: lineNum, issue: 'Empty function body detected' });
      }
    });

    if (aiClient) {
      const prompt = `
You are Hermes, the code scanner agent of ARGUS.
Analyze the following file for empty function stubs, placeholders, or missing docs.

Return a JSON array of issues:
[
  { "line": 12, "issue": "Description of placeholder or empty function" }
]
If no issues exist, return [].

File: ${file}
Content:
${content}
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

        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed)) {
            parsed.forEach(item => {
              if (item.line && item.issue) {
                if (!items.some(existing => existing.file === file && existing.line === Number(item.line))) {
                  items.push({ file, line: Number(item.line), issue: String(item.issue) });
                }
              }
            });
          }
        }
      } catch (e) {
        // Ignore LLM errors and rely on static scan items
      }
    }
  }

  return {
    debtFound: items.length > 0,
    items,
  };
}

module.exports = detectTechnicalDebt;
module.exports.detectTechnicalDebt = detectTechnicalDebt;
