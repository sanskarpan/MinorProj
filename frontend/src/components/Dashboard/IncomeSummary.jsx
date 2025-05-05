
import { formatCurrency } from '@/utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const IncomeSummary = ({ totalIncome }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Income</CardTitle>
        <TrendingUp className="h-4 w-4 text-success-500" /> {/* Use success color */}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-success-600 dark:text-success-400">
          {formatCurrency(totalIncome)}
        </div>
         {/* Optional: Add comparison to previous period later */}
        <p className="text-xs text-muted-foreground mt-1">
          All recorded income
        </p>
      </CardContent>
    </Card>
  );
};

export default IncomeSummary;