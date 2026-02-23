const fs = require('fs').promises;
const path = require('path');
const OpenAI = require('openai');

function getOpenAIClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

async function readFileSafe(filePath) {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return '';
  }
}

async function getRulesContent() {
  // Use Google Sheets if credentials are set
  if (process.env.GOOGLE_SHEET_ID && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    try {
      const { getRulesFromSheet } = require('./sheets');
      return await getRulesFromSheet();
    } catch (err) {
      console.warn('Google Sheets read failed, falling back to local .md files:', err.message);
    }
  }

  // Fallback: read from local .md files
  const rulesDir = path.join(__dirname, 'rules');
  const dataDir = path.join(__dirname, 'data');

  const [brandVoice, playbook, dosAndDonts, trainingExamples] = await Promise.all([
    readFileSafe(path.join(rulesDir, 'brand-voice.md')),
    readFileSafe(path.join(rulesDir, 'whatsapp-playbook.md')),
    readFileSafe(path.join(rulesDir, 'dos-and-donts.md')),
    readFileSafe(path.join(dataDir, 'training-examples.md')),
  ]);

  return { brandVoice, playbook, dosAndDonts, trainingExamples };
}

async function generateCopy({ campaignType, audience, keyMessage, tone, variantCount, additionalContext }) {
  const openai = getOpenAIClient();
  const rules = await getRulesContent();

  const systemPrompt = `You are a WhatsApp copy expert for ACKO, an Indian insurance and car services brand.
Your job is to write WhatsApp messages that maximise CTR based on ACKO's past campaign data and brand rules.
Always respond with a valid JSON object.

=== BRAND VOICE ===
${rules.brandVoice}

=== FORMAT RULES & CTR PLAYBOOK ===
${rules.playbook}

=== DOS AND DON'TS ===
${rules.dosAndDonts}

=== PAST MESSAGE PERFORMANCE DATA ===
Study these carefully. HIGH CTR examples show what works. LOW CTR — AVOID examples show what to never repeat.
${rules.trainingExamples}`;

  const toneInstruction = tone && tone !== 'auto'
    ? `- Preferred tone: ${tone.replace(/_/g, ' ')}`
    : '- Tone: auto-select the best tone based on campaign context and what has worked historically';

  const userPrompt = `Generate ${variantCount} WhatsApp message variants for this campaign.

Campaign details:
- Campaign type: ${campaignType}
- Target audience: ${audience}
- Key message / offer: ${keyMessage}
${toneInstruction}
${additionalContext ? `- Additional context: ${additionalContext}` : ''}

Each variant must use a DIFFERENT hook strategy. Do not repeat the same approach.

Return a JSON object in exactly this format:
{
  "variants": [
    {
      "variant_number": 1,
      "hook_strategy": "name of hook approach (e.g. direct claim, exclusivity, urgency)",
      "header": "Bold header text — max 60 characters",
      "body": "Body text. Use actual newlines for line breaks. Keep to 3-4 short scannable lines.",
      "cta": "CTA button text — action-forward, max 5 words",
      "reasoning": "1-2 sentences: why this approach should work based on past data"
    }
  ]
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.85,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;
  const parsed = JSON.parse(content);

  if (Array.isArray(parsed)) return parsed;
  if (parsed.variants) return parsed.variants;

  const firstKey = Object.keys(parsed)[0];
  if (Array.isArray(parsed[firstKey])) return parsed[firstKey];

  throw new Error('Unexpected response format from OpenAI. Check server logs.');
}

module.exports = { generateCopy, getRulesContent };
