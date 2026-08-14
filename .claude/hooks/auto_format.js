const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Read JSON context passed by Claude Code via stdin
let input = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
  input += chunk;
});

process.stdin.on('end', () => {
  try {
    if (!input.trim()) process.exit(0);

    const payload = JSON.parse(input);
    const filePath = payload?.tool_input?.file_path;

    if (!filePath || !fs.existsSync(filePath)) {
      process.exit(0);
    }

    const ext = path.extname(filePath).toLowerCase();
    const formattableExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.scss', '.md', '.yaml', '.yml'];

    if (formattableExtensions.includes(ext)) {
      try {
        execSync(`npx prettier --write "${filePath}"`, { stdio: 'ignore' });
      } catch (err) {
        // Silently ignore format errors to avoid disrupting Claude Code
      }
    }
  } catch (err) {
    // Fail gracefully
  }
  process.exit(0);
});
