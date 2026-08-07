/**
 * Hermes Skill
 * Scans changed files for unresolved TODOs, FIXMEs, and empty placeholder functions.
 * 
 * @param {Array<{path: string, content: string}>} changedFiles - List of changed file paths and their contents.
 * @param {object} ai - The GoogleGenAI client instance.
 * @returns {Promise<string>} Report listing any stubs, placeholders, or TODOs.
 */
async function scanFiles(changedFiles, ai) {
  if (!changedFiles || changedFiles.length === 0) {
    return 'No changed files to scan for placeholders or TODOs.';
  }

  let report = '### Hermes Scan Report\n\n';
  let issueCount = 0;

  for (const file of changedFiles) {
    const lines = file.content.split('\n');
    const todos = [];
    const fixmes = [];

    // Static Scan
    lines.forEach((line, index) => {
      if (/\/\/\s*TODO\b/i.test(line)) {
        todos.push({ line: index + 1, text: line.trim() });
      }
      if (/\/\/\s*FIXME\b/i.test(line)) {
        fixmes.push({ line: index + 1, text: line.trim() });
      }
    });

    // LLM scan for placeholder functions in the file
    const prompt = `
You are Hermes, the code scanner agent of ARGUS.
Analyze the following file content and search for:
1. Empty function bodies (e.g., function definitions with no implementation or only comments/placeholders inside).
2. Placeholder/stub statements (e.g., throwing "Not implemented" or "Write code here").

List any such occurrences with approximate line numbers or function names. If none exist, output "NO PLACEHOLDERS".

File Path: ${file.path}
Content:
\`\`\`
${file.content}
\`\`\`
`;

    let placeholdersText = 'None';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      const responseText = response.text || '';
      if (!responseText.includes('NO PLACEHOLDERS')) {
        placeholdersText = responseText.trim();
      }
    } catch (e) {
      placeholdersText = `Error scanning file: ${e.message}`;
    }

    if (todos.length > 0 || fixmes.length > 0 || placeholdersText !== 'None') {
      issueCount++;
      report += `#### 📄 File: \`${file.path}\`\n`;
      if (todos.length > 0) {
        report += `**TODOs found:**\n`;
        todos.forEach(t => {
          report += `- Line ${t.line}: \`${t.text}\`\n`;
        });
      }
      if (fixmes.length > 0) {
        report += `**FIXMEs found:**\n`;
        fixmes.forEach(f => {
          report += `- Line ${f.line}: \`${f.text}\`\n`;
        });
      }
      if (placeholdersText !== 'None') {
        report += `**Placeholder/Stub analysis:**\n${placeholdersText}\n`;
      }
      report += `\n`;
    }
  }

  if (issueCount === 0) {
    report += '✅ No TODOs, FIXMEs, or empty placeholder functions detected in changed files.';
  } else {
    report += `⚠️ Found issues in ${issueCount} file(s). Please resolve them before merging.`;
  }

  return report;
}

module.exports = scanFiles;
