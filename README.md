# ACKO WhatsApp Copy Generator

Generate high-CTR WhatsApp messages for ACKO Drive campaigns using GPT-4o, trained on your past campaign data.

## Setup

### 1. Install dependencies
```bash
npm run install:all
```

### 2. Add your OpenAI API key
```bash
cp .env.example .env
# Then edit .env and add your OPENAI_API_KEY
```

### 3. Run the app
```bash
npm run dev
```
Opens at **http://localhost:5173**

---

## Editing Rules & Training Data

All rules and training examples are plain Markdown files — edit them directly, no redeployment needed.

| File | What it controls |
|---|---|
| `server/rules/brand-voice.md` | ACKO tone, language style, personality |
| `server/rules/whatsapp-playbook.md` | CTR hooks, message structure, emoji rules |
| `server/rules/dos-and-donts.md` | Compliance rules, disallowed phrases |
| `server/data/training-examples.md` | Past messages with HIGH/LOW CTR labels |

Every time you click "Generate", the tool reads these files fresh — so your edits take effect immediately on the next generation.

## Adding New Training Examples

Open `server/data/training-examples.md` and follow this format:

```markdown
---
## Example N
**Label:** HIGH CTR / LOW CTR — AVOID
**CTR:** X.XX% | **Cohort:** ~N | **Time:** HH–HH
**Tone:** [tone type]

**Header:** Your header text
**Body:** Your body text
**CTA:** Your CTA text

**Why it worked / Avoid because:** [explanation]
---
```
