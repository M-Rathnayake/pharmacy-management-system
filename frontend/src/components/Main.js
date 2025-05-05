import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Typography, Paper, Divider, useTheme,
  Card, CardContent, Avatar, Chip, Button, CircularProgress,
  Snackbar, Alert, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import {
  MonetizationOn, TrendingUp, NotificationsActive, 
  AccountBalance, ShowChart, Savings, Timeline, Lightbulb
} from '@mui/icons-material';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import axios from 'axios';

const MainForm = () => {
  const theme = useTheme();
  const [monthlyData, setMonthlyData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [financialTips, setFinancialTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState({ open: false, text: '', severity: 'error' });

  useEffect(() => {
    fetchProfitLossData();
  }, []);

  useEffect(() => {
    if (totalRevenue || totalExpenses || monthlyData.length > 0) {
      fetchFinancialTips();
    }
  }, [totalRevenue, totalExpenses, monthlyData]);

  const fetchProfitLossData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/profitloss');
      const data = response.data || [];
      console.log('Fetched profit/loss data:', JSON.stringify(data, null, 2));

      if (!Array.isArray(data) || data.length === 0) {
        console.warn('No profit/loss data available');
        setMonthlyData([]);
        setTotalRevenue(0);
        setTotalExpenses(0);
        setTotalProfit(0);
        setAlertMsg({
          open: true,
          text: 'No financial data found. Please add records in the Profit/Loss Form.',
          severity: 'info'
        });
        return;
      }

      const validData = data.filter(item => 
        item.period && 
        typeof item.revenue === 'number' && item.revenue >= 0 &&
        typeof item.expenses === 'number' && item.expenses >= 0
      );

      if (validData.length === 0) {
        console.warn('All profit/loss records are invalid');
        setMonthlyData([]);
        setTotalRevenue(0);
        setTotalExpenses(0);
        setTotalProfit(0);
        setAlertMsg({
          open: true,
          text: 'Invalid financial data. Please ensure records have valid revenue and expenses.',
          severity: 'error'
        });
        return;
      }

      const mappedData = validData
        .map(item => ({
          month: formatPeriodToMonth(item.period),
          revenue: item.revenue || 0,
          expenses: item.expenses || 0,
          profit: item.profit ?? (item.revenue - item.expenses)
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

      const revenueSum = validData.reduce((sum, item) => sum + (item.revenue || 0), 0);
      const expensesSum = validData.reduce((sum, item) => sum + (item.expenses || 0), 0);
      const profitSum = revenueSum - expensesSum;

      setMonthlyData(mappedData);
      setTotalRevenue(revenueSum);
      setTotalExpenses(expensesSum);
      setTotalProfit(profitSum);
    } catch (error) {
      console.error('Error fetching profit/loss data:', error.response?.data || error.message);
      setAlertMsg({
        open: true,
        text: error.response?.data?.error || 'Error fetching financial data. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFinancialTips = async () => {
    try {
      const payload = {
        totalRevenue,
        totalExpenses,
        totalProfit,
        profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
        periods: monthlyData.length
      };
      console.log('Fetching tips with payload:', JSON.stringify(payload, null, 2));
      const response = await axios.post('http://localhost:8080/api/financial-tips', payload);
      console.log('Financial tips response:', JSON.stringify(response.data, null, 2));
      setFinancialTips(response.data.tips || []);
      if (!response.data.tips || response.data.tips.length === 0) {
        setAlertMsg({
          open: true,
          text: 'No financial tips generated. Try adding more data or adjusting values.',
          severity: 'info'
        });
      }
    } catch (error) {
      console.error('Error fetching financial tips:', error.response?.data || error.message);
      setAlertMsg({
        open: true,
        text: 'Error fetching financial tips. Please try again.',
        severity: 'error'
      });
      setFinancialTips([]);
    }
  };

  const formatPeriodToMonth = (period) => {
    if (!period) return 'Unknown';
    if (period.includes('_')) {
      const monthNum = parseInt(period.split('_')[1], 10);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months[monthNum - 1] || period;
    }
    if (period.includes('-')) {
      return period.split('-')[0];
    }
    return period;
  };

  const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0;
  const cashFlowStatus = totalProfit > 0 ? 'positive' : totalProfit < 0 ? 'negative' : 'neutral';
  const expenseCategories = [
    { name: 'Salaries', value: totalExpenses * 0.45 },
    { name: 'Operations', value: totalExpenses * 0.25 },
    { name: 'Marketing', value: totalExpenses * 0.15 },
    { name: 'Rent', value: totalExpenses * 0.10 },
    { name: 'Other', value: totalExpenses * 0.05 }
  ].filter(category => category.value > 0);
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main
  ];
  const financialHealthScore = totalProfit >= 0 ? 82 : totalProfit < 0 ? 55 : 70;
  const anomalies = monthlyData.length > 1
    ? monthlyData.map((item, index) => {
        if (index === 0) return null;
        const prev = monthlyData[index - 1];
        const revenueChange = prev.revenue > 0 ? Math.abs(item.revenue - prev.revenue) / prev.revenue : 0;
        const expenseChange = prev.expenses > 0 ? Math.abs(item.expenses - prev.expenses) / prev.expenses : 0;
        if (revenueChange > 0.3) {
          return { type: 'Revenue Spike', month: item.month, amount: item.revenue - prev.revenue };
        }
        if (expenseChange > 0.3) {
          return { type: 'Unusual Expense', month: item.month, amount: item.expenses - prev.expenses };
        }
        return null;
      }).filter(Boolean)
    : [];
  const safeToLocaleString = (value) => {
    const num = Number(value ?? 0);
    return isNaN(num) ? '0' : num.toLocaleString('en-IN');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Snackbar 
        open={alertMsg.open} 
        autoHideDuration={6000} 
        onClose={() => setAlertMsg({ ...alertMsg, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          severity={alertMsg.severity}
          sx={{ width: '100%' }}
          elevation={6}
          variant="filled"
        >
          {alertMsg.text}
        </Alert>
      </Snackbar>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Financial Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<Timeline />}>
            Export Report
          </Button>
          <Button variant="contained" startIcon={<NotificationsActive />}>
            Set Alerts
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <MetricCard
            title="Total Revenue"
            value={`Rs.${safeToLocaleString(totalRevenue)}`}
            icon={<MonetizationOn fontSize="large" />}
            color={theme.palette.success.main}
            trend="Based on current period"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title="Total Expenses"
            value={`Rs.${safeToLocaleString(totalExpenses)}`}
            icon={<Savings fontSize="large" />}
            color={theme.palette.error.main}
            trend="Based on current period"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title="Net Profit"
            value={`Rs.${safeToLocaleString(totalProfit)}`}
            icon={<AccountBalance fontSize="large" />}
            color={theme.palette.primary.main}
            trend={`${profitMargin}% margin`}
            isProfit={true}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Profit & Loss Trend
            </Typography>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={theme.palette.success.main} 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke={theme.palette.error.main} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke={theme.palette.primary.main} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No data available for chart. Add records in the Profit/Loss Form.
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Financial Health
            </Typography>
            <Box sx={{ textAlign: 'center', my: 3 }}>
              <CircularProgressWithLabel 
                value={financialHealthScore} 
                size={120}
                thickness={4}
              />
              <Typography variant="body2" sx={{ mt: 1 }}>
                {financialHealthScore >= 80 ? 'Excellent' : financialHealthScore >= 60 ? 'Good' : 'Needs Attention'}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Chip 
                label={`Cash Flow: ${cashFlowStatus}`} 
                color={cashFlowStatus === 'positive' ? 'success' : cashFlowStatus === 'negative' ? 'error' : 'default'}
                variant="outlined"
              />
              <Chip 
                label={`${monthlyData.length} Periods`} 
                color="info"
                variant="outlined"
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              <Lightbulb sx={{ mr: 1, color: theme.palette.warning.main }} />
              AI Financial Tips
            </Typography>
            {financialTips.length > 0 ? (
              <List>
                {financialTips.map((tip, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon>
                      <Lightbulb color="warning" />
                    </ListItemIcon>
                    <ListItemText primary={tip} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                {monthlyData.length > 0 
                  ? 'No specific tips available. Try adjusting revenue or expenses.'
                  : 'No tips available. Add more data in the Profit/Loss Form.'}
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Expense Breakdown
            </Typography>
            {totalExpenses > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseCategories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {expenseCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No expense data available
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              <NotificationsActive sx={{ mr: 1, color: theme.palette.warning.main }} />
              Financial Anomalies
            </Typography>
            {anomalies.length > 0 ? (
              anomalies.map((anomaly, i) => (
                <Box key={i} sx={{ mb: 1, p: 1, backgroundColor: '#fff8e1', borderRadius: 1 }}>
                  <Typography variant="subtitle2">
                    {anomaly.type} in {anomaly.month}
                  </Typography>
                  <Typography variant="body2">
                    Amount: Rs.{safeToLocaleString(anomaly.amount)}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                No significant anomalies detected
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              <TrendingUp sx={{ mr: 1, color: theme.palette.success.main }} />
              Predictive Insights
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Next Period Projection</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                Rs.{safeToLocaleString(monthlyData.length > 0 ? monthlyData[monthlyData.length - 1].profit * 1.05 : 0)}
                <span style={{ color: theme.palette.success.main }}> (+5%)</span>
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Expense Alert Threshold</Typography>
              <Typography variant="body1">
                Rs.{safeToLocaleString(totalExpenses / (monthlyData.length || 1) * 1.1)}
                <span style={{ color: theme.palette.warning.main }}> (10% over avg)</span>
              </Typography>
            </Box>
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<ShowChart />}
              sx={{ mt: 1 }}
            >
              View Scenarios
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

const MetricCard = ({ title, value, icon, color, trend, isProfit = false }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>{value}</Typography>
          <Typography variant="body2" sx={{
            color: isProfit ? (value.includes('-') ? 'error.main' : 'success.main') : color,
            mt: 1
          }}>
            {isProfit && !value.includes('-') && '+'}{trend}
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: `${color}20`, color }}>{icon}</Avatar>
      </Box>
    </CardContent>
  </Card>
);

const CircularProgressWithLabel = ({ value, size, thickness }) => (
  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
    <CircularProgress 
      variant="determinate" 
      value={value} 
      size={size} 
      thickness={thickness} 
      sx={{ color: value >= 80 ? 'green' : value >= 60 ? 'orange' : 'red' }}
    />
    <Box
      sx={{
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography variant="h6" component="div" color="text.secondary">
        {`${Math.round(value)}%`}
      </Typography>
    </Box>
  </Box>
);

export default MainForm;