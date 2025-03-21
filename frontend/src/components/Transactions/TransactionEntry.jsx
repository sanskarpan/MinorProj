import { useState } from 'react';
import useTransactionStore from '../../store/transactionStore';

const TransactionEntry = ({ onSuccess }) => {
  const { addTransaction, isLoading, error, clearError } = useTransactionStore();
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    category: 'other',
    type: 'expense',
    notes: '',
  });
  
  // Transaction categories
  const categories = [
    { value: 'food', label: 'Food & Dining' },
    { value: 'transport', label: 'Transportation' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'housing', label: 'Housing & Rent' },
    { value: 'health', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'income', label: 'Income' },
    { value: 'salary', label: 'Salary' },
    { value: 'investment', label: 'Investment' },
    { value: 'other', label: 'Other' },
  ];
  
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    clearError();
    
    // Handle number inputs
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: value === '' ? '' : parseFloat(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    
    // Automatically set category to income-related categories when type is income
    if (name === 'type' && value === 'income') {
      if (!['income', 'salary', 'investment'].includes(formData.category)) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          category: 'income',
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value,
        }));
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.description || !formData.amount || !formData.date) {
      return;
    }
    
    const success = await addTransaction({
      ...formData,
      amount: parseFloat(formData.amount),
    });
    
    if (success) {
      // Reset form
      setFormData({
        description: '',
        amount: '',
        date: new Date().toISOString().slice(0, 10),
        category: 'other',
        type: 'expense',
        notes: '',
      });
      
      // Notify parent
      if (onSuccess) {
        onSuccess();
      }
    }
  };
  
  return (
    <div className="card">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Transaction</h3>
      
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <div className="flex">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          {/* Transaction Type */}
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="type"
                value="expense"
                checked={formData.type === 'expense'}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className="ml-2 text-gray-700">Expense</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="type"
                value="income"
                checked={formData.type === 'income'}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className="ml-2 text-gray-700">Income</span>
            </label>
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <input
              type="text"
              id="description"
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              className="input-field mt-1"
              placeholder="e.g., Grocery shopping"
            />
          </div>
          
          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                id="amount"
                name="amount"
                required
                min="0.01"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                className="input-field pl-7"
                placeholder="0.00"
              />
            </div>
          </div>
          
          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              required
              value={formData.date}
              onChange={handleChange}
              className="input-field mt-1"
            />
          </div>
          
          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-field mt-1"
            >
              {formData.type === 'income' ? (
                // Show only income-related categories
                categories
                  .filter(c => ['income', 'salary', 'investment'].includes(c.value))
                  .map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))
              ) : (
                // Show all except income-related categories
                categories
                  .filter(c => !['income', 'salary', 'investment'].includes(c.value))
                  .map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))
              )}
            </select>
          </div>
          
          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
            <textarea
              id="notes"
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              className="input-field mt-1"
              placeholder="Add any additional details..."
            ></textarea>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="mt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full flex justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              'Add Transaction'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionEntry;