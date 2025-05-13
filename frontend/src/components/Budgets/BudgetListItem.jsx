import { formatCurrency, formatDate } from '@/utils/formatters';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Edit2, Trash2, TrendingDown, TrendingUp, CircleAlert, CheckCircle2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const BudgetListItem = ({ budget, onDelete, onEdit }) => {
  const progressValue = Math.min(100, Math.max(0, budget.percentage_spent)); // Cap between 0 and 100

  let progressColor = "bg-primary"; // Default blueish
  let statusIcon = <TrendingUp className="h-4 w-4 text-success-500" />;
  let statusText = "On Track";

  if (budget.is_over_budget) {
    progressColor = "bg-destructive"; // Red
    statusIcon = <CircleAlert className="h-4 w-4 text-destructive" />;
    statusText = "Over Budget";
  } else if (budget.percentage_spent >= 90) {
    progressColor = "bg-orange-500"; // Orange for nearing limit
    statusIcon = <TrendingDown className="h-4 w-4 text-orange-500" />;
    statusText = "Near Limit";
  } else if (budget.percentage_spent >= 70) {
    progressColor = "bg-yellow-500"; // Yellow for > 70%
    statusIcon = <TrendingDown className="h-4 w-4 text-yellow-500" />;
    statusText = "Approaching";
  } else {
     statusIcon = <CheckCircle2 className="h-4 w-4 text-success-500" />;
  }


  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-lg">{budget.name}</CardTitle>
                <CardDescription className="capitalize">{budget.category.replace(/_/g, ' ')} • {budget.period}</CardDescription>
            </div>
            <Badge variant={budget.is_over_budget ? "destructive" : "outline"} className="whitespace-nowrap">
                {statusIcon}
                <span className="ml-1.5">{statusText}</span>
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <div className="text-2xl font-bold">{formatCurrency(budget.amount)}
            <span className="text-sm font-normal text-muted-foreground"> budgeted</span>
        </div>
        
        <Progress value={progressValue} className={`w-full h-3 ${progressColor}`} />
        
        <div className="flex justify-between text-sm">
          <span className={budget.is_over_budget ? "text-destructive font-semibold" : "text-muted-foreground"}>
            Spent: {formatCurrency(budget.spent_amount)}
          </span>
          <span className={budget.remaining_amount < 0 ? "text-destructive font-semibold" : "text-success-600 dark:text-success-400"}>
            Remaining: {formatCurrency(budget.remaining_amount)}
          </span>
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            <span>{formatDate(budget.start_date, 'short')} - {formatDate(budget.end_date, 'short')}</span>
            {budget.days_left_in_period !== null && budget.days_left_in_period >= 0 && (
                 <span className="ml-auto">{budget.days_left_in_period} days left</span>
            )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(budget)}>
          <Edit2 className="mr-2 h-3.5 w-3.5" /> Edit
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" >
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the budget
                "{budget.name}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(budget.id)}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};

export default BudgetListItem;