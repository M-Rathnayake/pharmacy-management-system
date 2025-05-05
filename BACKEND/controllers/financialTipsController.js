const getFinancialTips = (req, res) => {
  try {
    const { totalRevenue, totalExpenses, totalProfit, profitMargin, periods } = req.body;
    
    console.log('Received financial tips request:', JSON.stringify(req.body, null, 2));
    
    if (!totalRevenue && !totalExpenses && totalProfit === undefined) {
      return res.status(400).json({ error: 'Missing required financial data' });
    }

    const tips = [];

    // Relaxed rules for tip generation
    if (totalRevenue > 0 && profitMargin < 30) {
      tips.push('Consider reducing operational expenses to improve your profit margin.');
    }
    if (totalProfit > 0) {
      tips.push('Positive cash flow detected! Explore investment opportunities.');
    }
    if (totalProfit < 0) {
      tips.push('Negative profit detected. Review high-cost areas like salaries or marketing.');
    }
    if (periods < 2) {
      tips.push('Add more period data to enable trend analysis and better insights.');
    }
    if (totalRevenue > 0 && totalExpenses > totalRevenue * 0.7) {
      tips.push('Expenses are high relative to revenue. Optimize costs to boost profitability.');
    }
    if (tips.length === 0 && (totalRevenue > 0 || totalExpenses > 0)) {
      tips.push('Your financial data is recorded. Keep adding records to unlock more insights.');
    }

    console.log('Generated tips:', JSON.stringify(tips, null, 2));
    res.json({ tips });
  } catch (error) {
    console.error('Error generating financial tips:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getFinancialTips };