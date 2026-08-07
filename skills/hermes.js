/**
 * Hermes Skill
 * Advanced technical debt scanner for TODOs, FIXMEs, hardcoded secrets, console logs, and empty function stubs.
 * 
 * @param {Array<{path: string, content: string}>|Object<string, string>} fileContentsMap - File list or path->content map.
 * @param {object} [aiClient] - Universal OpenAI or GoogleGenAI client instance.
 * @param {string} [modelName] - Optional AI model name override.
 * @returns {Promise<{ debtFound: boolean, items: Array<{ file: string, line: number, issue: string, severity: 'BLOCK'|'WARN'|'INFO' }> }>}
 */
async function detectTechnicalDebt(fileContentsMap, aiClient = null, modelName = null) {
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

      // 1. TODO / FIXME / HACK scanning
      if (/\/\/\s*TODO\b/i.test(trimmed) || /#\s*TODO\b/i.test(trimmed)) {
        items.push({ file, line: lineNum, issue: `TODO flagged: "${trimmed}"`, severity: 'WARN' });
      }
      if (/\/\/\s*FIXME\b/i.test(trimmed) || /#\s*FIXME\b/i.test(trimmed)) {
        items.push({ file, line: lineNum, issue: `FIXME flagged: "${trimmed}"`, severity: 'BLOCK' });
      }

      // 2. Unimplemented Stubs & Empty Functions
      if (/throw\s+new\s+Error\s*\(\s*['"]Not implemented['"]\s*\)/i.test(trimmed)) {
        items.push({ file, line: lineNum, issue: 'Unimplemented method stub detected', severity: 'BLOCK' });
      }
      if (/function\s+\w+\s*\([^)]*\)\s*\{\s*\}/.test(trimmed) || /\w+\s*\([^)]*\)\s*=>\s*\{\s*\}/.test(trimmed)) {
        items.push({ file, line: lineNum, issue: 'Empty function body detected', severity: 'BLOCK' });
      }

      // 3. Leftover Debug Console Logs
      if (/console\.(log|debug)\s*\(/.test(trimmed) && !file.includes('test') && !file.includes('index.js')) {
        items.push({ file, line: lineNum, issue: `Debug log statement: "${trimmed}"`, severity: 'INFO' });
      }

      // 4. Hardcoded Secrets Heuristics
      if (/(api[_-]?key|secret[_-]?key|auth[_-]?token)\s*[:=]\s*['"][a-zA-Z0-9_\-]{16,}['"]/i.test(trimmed)) {
        items.push({ file, line: lineNum, issue: 'Possible hardcoded secret or API key detected', severity: 'BLOCK' });
      }
    });

    if (aiClient) {
      const prompt = `
You are Hermes, the code scanner agent of ARGUS.
Analyze the following file for empty function stubs, placeholders, or security issues.

Return a JSON array of issues:
[
  { "line": 12, "issue": "Description of placeholder or issue", "severity": "BLOCK" | "WARN" | "INFO" }
]
If no issues exist, return [].

File: ${file}
Content:
${content}
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

        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed)) {
            parsed.forEach(item => {
              if (item.line && item.issue) {
                if (!items.some(existing => existing.file === file && existing.line === Number(item.line))) {
                  items.push({
                    file,
                    line: Number(item.line),
                    issue: String(item.issue),
                    severity: item.severity || 'WARN',
                  });
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
