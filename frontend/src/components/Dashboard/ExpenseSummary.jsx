import { formatCurrency } from '../../utils/formatters';

const ExpenseSummary = ({ totalExpense }) => {
  return (
    <div className="card border-l-4 border-red-500">
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-red-100 mr-4">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 13l-5 5m0 0l-5-5m5 5V6"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Total Expenses</p>
          <p className="text-2xl font-semibold text-red-600">{formatCurrency(totalExpense)}</p>
        </div>
      </div>
    </div>
  );
};

export default ExpenseSummary;