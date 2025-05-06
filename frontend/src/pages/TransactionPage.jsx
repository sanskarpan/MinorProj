import { useEffect } from 'react';
import TransactionEntry from '../components/Transactions/TransactionEntry';
import TransactionList from '../components/Transactions/TransactionList';
import useTransactionStore from '../store/transactionStore';

const TransactionPage = () => {
  const { fetchTransactions, transactions, isLoading } = useTransactionStore();

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your income and expenses
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Transaction Entry Form */}
        <div className="lg:col-span-1">
          <TransactionEntry onSuccess={fetchTransactions} />
        </div>

        {/* Transaction List */}
        <div className="lg:col-span-2">
          <TransactionList transactions={transactions} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default TransactionPage;