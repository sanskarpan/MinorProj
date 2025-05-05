/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  // Handle potential non-numeric input gracefully
  const numericAmount = Number(amount);
  if (isNaN(numericAmount)) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(0); // Format 0 if input is invalid
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(numericAmount);
};
  
  /**
   * Format a date to a readable string
   * @param {string|Date} date - The date to format
   * @param {string} format - The format style (default: medium) [short, medium, long, monthYear]
   * @returns {string} Formatted date string
   */
  export const formatDate = (date, format = 'medium') => {
    try {
        const dateObj = date instanceof Date ? date : new Date(date);
        // Check if date is valid
        if (isNaN(dateObj.getTime())) {
            return "Invalid Date";
        }

        const options = {
            short: { month: 'numeric', day: 'numeric', year: '2-digit' },
            medium: { month: 'short', day: 'numeric', year: 'numeric' },
            long: { month: 'long', day: 'numeric', year: 'numeric' },
            monthYear: { month: 'short', year: 'numeric' },
        };

        return new Intl.DateTimeFormat('en-US', options[format] || options.medium).format(dateObj);
    } catch (error) {
        console.error("Error formatting date:", date, error);
        return "Invalid Date";
    }
  };
  
  /**
   * Format a percentage value
   * @param {number} value - The value to format as percentage (e.g., 0.33 for 33%)
   * @param {number} decimals - Number of decimal places (default: 1)
   * @returns {string} Formatted percentage string
   */
  export const formatPercentage = (value, decimals = 1) => {
    const numericValue = Number(value);
    if (isNaN(numericValue)) return '0%';
    return `${(numericValue * 100).toFixed(decimals)}%`;
};
  
  /**
   * Get color class based on transaction type or amount
   * @param {string} type - Transaction type (income/expense)
   * @returns {string} CSS color class
   */
  export const getTransactionColor = (type) => {
    if (type === 'income') return 'text-green-600 dark:text-green-400'; 
    if (type === 'expense') return 'text-red-600 dark:text-red-400';
    return 'text-foreground'; // Default text color
  };
  
  /**
   * Get category icon and color
   * @param {string} category - Transaction category
   * @returns {Object} Object with icon and color information
   */
  export const getCategoryInfo = (category) => {
    const categories = {
      food: { icon: 'ShoppingBagIcon', color: 'bg-orange-500' }, // Replace with Lucide icons later if needed
      transport: { icon: 'TruckIcon', color: 'bg-blue-500' },
      other_expense: { icon: 'DotsHorizontalIcon', color: 'bg-gray-500' },
      other_income: { icon: 'DotsHorizontalIcon', color: 'bg-gray-500' },
      salary: { icon: 'BriefcaseIcon', color: 'bg-emerald-500' },
      freelance: { icon: 'LaptopIcon', color: 'bg-cyan-500' },
      investment: { icon: 'TrendingUpIcon', color: 'bg-blue-600' },
      gift: { icon: 'GiftIcon', color: 'bg-pink-500' },
      entertainment: { icon: 'FilmIcon', color: 'bg-purple-500' },
      utilities: { icon: 'LightbulbIcon', color: 'bg-yellow-500' },
      housing: { icon: 'HomeIcon', color: 'bg-green-500' },
      health: { icon: 'HeartIcon', color: 'bg-red-500' },
      education: { icon: 'AcademicCapIcon', color: 'bg-indigo-500' },
      shopping: { icon: 'ShoppingCartIcon', color: 'bg-pink-500' },
    };
    // Use a default 'other' category if the input category isn't found
    const defaultCategory = categories.other_expense || { icon: 'DotsHorizontalIcon', color: 'bg-gray-500' };
    return categories[category?.toLowerCase()] || defaultCategory;
  };