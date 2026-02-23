const path = require('path');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
}

const { generateCopy } = require('../server/generator');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not set in environment variables.' });
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
};
