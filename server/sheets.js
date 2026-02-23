const { google } = require('googleapis');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

const TAB_MAP = {
  brandVoice: 'Brand Voice',
  playbook: 'CTR Playbook',
  dosAndDonts: "Dos & Don'ts",
  trainingExamples: 'Training Examples',
};

function getGoogleAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

async function getRulesFromSheet() {
  const auth = getGoogleAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  const ranges = Object.values(TAB_MAP).map((tab) => `'${tab}'!A:A`);

  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: SHEET_ID,
    ranges,
  });

  const rules = {};
  Object.keys(TAB_MAP).forEach((key, i) => {
    const values = response.data.valueRanges[i]?.values || [];
    rules[key] = values.map((row) => row[0] ?? '').join('\n');
  });

  return rules;
}

async function writeRuleToSheet(key, content) {
  const tabName = TAB_MAP[key];
  if (!tabName) throw new Error(`Unknown rule key: ${key}`);

  const auth = getGoogleAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  const lines = content.split('\n').map((line) => [line]);

  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: `'${tabName}'!A:A`,
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `'${tabName}'!A1`,
    valueInputOption: 'RAW',
    requestBody: { values: lines },
  });
}

async function ensureTabsExist() {
  const auth = getGoogleAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const existingTabs = meta.data.sheets.map((s) => s.properties.title);

  const tabsToCreate = Object.values(TAB_MAP).filter((tab) => !existingTabs.includes(tab));

  if (tabsToCreate.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: tabsToCreate.map((title) => ({
          addSheet: { properties: { title } },
        })),
      },
    });
  }
}

module.exports = { getRulesFromSheet, writeRuleToSheet, ensureTabsExist };
