/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };
  
  /**
   * Format a date to a readable string
   * @param {string|Date} date - The date to format
   * @param {string} format - The format style (default: medium)
   * @returns {string} Formatted date string
   */
  export const formatDate = (date, format = 'medium') => {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    const options = {
      short: { month: 'numeric', day: 'numeric', year: '2-digit' },
      medium: { month: 'short', day: 'numeric', year: 'numeric' },
      long: { month: 'long', day: 'numeric', year: 'numeric' },
      monthYear: { month: 'short', year: 'numeric' },
    };
    
    return new Intl.DateTimeFormat('en-US', options[format] || options.medium).format(dateObj);
  };
  
  /**
   * Format a percentage value
   * @param {number} value - The value to format as percentage
   * @param {number} decimals - Number of decimal places (default: 1)
   * @returns {string} Formatted percentage string
   */
  export const formatPercentage = (value, decimals = 1) => {
    return `${value.toFixed(decimals)}%`;
  };
  
  /**
   * Get color class based on transaction type or amount
   * @param {string} type - Transaction type (income/expense)
   * @returns {string} CSS color class
   */
  export const getTransactionColor = (type) => {
    if (type === 'income') return 'text-green-600';
    if (type === 'expense') return 'text-red-600';
    return 'text-gray-600';
  };
  
  /**
   * Get category icon and color
   * @param {string} category - Transaction category
   * @returns {Object} Object with icon and color information
   */
  export const getCategoryInfo = (category) => {
    const categories = {
      food: { icon: 'ShoppingBagIcon', color: 'bg-orange-500' },
      transport: { icon: 'TruckIcon', color: 'bg-blue-500' },
      entertainment: { icon: 'FilmIcon', color: 'bg-purple-500' },
      utilities: { icon: 'LightBulbIcon', color: 'bg-yellow-500' },
      housing: { icon: 'HomeIcon', color: 'bg-green-500' },
      health: { icon: 'HeartIcon', color: 'bg-red-500' },
      education: { icon: 'AcademicCapIcon', color: 'bg-indigo-500' },
      shopping: { icon: 'ShoppingCartIcon', color: 'bg-pink-500' },
      income: { icon: 'CurrencyDollarIcon', color: 'bg-green-600' },
      salary: { icon: 'BriefcaseIcon', color: 'bg-emerald-500' },
      investment: { icon: 'ChartBarIcon', color: 'bg-blue-600' },
      other: { icon: 'DotsHorizontalIcon', color: 'bg-gray-500' },
    };
    
    return categories[category.toLowerCase()] || categories.other;
  };