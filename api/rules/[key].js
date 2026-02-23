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
  const { content } = req.body;

  if (!FILE_MAP[key]) {
    return res.status(400).json({ error: `Unknown rules key: ${key}` });
  }
  if (typeof content !== 'string') {
    return res.status(400).json({ error: 'Content must be a string' });
  }

  try {
    await fs.writeFile(FILE_MAP[key], content, 'utf-8');
    res.json({ success: true });
  } catch (err) {
    console.error('Rules save error:', err.message);
    res.status(500).json({
      error: 'Rules cannot be saved in this deployment environment. Edit the files directly in your GitHub repo instead.',
    });
  }
};
