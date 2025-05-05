import { useState } from 'react';
import { formatCurrency, formatDate, getTransactionColor, getCategoryInfo } from '../../utils/formatters';
import useTransactionStore from '../../store/transactionStore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TransactionList = ({ transactions, isLoading }) => {
  const { deleteTransaction } = useTransactionStore();
  const [filter, setFilter] = useState({
    type: 'all',
    category: 'all',
    searchTerm: '',
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc',
  });

  // Handle sort
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting
  const sortedTransactions = [...transactions].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Apply filters
  const filteredTransactions = sortedTransactions.filter((transaction) => {
    // Filter by type
    if (filter.type !== 'all' && transaction.type !== filter.type) {
      return false;
    }

    // Filter by category
    if (filter.category !== 'all' && transaction.category !== filter.category) {
      return false;
    }

    // Filter by search term
    if (filter.searchTerm && !transaction.description.toLowerCase().includes(filter.searchTerm.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Get unique categories for filter dropdown
  const categories = [...new Set(transactions.map((t) => t.category))];

  // Handle delete transaction
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await deleteTransaction(id);
    }
  };

  // Filter button handler
  const handleFilterClick = (filterType, value) => {
    setFilter(prev => ({ ...prev, [filterType]: value }));
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <div className="space-y-4 p-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-muted"></div>
                <div className="space-y-1">
                  <div className="h-4 w-40 bg-muted rounded"></div>
                  <div className="h-3 w-24 bg-muted rounded"></div>
                </div>
              </div>
              <div className="h-4 w-20 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!transactions.length) {
    return (
      <Card>
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium">No transactions</h3>
          <p className="mt-1 text-sm text-muted-foreground">Add your first transaction to start tracking your finances.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-none">
      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Type Filters */}
        <Button
          variant={filter.type === 'all' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => handleFilterClick('type', 'all')}
          className="rounded-full"
        >
          All Types
        </Button>
        <Button
          variant={filter.type === 'income' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => handleFilterClick('type', 'income')}
          className="rounded-full"
        >
          Income
        </Button>
        <Button
          variant={filter.type === 'expense' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => handleFilterClick('type', 'expense')}
          className="rounded-full"
        >
          Expense
        </Button>

        {/* Category Filters */}
        <Button
          variant={filter.category === 'all' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => handleFilterClick('category', 'all')}
          className="rounded-full ml-2"
        >
          All Categories
        </Button>
        {categories.map(category => (
          <Button
            key={category}
            variant={filter.category === category ? 'default' : 'outline'} 
            size="sm"
            onClick={() => handleFilterClick('category', category)}
            className="rounded-full"
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}

        {/* Search Input - Right aligned */}
        <div className="ml-auto">
          <Input
            type="text"
            className="text-sm w-56 rounded-full"
            placeholder="Search transactions..."
            value={filter.searchTerm}
            onChange={(e) => setFilter(prev => ({ ...prev, searchTerm: e.target.value }))}
          />
        </div>
      </div>

      {/* Transaction List */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y">
          <thead className="bg-muted/50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center">
                  Date
                  {sortConfig.key === 'date' && (
                    <svg
                      className={`ml-1 h-4 w-4 ${sortConfig.direction === 'asc' ? 'transform rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('description')}
              >
                <div className="flex items-center">
                  Description
                  {sortConfig.key === 'description' && (
                    <svg
                      className={`ml-1 h-4 w-4 ${sortConfig.direction === 'asc' ? 'transform rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center">
                  Category
                  {sortConfig.key === 'category' && (
                    <svg
                      className={`ml-1 h-4 w-4 ${sortConfig.direction === 'asc' ? 'transform rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center">
                  Amount
                  {sortConfig.key === 'amount' && (
                    <svg
                      className={`ml-1 h-4 w-4 ${sortConfig.direction === 'asc' ? 'transform rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {formatDate(transaction.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium">{transaction.description}</div>
                  {transaction.notes && (
                    <div className="text-xs text-muted-foreground mt-1 truncate max-w-xs">{transaction.notes}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant="outline" className="bg-muted/50 text-foreground">
                    {transaction.category}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <span className={getTransactionColor(transaction.type)}>
                    {transaction.type === 'expense' ? '-' : '+'}
                    {formatCurrency(transaction.amount)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(transaction.id)}
                    className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default TransactionList;