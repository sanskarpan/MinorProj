// frontend/src/pages/DashboardPage.jsx
import { useEffect } from 'react';
import useTransactionStore from '@/store/transactionStore';
import useAuthStore from '@/store/authStore';
import BudgetOverview from '@/components/Dashboard/BudgetOverview';
import ExpenseSummary from '@/components/Dashboard/ExpenseSummary';
import IncomeSummary from '@/components/Dashboard/IncomeSummary';
import RecentTransactions from '@/components/Dashboard/RecentTransactions';
// Import ShadCN layout if needed, e.g., for grid
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DashboardPage = () => {
  const { user } = useAuthStore();
  const { fetchTransactions, isLoading, transactions, summary } = useTransactionStore();

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Fetch on mount

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {greeting()}, {user?.name?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-muted-foreground">
          Here's your financial snapshot for today.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <BudgetOverview balance={summary.balance} />
        <IncomeSummary totalIncome={summary.totalIncome} />
        <ExpenseSummary totalExpense={summary.totalExpense} />
      </div>

       {/* Recent Transactions & Maybe Charts Side-by-Side */}
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
         <div className="lg:col-span-4"> {/* Recent Transactions takes more space */}
           <RecentTransactions
             transactions={transactions.slice(0, 5)} // Limit to 5 recent
             isLoading={isLoading}
           />
         </div>
          <div className="lg:col-span-3"> {/* Placeholder for a chart */}
            {/* Example: Add a small summary chart here later */}
          {/* <Card>
            <CardHeader><CardTitle>Spending Overview</CardTitle></CardHeader>
            <CardContent className="h-[300px]"> Chart Component </CardContent>
          </Card> */}
          </div>
       </div>

       {/* Maybe another row for Budgets or Goals later */}

    </div>
  );
};

export default DashboardPage;