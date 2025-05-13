import { useState, useEffect } from 'react';
import useBudgetStore from '@/store/budgetStore';
import useTransactionStore from '@/store/transactionStore'; // To get categories
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, addMonths, endOfMonth, startOfYear, endOfYear, addYears } from "date-fns";
import { AlertCircle, CalendarIcon, Loader2, PlusCircle } from "lucide-react";

const BudgetEntry = ({ onSuccess, budgetToEdit, onDoneEditing }) => {
  const { addBudget, updateBudget, isLoading, error, clearError } = useBudgetStore();
  const { transactions } = useTransactionStore(); // For category suggestions

  const isEditMode = !!budgetToEdit;

  const getInitialFormData = () => {
    if (isEditMode && budgetToEdit) {
      return {
        name: budgetToEdit.name || '',
        category: budgetToEdit.category || '',
        amount: budgetToEdit.amount ? String(budgetToEdit.amount) : '',
        period: budgetToEdit.period || 'monthly',
        start_date: budgetToEdit.start_date ? new Date(budgetToEdit.start_date) : new Date(),
        end_date: budgetToEdit.end_date ? new Date(budgetToEdit.end_date) : endOfMonth(new Date()),
      };
    }
    return {
      name: '',
      category: '',
      amount: '',
      period: 'monthly',
      start_date: new Date(),
      end_date: endOfMonth(new Date()),
    };
  };
  
  const [formData, setFormData] = useState(getInitialFormData());

  useEffect(() => {
    setFormData(getInitialFormData());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budgetToEdit]);


  const uniqueCategories = [...new Set(transactions.map(t => t.category).filter(Boolean))];
  // Example predefined categories if transactions list is empty or for wider selection
  const predefinedCategories = [
    'Food', 'Transport', 'Entertainment', 'Utilities', 'Housing', 'Health', 
    'Education', 'Shopping', 'Salary', 'Freelance', 'Investment', 'Gift', 'Other'
  ];
  const availableCategories = uniqueCategories.length > 0 
    ? [...new Set([...uniqueCategories, ...predefinedCategories])] 
    : predefinedCategories;


  useEffect(() => {
    let newStartDate = formData.start_date;
    let newEndDate;
    if (formData.period === 'monthly') {
      newEndDate = endOfMonth(newStartDate);
    } else if (formData.period === 'yearly') {
      newStartDate = startOfYear(newStartDate); // Ensure start of year
      newEndDate = endOfYear(newStartDate);
    } else { // Custom
      newEndDate = formData.end_date; // Keep custom if already set
    }
    // Only update if different to avoid re-renders, or if period changes
    if (newEndDate && format(newEndDate, 'yyyy-MM-dd') !== format(formData.end_date, 'yyyy-MM-dd') || 
        newStartDate && format(newStartDate, 'yyyy-MM-dd') !== format(formData.start_date, 'yyyy-MM-dd') ) {
      setFormData(prev => ({ ...prev, start_date: newStartDate, end_date: newEndDate }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.period, formData.start_date]); // Re-calculate end_date if period or start_date changes


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (error) clearError();
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    if (onDoneEditing) onDoneEditing(false); // Signal dialog to close
  }

  const handleAmountChange = (e) => {
     if (error) clearError();
     const value = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
     setFormData(prev => ({ ...prev, amount: value }));
  };
  
  const handleSelectChange = (name, value) => {
     if (error) clearError();
     setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, date) => {
    if (error) clearError();
    if (date) {
      setFormData(prev => ({ ...prev, [name]: date }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (error) clearError();

    if (!formData.name || !formData.category || !formData.amount || !formData.start_date || !formData.end_date) {
      // Basic validation - enhance with a proper validation library later
      return;
    }

    const submissionData = {
      name: formData.name,
      category: formData.category,
      amount: parseFloat(formData.amount),
      period: formData.period,
      start_date: format(formData.start_date, 'yyyy-MM-dd'),
      end_date: format(formData.end_date, 'yyyy-MM-dd'),
    };
    
    let success;
    if (isEditMode && budgetToEdit?.id) {
      success = await updateBudget(budgetToEdit.id, submissionData);
    } else {
      success = await addBudget(submissionData);
    }

    if (success) {
      if (!isEditMode) { 
        setFormData(getInitialFormData()); // Reset form only if adding new
      }
      if (onSuccess) onSuccess();
      if (onDoneEditing) onDoneEditing(false); // Signal dialog to close
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEditMode ? 'Edit Budget' : <><PlusCircle className="h-5 w-5" /> Create New Budget</>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Budget Name</Label>
            <Input
              id="name" name="name" placeholder="e.g., Monthly Groceries" required
              value={formData.name} onChange={handleInputChange} disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select name="category" value={formData.category} onValueChange={(val) => handleSelectChange('category', val)} required disabled={isLoading}>
              <SelectTrigger id="category"><SelectValue placeholder="Select a category" /></SelectTrigger>
              <SelectContent>
                {availableCategories.map(cat => (
                  <SelectItem key={cat} value={cat.toLowerCase().replace(/\s+/g, '_')}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Budgeted Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <Input
                id="amount" name="amount" placeholder="0.00" required
                value={formData.amount} onChange={handleAmountChange} className="pl-7" disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="period">Period</Label>
            <Select name="period" value={formData.period} onValueChange={(val) => handleSelectChange('period', val)} required disabled={isLoading}>
              <SelectTrigger id="period"><SelectValue placeholder="Select period" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.start_date && "text-muted-foreground")} disabled={isLoading}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date ? format(formData.start_date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={formData.start_date} onSelect={(d) => handleDateChange('start_date', d)} initialFocus disabled={isLoading} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.end_date && "text-muted-foreground")} disabled={isLoading || formData.period !== 'custom'}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.end_date ? format(formData.end_date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={formData.end_date} onSelect={(d) => handleDateChange('end_date', d)} initialFocus disabled={isLoading || formData.period !== 'custom'} fromDate={formData.start_date}/>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Update Budget' : 'Add Budget'}
          </Button>
          {isEditMode && ( 
            <Button variant="outline" onClick={handleCancel} className="w-full mt-2" disabled={isLoading}>
              Cancel
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
};


export default BudgetEntry;