import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Bar, BarChart, CartesianGrid, Cell, ComposedChart, Area, LabelList, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import useTransactionStore from '@/store/transactionStore';
import { formatCurrency, formatPercentage } from '@/utils/formatters'; // Added formatPercentage
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/components/ThemeProvider";
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import {
    Scale, // Balance/Net Savings
    TrendingUp, // Income / Positive Trend
    TrendingDown, // Expense / Negative Trend
    Tag, // Category
    CalendarDays, // Timeframe
    AlertCircle // Error
} from "lucide-react";

// Custom Hook for Chart Colors (optional, but cleans up component)
const useChartColors = () => {
    const { theme } = useTheme();
    return useMemo(() => ({
        COLORS: theme === 'dark'
            ? ['#38bdf8', '#34d399', '#facc15', '#fb923c', '#a78bfa', '#60a5fa', '#fde047', '#93c5fd'] // Sky, Emerald, Amber, Orange, Violet, Blue, Yellow, Sky
            : ['#0284c7', '#10b981', '#f59e0b', '#f97316', '#8b5cf6', '#3b82f6', '#eab308', '#60a5fa'], // Darker Sky, Emerald, Amber, Orange, Violet, Blue, Yellow, Blue
        incomeColor: theme === 'dark' ? '#34d399' : '#10b981', // Emerald
        expenseColor: theme === 'dark' ? '#fb923c' : '#f97316', // Orange
        netColor: theme === 'dark' ? '#60a5fa' : '#3b82f6', // Blue
        gridColor: 'hsl(var(--border))',
        textColor: 'hsl(var(--muted-foreground))',
        tooltipBg: 'hsl(var(--background))',
        tooltipBorder: 'hsl(var(--border))',
        accentColor: 'hsl(var(--accent))'
    }), [theme]);
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label, colors }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border text-xs shadow-sm" style={{ backgroundColor: colors.tooltipBg, borderColor: colors.tooltipBorder }}>
          <div className="p-2 space-y-1.5">
            <div className="font-semibold">{label}</div>
            {payload.map((entry, index) => (
               <div key={`item-${index}`} className="grid grid-cols-[auto,1fr] gap-x-2 items-center">
                 <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color || entry.payload?.fill || '#8884d8' }} />
                    <span style={{ color: colors.textColor }}>{entry.name}</span>
                 </div>
                 <span className="font-medium text-right">{entry.dataKey === 'percentage' ? formatPercentage(entry.value / 100, 1) : formatCurrency(entry.value)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
};

// Pie Chart Label Renderer
const RADIAN = Math.PI / 180;
const renderCustomizedPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, colors }) => {
    if (percent < 0.05) return null; // Don't render tiny labels
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6; // Adjust position
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill={colors.textColor} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-[10px] font-medium">
        {`${(percent * 100).toFixed(0)}%`}
        {/* Optional: Add name back if space allows: {`${name} ${(percent * 100).toFixed(0)}%`} */}
      </text>
    );
};


const AnalyticsPage = () => {
  // Memoized selectors to keep getSnapshot stable and avoid infinite loops
  const selectFetchAnalyticsData = useCallback(state => state.fetchAnalyticsData, []);
  const selectAnalyticsData     = useCallback(state => state.analyticsData, []);
  const selectIsLoadingAnalytics= useCallback(state => state.isLoadingAnalytics, []);
  const selectErrorAnalytics    = useCallback(state => state.errorAnalytics, []);

  const fetchAnalyticsData = useTransactionStore(selectFetchAnalyticsData);
  const analyticsData      = useTransactionStore(selectAnalyticsData);
  const isLoadingAnalytics = useTransactionStore(selectIsLoadingAnalytics);
  const errorAnalytics     = useTransactionStore(selectErrorAnalytics);

  const chartColors = useChartColors(); // Use the custom hook for colors
  const [timeframe, setTimeframe] = useState('month');

  useEffect(() => {
    fetchAnalyticsData(timeframe);
  }, [timeframe, fetchAnalyticsData]);

  // Memoized calculations for KPIs and chart data
  const { kpiData, monthlySummary, incomeVsExpenseForChart, categoryBreakdownForChart } = useMemo(() => {
    const safeData = analyticsData || {};
    const monthly = safeData.monthly_summary || [];
    const categories = safeData.category_breakdown || [];
    const ivs = safeData.income_vs_expense || { income: 0, expense: 0, net: 0 };

    // KPI Calculations
    const totalIncome = ivs.income || 0;
    const totalExpense = ivs.expense || 0;
    const netTotal = ivs.net || 0;
    const savingsRate = totalIncome > 0 ? (netTotal / totalIncome) : 0;
    const avgMonthlyNet = monthly.length > 0 ? (monthly.reduce((sum, m) => sum + m.net, 0) / monthly.length) : 0;
    const topCategory = categories.length > 0 ? categories.reduce((max, cat) => (cat.amount > max.amount ? cat : max), categories[0]) : null;

    const kpi = { totalIncome, totalExpense, netTotal, savingsRate, avgMonthlyNet, topCategory };

    // Chart Data Preparation
    const incomeVsExpenseChart = [
        { name: 'Income', value: ivs.income || 0, fill: chartColors.incomeColor },
        { name: 'Expense', value: ivs.expense || 0, fill: chartColors.expenseColor },
    ];

    // Add fill colors for category chart
    const categoryChart = categories.map((item, index) => ({
      name: item.name,
      value: item.amount,
      fill: chartColors.COLORS[index % chartColors.COLORS.length],
    }));

    return { kpiData: kpi, monthlySummary: monthly, incomeVsExpenseForChart: incomeVsExpenseChart, categoryBreakdownForChart: categoryChart };
  }, [analyticsData, chartColors]); // Depend on analyticsData and theme-derived colors

  const hasData = !isLoadingAnalytics && analyticsData && Object.keys(analyticsData).length > 0;
  const hasMonthlyData = hasData && monthlySummary.length > 0;
  const hasIncomeVsExpenseData = hasData && (incomeVsExpenseForChart[0].value > 0 || incomeVsExpenseForChart[1].value > 0);
  const hasCategoryData = hasData && categoryBreakdownForChart.length > 0;


  // Helper to render KPI cards or skeletons
  const renderKPICard = (title, value, formatFn, icon, description, isLoadingOverride = isLoadingAnalytics) => (
     <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {React.createElement(icon, { className: "h-4 w-4 text-muted-foreground" })}
      </CardHeader>
      <CardContent>
        {isLoadingOverride ? (
            <>
                <Skeleton className="h-7 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-1/2 mt-2 rounded-md" />
            </>
        ) : value !== null && value !== undefined ? (
            <>
                <div className="text-2xl font-bold">{formatFn(value)}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </>
        ) : (
             <p className="text-sm text-muted-foreground">No data</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Financial Analytics</h1>
          <p className="text-muted-foreground">
            Insights into your income, expenses, and spending habits.
          </p>
        </div>
        <div className='flex items-center gap-2'>
           <CalendarDays className='h-4 w-4 text-muted-foreground shrink-0'/>
           <Select value={timeframe} onValueChange={setTimeframe} disabled={isLoadingAnalytics}>
             <SelectTrigger className="w-full sm:w-[180px]">
               <SelectValue placeholder="Select Timeframe" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="month">Last 6 Months</SelectItem>
               <SelectItem value="quarter">Last 12 Months</SelectItem>
               <SelectItem value="year">Last 24 Months</SelectItem>
             </SelectContent>
           </Select>
        </div>
      </div>

      {/* Display Global Error */}
      {errorAnalytics && (
           <Alert variant="destructive">
             <AlertCircle className="h-4 w-4" />
             <AlertTitle>Error Loading Analytics Data</AlertTitle>
             <AlertDescription>{errorAnalytics}</AlertDescription>
           </Alert>
       )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {renderKPICard("Net Savings", kpiData?.netTotal, formatCurrency, Scale, `Total Income - Total Expense`)}
        {renderKPICard("Savings Rate", kpiData?.savingsRate, (v) => formatPercentage(v, 1), TrendingUp, `(Net / Income) for period`)}
        {renderKPICard("Avg. Monthly Net", kpiData?.avgMonthlyNet, formatCurrency, Scale, `Average Net over selected months`)}
        {renderKPICard("Top Expense", kpiData?.topCategory?.name || '-', (v) => v, Tag, `Highest spending category`, isLoadingAnalytics || !kpiData?.topCategory)}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Financial Trend</CardTitle>
            <CardDescription>Income vs. Expense and Net balance over the selected period.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] w-full pt-4 pl-0 pr-4"> {/* Adjusted padding */}
            {isLoadingAnalytics ? ( <Skeleton className="h-full w-full rounded-md" /> )
             : hasMonthlyData ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlySummary} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.netColor} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={chartColors.netColor} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.gridColor} />
                  <XAxis dataKey="month" stroke={chartColors.textColor} fontSize={10} tickLine={false} axisLine={false} dy={5}/>
                  <YAxis stroke={chartColors.textColor} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} dx={-5} />
                  <Tooltip content={<CustomTooltip colors={chartColors}/>} cursor={{ fill: chartColors.accentColor, fillOpacity: 0.1 }} />
                  <Legend iconSize={10} wrapperStyle={{fontSize: "12px", paddingTop: "10px"}} verticalAlign="top" align="right"/>
                  <Bar dataKey="income" name="Income" barSize={20} fill={chartColors.incomeColor} />
                  <Bar dataKey="expense" name="Expense" barSize={20} fill={chartColors.expenseColor} />
                  <Area type="monotone" dataKey="net" name="Net" stroke={chartColors.netColor} fill="url(#colorNet)" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : ( <div className="flex items-center justify-center h-full text-muted-foreground">No monthly data available.</div> )}
          </CardContent>
        </Card>

        {/* Income vs Expense Donut Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Income vs. Expense</CardTitle>
            <CardDescription>Overall financial flow for the period.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full flex items-center justify-center">
            {isLoadingAnalytics ? ( <Skeleton className="h-48 w-48 rounded-full" /> )
             : hasIncomeVsExpenseData ? (
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incomeVsExpenseForChart} cx="50%" cy="50%"
                      labelLine={false} label={(props) => renderCustomizedPieLabel({...props, colors: chartColors})}
                      outerRadius={100} innerRadius={60} // Donut
                      fill="#8884d8" dataKey="value"
                      stroke={chartColors.tooltipBg} strokeWidth={3} // Background color border
                    >
                       {incomeVsExpenseForChart.map((entry, index) => ( <Cell key={`cell-${index}`} fill={entry.fill} /> ))}
                    </Pie>
                    {hasIncomeVsExpenseData && (
                      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-lg font-bold" fill={chartColors.textColor}>
                        {formatCurrency(kpiData.netTotal)}
                      </text>
                    )}
                    <Tooltip content={<CustomTooltip colors={chartColors} />} />
                    <Legend iconSize={10} wrapperStyle={{fontSize: "12px"}} />
                  </PieChart>
               </ResponsiveContainer>
            ) : ( <div className="flex items-center justify-center h-full text-muted-foreground">No income/expense data.</div> )}
          </CardContent>
        </Card>

        {/* Savings Rate Gauge */}
        <Card>
          <CardHeader>
            <CardTitle>Savings Rate</CardTitle>
            <CardDescription>Net / Income for the period.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full flex items-center justify-center">
            {isLoadingAnalytics ? (
              <Skeleton className="h-48 w-48 rounded-full" />
            ) : kpiData?.savingsRate !== null ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[{ name: 'savings', value: kpiData.savingsRate }, { name: 'remainder', value: 1 - kpiData.savingsRate }]}
                    startAngle={180} endAngle={0}
                    innerRadius={60} outerRadius={100}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell key="cell-savings" fill={chartColors.incomeColor} />
                    <Cell key="cell-remainder" fill={chartColors.gridColor} />
                  </Pie>
                  <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="text-lg font-bold" fill={chartColors.textColor}>
                    {formatPercentage(kpiData.savingsRate, 1)}
                  </text>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>

        {/* Expense Categories Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
             <CardDescription>Spending distribution by category.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full pt-4 pl-0 pr-4"> {/* Adjust padding */}
             {isLoadingAnalytics ? ( <Skeleton className="h-full w-full rounded-md" /> )
              : hasCategoryData ? (
               <ResponsiveContainer width="100%" height="100%">
                 {/* Use vertical layout if labels are long, horizontal otherwise */}
                <BarChart data={categoryBreakdownForChart} layout="vertical" margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartColors.gridColor} />
                  <XAxis type="number" stroke={chartColors.textColor} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <YAxis type="category" dataKey="name" stroke={chartColors.textColor} fontSize={10} tickLine={false} axisLine={false} width={80} interval={0} dx={-5}/>
                  <Tooltip content={<CustomTooltip colors={chartColors} />} cursor={{ fill: chartColors.accentColor, fillOpacity: 0.1 }}/>
                  <Bar dataKey="value" name="Amount" radius={[0, 4, 4, 0]} barSize={12}>
                     {categoryBreakdownForChart.map((entry, index) => ( <Cell key={`cell-${index}`} fill={entry.fill} /> ))}
                     <LabelList dataKey="value" position="right" formatter={(val) => formatCurrency(val)} fill={chartColors.textColor} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : ( <div className="flex items-center justify-center h-full text-muted-foreground">No expense category data.</div> )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;