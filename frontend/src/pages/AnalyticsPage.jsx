import { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell, 
  CartesianGrid 
} from 'recharts';
import useTransactionStore from '../store/transactionStore';
import { formatCurrency } from '../utils/formatters';

const AnalyticsPage = () => {
  const { transactions, fetchTransactions } = useTransactionStore();
  const [timeframe, setTimeframe] = useState('month'); // month, quarter, year
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [incomeVsExpense, setIncomeVsExpense] = useState([]);

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
      processCategoryData();
      processMonthlyData();
      processIncomeVsExpense();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, timeframe]);

  // Process data for category breakdown chart
  const processCategoryData = () => {
    const categoryMap = {};
    const expenseTransactions = transactions.filter(t => t.type === 'expense');

    // Sum transactions by category
    expenseTransactions.forEach(transaction => {
      const category = transaction.category;
      if (!categoryMap[category]) {
        categoryMap[category] = 0;
      }
      categoryMap[category] += transaction.amount;
    });

    // Convert to chart data format
    const data = Object.keys(categoryMap).map(category => ({
      name: category,
      value: categoryMap[category],
    }));

    setCategoryData(data);
  };

  // Process data for monthly trend chart
  const processMonthlyData = () => {
    const now = new Date();
    const monthsToShow = timeframe === 'month' ? 6 : timeframe === 'quarter' ? 12 : 24;
    
    // Generate last X months
    const monthlyTotals = [];
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      monthlyTotals.push({
        name: monthYear,
        income: 0,
        expense: 0,
        net: 0,
        month: date.getMonth(),
        year: date.getFullYear(),
      });
    }
    
    // Sum transactions by month
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      const transactionMonth = transactionDate.getMonth();
      const transactionYear = transactionDate.getFullYear();
      
      const matchingMonth = monthlyTotals.find(
        item => item.month === transactionMonth && item.year === transactionYear
      );
      
      if (matchingMonth) {
        if (transaction.type === 'income') {
          matchingMonth.income += transaction.amount;
        } else {
          matchingMonth.expense += transaction.amount;
        }
        matchingMonth.net = matchingMonth.income - matchingMonth.expense;
      }
    });
    
    setMonthlyData(monthlyTotals);
  };
  
  // Process income vs expense data
  const processIncomeVsExpense = () => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
      
    setIncomeVsExpense([
      { name: 'Income', value: totalIncome },
      { name: 'Expenses', value: totalExpense },
    ]);
  };
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Visualize your financial data
        </p>
      </div>
      
      {/* Time period selector */}
      <div className="card p-4">
        <div className="flex space-x-4">
          <button
            className={`px-3 py-2 rounded-md ${
              timeframe === 'month' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => setTimeframe('month')}
          >
            Last 6 Months
          </button>
          <button
            className={`px-3 py-2 rounded-md ${
              timeframe === 'quarter' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => setTimeframe('quarter')}
          >
            Last 12 Months
          </button>
          <button
            className={`px-3 py-2 rounded-md ${
              timeframe === 'year' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => setTimeframe('year')}
          >
            Last 24 Months
          </button>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Trend */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4 px-4 pt-4">Monthly Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyData}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#82ca9d" name="Income" />
                <Line type="monotone" dataKey="expense" stroke="#ff7043" name="Expense" />
                <Line type="monotone" dataKey="net" stroke="#8884d8" name="Net" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Income vs Expense */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4 px-4 pt-4">Income vs Expense</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomeVsExpense}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {incomeVsExpense.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#82ca9d' : '#ff7043'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Expense Categories */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4 px-4 pt-4">Expense by Category</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Amount">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Category Breakdown */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4 px-4 pt-4">Category Breakdown</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

};
export default AnalyticsPage;
