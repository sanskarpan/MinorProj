import { formatCurrency, formatDate } from '@/utils/formatters';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CalendarDays, Edit2, Trash2, TrendingDown, AlertTriangle, CheckCircle2 } from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const BudgetListItem = ({ budget, onDelete, onEdit }) => {
  if (!budget) return null; 

  const percentageSpent = typeof budget.percentage_spent === 'number' ? budget.percentage_spent : 0;
  const spentAmount = typeof budget.spent_amount === 'number' ? budget.spent_amount : 0;
  const remainingAmount = typeof budget.remaining_amount === 'number' ? budget.remaining_amount : 0;
  const budgetAmount = typeof budget.amount === 'number' ? budget.amount : 0;

  const progressValue = Math.min(100, Math.max(0, percentageSpent));
  const isOverBudget = budget.is_over_budget === true; // Explicit boolean check
  const daysLeft = budget.days_left_in_period;

  const isNearLimit = !isOverBudget && percentageSpent >= 90 && (daysLeft === null || daysLeft >=0); // Consider null daysLeft as still active
  const isApproaching = !isOverBudget && !isNearLimit && percentageSpent >= 70 && (daysLeft === null || daysLeft >=0);

  let progressColorClass = "bg-primary";
  let statusIcon = <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />;
  let statusText = "On Track";
  let statusVariant = "outline";
  let statusTextColorClass = "text-green-600 dark:text-green-400";

  if (isOverBudget) {
    progressColorClass = "bg-destructive";
    statusIcon = <AlertCircle className="h-4 w-4 text-destructive" />; // Using AlertCircle for overbudget
    statusText = "Over Budget";
    statusVariant = "destructive";
    statusTextColorClass = "text-destructive";
  } else if (isNearLimit) {
    progressColorClass = "bg-orange-500";
    statusIcon = <AlertTriangle className="h-4 w-4 text-orange-500" />;
    statusText = "Near Limit";
    statusVariant = "outline";
    statusTextColorClass = "text-orange-600 dark:text-orange-400";
  } else if (isApproaching) {
    progressColorClass = "bg-yellow-500";
    statusIcon = <TrendingDown className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
    statusText = "Approaching";
    statusVariant = "outline";
    statusTextColorClass = "text-yellow-600 dark:text-yellow-400";
  }
  
  const remainingAmountDisplayColor = remainingAmount < 0 ? "text-destructive font-semibold" : "text-green-600 dark:text-green-400";

  return (
    <TooltipProvider delayDuration={100}>
      <Card className="flex flex-col h-full hover:shadow-md transition-shadow duration-150">
        <CardHeader className="pb-2 pt-4 px-4"> {/* Adjusted padding */}
          <div className="flex justify-between items-start gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="truncate flex-grow">
                  <CardTitle className="text-base font-semibold truncate ">{budget.name || "Unnamed Budget"}</CardTitle>
                  <CardDescription className="text-xs capitalize truncate">
                    {(budget.category || "Uncategorized").replace(/_/g, ' ')} • {budget.period || "N/A"}
                  </CardDescription>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" align="start">
                <p className="font-medium">{budget.name || "Unnamed Budget"}</p>
                <p className="text-xs text-muted-foreground">
                    Category: {(budget.category || "Uncategorized").replace(/_/g, ' ')}
                </p>
                <p className="text-xs text-muted-foreground">Period: {budget.period || "N/A"}</p>
              </TooltipContent>
            </Tooltip>
            <Badge 
                variant={statusVariant} 
                className={`whitespace-nowrap text-xs py-0.5 px-1.5 h-fit shrink-0 ${
                    (isNearLimit || isApproaching) && !isOverBudget ? 
                    `border-${statusTextColorClass.split('-')[1]}-500 ${statusTextColorClass}` : 
                    isOverBudget ? '' : `border-green-500 ${statusTextColorClass}` // Default to green for on-track
                }`}
            >
              {statusIcon}
              <span className="ml-1">{statusText}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-2.5 pt-2 pb-3 px-4"> {/* Adjusted padding */}
          <div className="text-xl font-bold">{formatCurrency(budgetAmount)}
              <span className="text-xs font-normal text-muted-foreground"> budgeted</span>
          </div>
          
          <Tooltip>
            <TooltipTrigger asChild>
               <Progress value={progressValue} className={`w-full h-2.5 ${progressColorClass} cursor-default`} indicatorClassName={progressColorClass}/>
            </TooltipTrigger>
            <TooltipContent side="bottom">
                <p>Spent: {formatCurrency(spentAmount)} ({percentageSpent.toFixed(1)}%)</p>
                <p>Remaining: {formatCurrency(remainingAmount)}</p>
                 {isOverBudget && <p className="text-destructive">Overspent by: {formatCurrency(spentAmount - budgetAmount)}</p>}
            </TooltipContent>
          </Tooltip>
          
          <div className="flex justify-between text-xs"> {/* Smaller text */}
            <span className={`${isOverBudget ? "text-destructive font-medium" : statusTextColorClass}`}>
              Spent: {formatCurrency(spentAmount)}
            </span>
            <span className={remainingAmountDisplayColor}>
              Remaining: {formatCurrency(remainingAmount)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1 pt-1">
              <CalendarDays className="h-3 w-3" />
              <span>
                {budget.start_date ? formatDate(budget.start_date, 'short') : 'N/A'} - {budget.end_date ? formatDate(budget.end_date, 'short') : 'N/A'}
              </span>
              {daysLeft !== null && daysLeft >= 0 && (
                   <span className="ml-auto">{daysLeft} day{daysLeft !== 1 ? 's' : ''} left</span>
              )}
              {daysLeft !== null && daysLeft < 0 && (
                  <span className="ml-auto text-muted-foreground">Ended</span>
              )}
          </div>
        </CardContent>
        <CardFooter className="border-t pt-3 pb-3 px-4 flex justify-end gap-2"> {/* Adjusted padding */}
          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => onEdit(budget)}> {/* Smaller ghost button */}
            <Edit2 className="mr-1.5 h-3.5 w-3.5" /> Edit
          </Button>
           <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive h-7 px-2"> {/* Smaller ghost destructive */}
                <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the budget
                  "{budget.name || 'this budget'}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => onDelete(budget.id)}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
};

export default BudgetListItem;