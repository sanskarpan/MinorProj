// frontend/src/components/Dashboard/BudgetOverview.jsx
import { formatCurrency } from '@/utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react"; // Use lucide icon

const BudgetOverview = ({ balance }) => {
  const balanceColor = balance >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${balanceColor}`}>
          {formatCurrency(balance)}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Total calculated balance
        </p>
      </CardContent>
    </Card>
  );
};

export default BudgetOverview;