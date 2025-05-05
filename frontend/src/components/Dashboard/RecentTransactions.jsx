// frontend/src/components/Dashboard/RecentTransactions.jsx
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate, getTransactionColor } from '@/utils/formatters';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton"; // ShadCN Skeleton
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, List } from "lucide-react"; // Icons

const RecentTransactions = ({ transactions, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
         <CardFooter className="justify-center">
            <Skeleton className="h-8 w-32" />
        </CardFooter>
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-10">
          <List className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">No transactions found yet.</p>
          <Button asChild variant="link" className="mt-2">
            <Link to="/transactions">Add your first transaction</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Use a simple list for recent items instead of full table */}
         <ul className="divide-y divide-border">
          {transactions.map((transaction) => (
            <li key={transaction.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                 <div className={cn(
                    "p-2 rounded-full",
                    transaction.type === 'income' ? 'bg-success-100 dark:bg-success-900/20' : 'bg-danger-100 dark:bg-danger-900/20'
                 )}>
                    {transaction.type === 'income' ? (
                       <ArrowUpRight className="h-4 w-4 text-success-600 dark:text-success-400" />
                    ) : (
                      <ArrowDownLeft className="h-4 w-4 text-danger-600 dark:text-danger-400" />
                    )}
                 </div>
                <div>
                  <p className="text-sm font-medium">{transaction.description}</p>
                  <div className="text-xs text-muted-foreground">
                     <span>{formatDate(transaction.date, 'short')}</span>
                     <span className="mx-1">•</span>
                      {/* Use Badge for category */}
                     <Badge variant="outline" className="text-xs font-normal">{transaction.category}</Badge>
                  </div>
                </div>
              </div>
              <div className={cn(
                "text-sm font-semibold",
                getTransactionColor(transaction.type) // Existing helper might need theme adjustment
              )}>
                 {/* Ensure getTransactionColor returns Tailwind classes compatible with light/dark */}
                {transaction.type === 'expense' ? '-' : '+'}
                {formatCurrency(transaction.amount)}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="justify-center border-t pt-4">
        <Button asChild variant="outline" size="sm">
          <Link to="/transactions">
            View All Transactions
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecentTransactions;