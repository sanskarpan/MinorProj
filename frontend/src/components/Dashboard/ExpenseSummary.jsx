import { formatCurrency } from '@/utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown } from "lucide-react";

const ExpenseSummary = ({ totalExpense }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
        <TrendingDown className="h-4 w-4 text-danger-500" /> {/* Use danger color */}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-danger-600 dark:text-danger-400">
          {formatCurrency(totalExpense)}
        </div>
         {/* Optional: Add comparison to previous period later */}
        <p className="text-xs text-muted-foreground mt-1">
          All recorded expenses
        </p>
      </CardContent>
    </Card>
  );
};

export default ExpenseSummary;