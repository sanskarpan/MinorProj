import { useEffect } from 'react';
import useTransactionStore from '../store/transactionStore';
import useAuthStore from '../store/authStore';
import BudgetOverview from '../components/Dashboard/BudgetOverview';
import ExpenseSummary from '../components/Dashboard/ExpenseSummary';
import IncomeSummary from '../components/Dashboard/IncomeSummary';
import RecentTransactions from '../components/Dashboard/RecentTransactions';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const { fetchTransactions, isLoading, transactions, summary } = useTransactionStore();

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting()}, {user?.name?.split(' ')[0] || 'User'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's an overview of your financial situation
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <BudgetOverview balance={summary.balance} />
        <IncomeSummary totalIncome={summary.totalIncome} />
        <ExpenseSummary totalExpense={summary.totalExpense} />
      </div>

      {/* Recent Transactions */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Recent Transactions</h2>
        <div className="mt-3">
          <RecentTransactions transactions={transactions.slice(0, 5)} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;