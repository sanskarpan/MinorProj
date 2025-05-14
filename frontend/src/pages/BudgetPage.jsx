import { useEffect, useState, useCallback } from 'react';
import useBudgetStore from '@/store/budgetStore';
import BudgetEntry from '@/components/Budgets/BudgetEntry';
import BudgetListItem from '@/components/Budgets/BudgetListItem';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ListFilter, Sigma, PlusCircle } from "lucide-react";
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  // DialogTrigger, // Not needed as we manually control open state
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card"; // Removed CardHeader, CardTitle as they are not used here
import { formatCurrency } from '@/utils/formatters';

const BudgetPage = () => {
  const { budgets, fetchBudgets, isLoading, error, deleteBudget, clearError } = useBudgetStore();
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState(null);

  const fetchFilteredBudgets = useCallback(() => {
    const activeOnly = !showArchived;
    const period = filterPeriod === 'all' ? null : filterPeriod;
    fetchBudgets(activeOnly, period);
  }, [fetchBudgets, showArchived, filterPeriod]);

  useEffect(() => {
    fetchFilteredBudgets();
  }, [fetchFilteredBudgets]);

  const handleDeleteBudget = async (id) => {
    await deleteBudget(id);
    // Optional: show toast on success/failure
  };

  const handleEditBudget = (budget) => {
    setBudgetToEdit(budget);
    setIsEntryDialogOpen(true);
  };

  const handleOpenCreateDialog = () => {
    setBudgetToEdit(null);
    setIsEntryDialogOpen(true);
  };

  const handleEntrySuccess = () => {
    setIsEntryDialogOpen(false);
    setBudgetToEdit(null);
    fetchFilteredBudgets(); 
  };
  
  const handleDialogChange = (open) => {
    setIsEntryDialogOpen(open);
    if (!open) {
      setBudgetToEdit(null);
    }
  };

  const displayedBudgets = budgets;

  const totalBudgetedAmount = displayedBudgets.reduce((sum, b) => sum + (b.amount || 0), 0);
  const totalSpentAmount = displayedBudgets.reduce((sum, b) => sum + (b.spent_amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">
            Plan and track your spending against your financial goals.
          </p>
        </div>
        <Button onClick={handleOpenCreateDialog}>
           <PlusCircle className="mr-2 h-4 w-4" /> Create New Budget
        </Button>
      </div>

      <Dialog open={isEntryDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{budgetToEdit ? 'Edit Budget' : 'Create New Budget'}</DialogTitle>
            <DialogDescription>
              {budgetToEdit ? 'Update the details for your budget.' : 'Fill in the details to create a new budget plan.'}
            </DialogDescription>
          </DialogHeader>
          <BudgetEntry 
            onSuccess={handleEntrySuccess} 
            budgetToEdit={budgetToEdit}
            onDoneEditing={() => handleDialogChange(false)} 
          />
        </DialogContent>
      </Dialog>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error} <Button variant="link" size="sm" onClick={clearError} className="p-0 h-auto">Dismiss</Button></AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 border rounded-lg bg-card">
        <div className="flex gap-2 items-center flex-wrap">
           <ListFilter className="h-5 w-5 text-muted-foreground shrink-0"/>
           <Select value={filterPeriod} onValueChange={setFilterPeriod} disabled={isLoading}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Periods</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant={showArchived ? "secondary" : "outline"} 
            onClick={() => setShowArchived(!showArchived)}
            size="sm"
            className="shrink-0"
            disabled={isLoading}
          >
            {showArchived ? "Hide Past" : "Show Past"}
          </Button>
        </div>
        { !isLoading && displayedBudgets.length > 0 && (
            <div className="text-right mt-4 md:mt-0">
                <p className="text-sm text-muted-foreground">Total Budgeted: <span className="font-semibold text-primary">{formatCurrency(totalBudgetedAmount)}</span></p>
                <p className="text-sm text-muted-foreground">Total Spent: <span className="font-semibold text-primary">{formatCurrency(totalSpentAmount)}</span></p>
            </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="flex flex-col"> {/* Ensure Card is a flex container */}
              <div className="p-6 pb-3"><Skeleton className="h-6 w-3/4" /></div> {/* Mimic CardHeader */}
              <div className="p-6 pt-0 space-y-3 flex-grow"> {/* Mimic CardContent */}
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-3 w-full" />
                <div className="flex justify-between"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-4 w-1/3" /></div>
              </div>
              <div className="p-6 pt-0"><Skeleton className="h-10 w-full" /></div> {/* Mimic CardFooter */}
            </Card>
          ))}
        </div>
      ) : displayedBudgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {displayedBudgets.map(budget => (
            <BudgetListItem
              key={budget.id}
              budget={budget}
              onDelete={handleDeleteBudget}
              onEdit={handleEditBudget}
            />
          ))}
        </div>
      ) : (
        <Card className="col-span-full">
          <CardContent className="text-center py-12">
            <Sigma className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No budgets found.</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {filterPeriod !== 'all' || showArchived ? "Try adjusting your filters or " : ""}
              create a new budget to get started.
            </p>
            <Button variant="outline" className="mt-4" onClick={handleOpenCreateDialog}>
                <PlusCircle className="mr-2 h-4 w-4" /> Create Budget
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BudgetPage;