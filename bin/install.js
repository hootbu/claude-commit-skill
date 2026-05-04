#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const SOURCE_DIR = path.join(__dirname, '..');
const TARGET_DIR = path.join(os.homedir(), '.claude', 'skills', 'commit');

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

try {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
  copyRecursive(path.join(SOURCE_DIR, 'SKILL.md'), path.join(TARGET_DIR, 'SKILL.md'));
  copyRecursive(path.join(SOURCE_DIR, 'references'), path.join(TARGET_DIR, 'references'));
  console.log(`commit-skill installed to ${TARGET_DIR}`);
  console.log('Restart Claude Code, then use /commit');
} catch (err) {
  console.error(`Install failed: ${err.message}`);
  process.exit(1);
}
