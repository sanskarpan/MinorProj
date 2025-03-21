import { formatCurrency } from '../../utils/formatters';

const IncomeSummary = ({ totalIncome }) => {
  return (
    <div className="card border-l-4 border-green-500">
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-green-100 mr-4">
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 11l5-5m0 0l5 5m-5-5v12"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Total Income</p>
          <p className="text-2xl font-semibold text-green-600">{formatCurrency(totalIncome)}</p>
        </div>
      </div>
    </div>
  );
};

export default IncomeSummary;