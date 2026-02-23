/**
 * One-time setup script: populates Google Sheets tabs from local .md files.
 * Run with: node server/setup-sheet.js
 */

const path = require('path');
const fs = require('fs').promises;
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { ensureTabsExist, writeRuleToSheet } = require('./sheets');

const FILES = {
  brandVoice: path.join(__dirname, 'rules/brand-voice.md'),
  playbook: path.join(__dirname, 'rules/whatsapp-playbook.md'),
  dosAndDonts: path.join(__dirname, 'rules/dos-and-donts.md'),
  trainingExamples: path.join(__dirname, 'data/training-examples.md'),
};

async function run() {
  console.log('🔧 Setting up Google Sheets...\n');

  console.log('Creating tabs if they don\'t exist...');
  await ensureTabsExist();
  console.log('✅ Tabs ready\n');

  for (const [key, filePath] of Object.entries(FILES)) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      process.stdout.write(`Writing "${key}"...`);
      await writeRuleToSheet(key, content);
      console.log(' ✅');
    } catch (err) {
      console.log(` ❌ Failed: ${err.message}`);
    }
  }

  console.log('\n✅ Sheet populated successfully!');
  console.log(`🔗 View your sheet: ${process.env.GOOGLE_SHEET_URL}`);
}

run().catch((err) => {
  console.error('\n❌ Setup failed:', err.message);
  process.exit(1);
});
