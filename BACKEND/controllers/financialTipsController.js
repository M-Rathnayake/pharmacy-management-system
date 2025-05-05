const axios = require('axios');

const getFinancialTips = async (req, res) => {
  console.log('START: /api/financial-tips request received:', {
    timestamp: new Date().toISOString(),
    body: req.body ? JSON.stringify(req.body, null, 2) : 'No body',
    headers: req.headers,
    method: req.method,
    url: req.url
  });

  try {
    const { totalRevenue, totalExpenses, totalProfit } = req.body;

    // Validate request body
    if (!totalRevenue || !totalExpenses || totalProfit === undefined) {
      console.error('Invalid request body:', req.body);
      return res.status(400).json({ error: 'Missing required fields: totalRevenue, totalExpenses, totalProfit' });
    }

    // Validate OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('Missing OPENAI_API_KEY in environment variables');
      throw new Error('OpenAI API key not configured');
    }

    // Craft prompt
    const prompt = `
      Act as a financial advisor. Give 3 concise tips (max 15 words each) for a business with:
      - Revenue: ₹${totalRevenue.toLocaleString('en-IN')}
      - Expenses: ₹${totalExpenses.toLocaleString('en-IN')}
      - Profit: ₹${totalProfit.toLocaleString('en-IN')}
      Use this format:
      1. [Urgency Icon] [Tip]  
      2. [Icon] [Tip]
      3. [Icon] [Tip]
      Icons: ⚠️ for urgent, 💡 for advice, 📈 for growth
    `;

    console.log('Sending OpenAI request:', {
      timestamp: new Date().toISOString(),
      prompt: prompt.substring(0, 100) + '...'
    });

    // Make OpenAI API call
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // Increased to 10 seconds
      }
    );

    console.log('OpenAI response received:', {
      timestamp: new Date().toISOString(),
      status: response.status,
      data: JSON.stringify(response.data, null, 2).substring(0, 200) + '...'
    });

    // Extract and format tips
    const aiResponse = response.data.choices[0].message.content;
    const tips = aiResponse.split('\n').filter(tip => tip.trim().length > 0);

    if (tips.length === 0) {
      console.warn('No tips returned from OpenAI');
      throw new Error('Empty response from OpenAI');
    }

    console.log('Sending response:', JSON.stringify({ tips }, null, 2));
    res.status(200).json({ tips });

  } catch (error) {
    console.error('ERROR: /api/financial-tips failed:', {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      response: error.response ? {
        status: error.response.status,
        data: JSON.stringify(error.response.data, null, 2)
      } : null,
      body: req.body ? JSON.stringify(req.body, null, 2) : 'No body'
    });

    // Fallback tips
    const fallbackTips = [
      '💡 System Update: Review last month’s highest expense category',
      '📈 Pro Tip: Increase prices by 5% to improve margins',
      '⚠️ Alert: Set aside 20% of profits for taxes'
    ];
    res.status(200).json({ tips: fallbackTips });
  }
};

module.exports = { getFinancialTips };