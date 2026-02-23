const path = require('path');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
}

const { getRulesContent } = require('../server/generator');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rules = await getRulesContent();
    res.json({ rules });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load rules' });
  }
};
