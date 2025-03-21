import { Link } from 'react-router-dom';
import { formatCurrency, formatDate, getTransactionColor } from '../../utils/formatters';

const RecentTransactions = ({ transactions, isLoading }) => {
  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="flex flex-col space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex justify-between items-center py-2">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                <div className="space-y-1">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="card">
        <div className="text-center py-6">
          <p className="text-gray-500">No transactions found</p>
          <Link to="/transactions" className="mt-2 inline-block text-primary-600 hover:text-primary-500">
            Add your first transaction
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <li key={transaction.id} className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'} mr-3`}>
                    {transaction.type === 'income' ? (
                      <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 11l5-5m0 0l5 5m-5-5v12"
                        />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 13l-5 5m0 0l-5-5m5 5V6"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                    <div className="flex space-x-2 text-xs text-gray-500">
                      <span>{formatDate(transaction.date)}</span>
                      <span>•</span>
                      <span>{transaction.category}</span>
                    </div>
                  </div>
                </div>
                <div className={`text-sm font-medium ${getTransactionColor(transaction.type)}`}>
                  {transaction.type === 'expense' ? '-' : '+'}
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-center">
        <Link
          to="/transactions"
          className="text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          View all transactions
        </Link>
      </div>
    </div>
  );
};

export default RecentTransactions;