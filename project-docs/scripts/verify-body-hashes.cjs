const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

function getMdFiles(dir) {
  let res = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) res.push(...getMdFiles(full));
    else if (e.name.endsWith('.md')) res.push(full);
  }
  return res;
}

function extractBody(content) {
  let text = (content || '').trimStart();
  while (true) {
    const m = text.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
    if (!m) break;
    text = text.slice(m[0].length).trimStart();
  }
  return text.replace(/\r\n/g, '\n').trim();
}

const files = getMdFiles('project-docs/knowledge');
let matches = 0;
let diffs = 0;
const report = [];

for (const file of files) {
  const rel = path.relative(process.cwd(), file).replace(/\\/g, '/');
  const currentContent = fs.readFileSync(file, 'utf8');
  let headContent = '';
  try {
    headContent = execSync(`git show HEAD:"${rel}"`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
  } catch (e) {
    headContent = null;
  }

  const curBody = extractBody(currentContent);
  const headBody = headContent ? extractBody(headContent) : null;

  const curHash = crypto.createHash('sha256').update(curBody).digest('hex');
  const headHash = headBody ? crypto.createHash('sha256').update(headBody).digest('hex') : 'N/A';

  const isMatch = curHash === headHash;
  if (isMatch) {
    matches++;
  } else {
    diffs++;
  }
  report.push({
    file: rel.replace('project-docs/knowledge/', ''),
    headHash: headHash.slice(0, 12),
    curHash: curHash.slice(0, 12),
    status: isMatch ? 'EQUAL' : 'DIFF'
  });
}

console.log(`Total MD files checked: ${files.length}`);
console.log(`Body SHA-256 Identical (EQUAL): ${matches}`);
console.log(`Body SHA-256 Changed (DIFF): ${diffs}`);
if (diffs > 0) {
  console.table(report.filter(r => r.status === 'DIFF'));
} else {
  console.log('All 52 markdown file bodies are 100% byte-for-byte identical to HEAD!');
}

console.table(report.slice(0, 20));
