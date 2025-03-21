import { formatCurrency } from '../../utils/formatters';

const BudgetOverview = ({ balance }) => {
  return (
    <div className="card border-l-4 border-primary-500">
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-primary-100 mr-4">
          <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Current Balance</p>
          <p className={`text-2xl font-semibold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(balance)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BudgetOverview;