const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const { generateCopy, getRulesContent } = require('./generator');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/generate', async (req, res) => {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not set. Add it to your .env file.' });
  }

  const { campaignType, audience, keyMessage, tone, variantCount, additionalContext } = req.body;

  if (!campaignType || !audience || !keyMessage) {
    return res.status(400).json({ error: 'Missing required fields: campaignType, audience, keyMessage' });
  }

  try {
    const variants = await generateCopy({
      campaignType,
      audience,
      keyMessage,
      tone,
      variantCount: parseInt(variantCount) || 3,
      additionalContext,
    });
    res.json({ variants });
  } catch (err) {
    console.error('Generation error:', err.message);
    res.status(500).json({ error: err.message || 'Generation failed' });
  }
});

app.get('/api/rules', async (req, res) => {
  try {
    const rules = await getRulesContent();
    res.json({ rules });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load rules' });
  }
});

app.put('/api/rules/:key', async (req, res) => {
  const { key } = req.params;
  const { content } = req.body;

  const FILE_MAP = {
    brandVoice: path.join(__dirname, 'rules/brand-voice.md'),
    playbook: path.join(__dirname, 'rules/whatsapp-playbook.md'),
    dosAndDonts: path.join(__dirname, 'rules/dos-and-donts.md'),
    trainingExamples: path.join(__dirname, 'data/training-examples.md'),
  };

  if (!FILE_MAP[key]) {
    return res.status(400).json({ error: `Unknown rules key: ${key}` });
  }
  if (typeof content !== 'string') {
    return res.status(400).json({ error: 'Content must be a string' });
  }

  try {
    const fs = require('fs').promises;
    await fs.writeFile(FILE_MAP[key], content, 'utf-8');
    res.json({ success: true });
  } catch (err) {
    console.error('Rules save error:', err.message);
    res.status(500).json({ error: 'Failed to save rules file' });
  }
});

// In production, serve the built React app from Express
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
