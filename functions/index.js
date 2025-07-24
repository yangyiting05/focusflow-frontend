/*
console.log("🔥 Starting GPT server...");

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = 
app.post('/suggest', async (req, res) => {
  const { task } = req.body;

  if (!task) {
    return res.status(400).json({ error: 'Task is missing' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful productivity coach.' },
          { role: 'user', content: `Give one actionable suggestion to complete this task well: "${task}"` },
        ],
        max_tokens: 60,
      }),
    });

    const data = await response.json();
    const suggestion = data.choices?.[0]?.message?.content || 'No suggestion available.';
    res.json({ suggestion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to contact OpenAI' });
  }
});

app.listen(3001, () => {
  console.log('🧠 GPT backend running on http://localhost:3001');
});
*/
