const path = require('path');
const fs = require('fs').promises;

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.join(__dirname, '../../.env') });
}

const FILE_MAP = {
  brandVoice: path.join(__dirname, '../../server/rules/brand-voice.md'),
  playbook: path.join(__dirname, '../../server/rules/whatsapp-playbook.md'),
  dosAndDonts: path.join(__dirname, '../../server/rules/dos-and-donts.md'),
  trainingExamples: path.join(__dirname, '../../server/data/training-examples.md'),
};

module.exports = async (req, res) => {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { key } = req.query;
  const { content } = req.body || {};

  if (!FILE_MAP[key]) {
    return res.status(400).json({ error: `Unknown rules key: ${key}` });
  }
  if (typeof content !== 'string') {
    return res.status(400).json({ error: 'Content must be a string' });
  }

  // Write to Google Sheets if configured
  if (process.env.GOOGLE_SHEET_ID && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    try {
      const { writeRuleToSheet } = require('../../server/sheets');
      await writeRuleToSheet(key, content);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Sheets write error:', err.message);
      return res.status(500).json({ error: `Failed to save to Google Sheets: ${err.message}` });
    }
  }

  // Fallback: write to local file
  try {
    await fs.writeFile(FILE_MAP[key], content, 'utf-8');
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(503).json({
      hosted: true,
      error: 'Rule editing is disabled. Set up Google Sheets credentials or edit files in GitHub.',
    });
  }
};
