import { useState, useEffect } from 'react';
import useBudgetStore from '@/store/budgetStore';
import useTransactionStore from '@/store/transactionStore'; // For initial category suggestions
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { format, endOfMonth, startOfYear, endOfYear, startOfMonth } from "date-fns";
import { AlertCircle, CalendarIcon, Loader2, PlusCircle } from "lucide-react";

const BudgetEntry = ({ onSuccess, budgetToEdit, onDoneEditing }) => {
  const { addBudget, updateBudget, isLoading, error, clearError } = useBudgetStore();
  const { transactions } = useTransactionStore.getState(); 

  const isEditMode = !!budgetToEdit;

  const commonCategories = [
    { value: 'food_dining', label: 'Food & Dining' }, { value: 'groceries', label: 'Groceries' },
    { value: 'transportation', label: 'Transportation' }, { value: 'utilities', label: 'Utilities' },
    { value: 'internet_phone', label: 'Internet & Phone' }, { value: 'housing_rent_mortgage', label: 'Housing' },
    { value: 'home_maintenance', label: 'Home Maintenance' }, { value: 'health_medical', label: 'Healthcare' },
    { value: 'insurance', label: 'Insurance' }, { value: 'education', label: 'Education' },
    { value: 'personal_care', label: 'Personal Care' }, { value: 'clothing_shopping', label: 'Shopping' },
    { value: 'entertainment_leisure', label: 'Entertainment' }, { value: 'subscriptions_memberships', label: 'Subscriptions' },
    { value: 'travel_vacation', label: 'Travel/Vacation' }, { value: 'gifts_donations', label: 'Gifts/Donations' },
    { value: 'childcare_family', label: 'Family/Childcare' }, { value: 'pets', label: 'Pets' },
    { value: 'taxes', label: 'Taxes' }, { value: 'loan_repayments', label: 'Loan Repayments' },
    { value: 'other_expenses', label: 'Other Expenses' }, { value: 'salary_wages', label: 'Salary/Wages' },
    { value: 'freelance_income', label: 'Freelance' }, { value: 'investment_income', label: 'Investments' },
    { value: 'other_income', label: 'Other Income' },
  ];
  
  const getAvailableCategories = () => {
    const transactionCategories = [...new Set(transactions.map(t => t.category).filter(Boolean))]
      .map(cat => {
          const common = commonCategories.find(cc => cc.value === cat);
          return { value: cat, label: common ? common.label : cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, ' ') };
      });
    const combined = [...transactionCategories];
    commonCategories.forEach(commonCat => {
      if (!combined.find(c => c.value === commonCat.value)) combined.push(commonCat);
    });
    return combined.sort((a, b) => a.label.localeCompare(b.label));
  };
  const [availableCategories, setAvailableCategories] = useState([]); // Initialize empty, set in useEffect
  
  const getInitialFormData = () => {
    const defaultStartDate = startOfMonth(new Date());
    const defaultEndDate = endOfMonth(defaultStartDate);
    const defaultAmount = 500;

    if (isEditMode && budgetToEdit) {
      return {
        name: budgetToEdit.name || '',
        category: budgetToEdit.category || '',
        amount: budgetToEdit.amount ? String(budgetToEdit.amount) : String(defaultAmount),
        period: budgetToEdit.period || 'monthly',
        // Ensure dates are actual Date objects if coming from string
        start_date: budgetToEdit.start_date ? (typeof budgetToEdit.start_date === 'string' ? new Date(budgetToEdit.start_date + "T00:00:00") : budgetToEdit.start_date) : defaultStartDate,
        end_date: budgetToEdit.end_date ? (typeof budgetToEdit.end_date === 'string' ? new Date(budgetToEdit.end_date + "T00:00:00") : budgetToEdit.end_date) : defaultEndDate,
      };
    }
    return {
      name: '', category: '', amount: String(defaultAmount), period: 'monthly',
      start_date: defaultStartDate, end_date: defaultEndDate,
    };
  };
  
  const [formData, setFormData] = useState(getInitialFormData());
  const [sliderAmount, setSliderAmount] = useState(
      parseFloat(getInitialFormData().amount) || 500
  );

  useEffect(() => {
    const initialData = getInitialFormData();
    setFormData(initialData);
    setSliderAmount(parseFloat(initialData.amount) || 500);
    setAvailableCategories(getAvailableCategories());
    if (error) clearError(); // Clear error when dialog opens/mode changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budgetToEdit, isEditMode]); // Transactions not direct dep to avoid loop, categories fetched on dialog open

  useEffect(() => {
    if (!formData.start_date) return;
    let newEndDate;
    if (formData.period === 'monthly') newEndDate = endOfMonth(formData.start_date);
    else if (formData.period === 'yearly') newEndDate = endOfYear(formData.start_date);
    else { // Custom
        if (formData.end_date && formData.end_date < formData.start_date) newEndDate = formData.start_date;
        else newEndDate = formData.end_date; // Keep user's custom end date or let them pick
    }
    
    const currentFormEndDateStr = formData.end_date ? format(formData.end_date, 'yyyy-MM-dd') : null;
    const newEndDateStr = newEndDate ? format(newEndDate, 'yyyy-MM-dd') : null;

    if (formData.period !== 'custom' && newEndDateStr !== currentFormEndDateStr) {
        setFormData(prev => ({ ...prev, end_date: newEndDate }));
    } else if (formData.period === 'custom' && formData.end_date && newEndDate && newEndDateStr !== currentFormEndDateStr) {
        // If custom and end_date became invalid (e.g. start_date changed past it)
        setFormData(prev => ({ ...prev, end_date: newEndDate }));
    }
  }, [formData.period, formData.start_date, formData.end_date]); // formData.end_date added for custom period check


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (error) clearError();
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAmountInputChange = (e) => {
     if (error) clearError();
     const value = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
     setFormData(prev => ({ ...prev, amount: value }));
     const numericValue = parseFloat(value);
     if (!isNaN(numericValue) && numericValue >= 0) setSliderAmount(numericValue);
     else if (value === '') setSliderAmount(0); 
  };
  
  const handleSliderChange = (valueArray) => {
    const newAmount = valueArray[0];
    setSliderAmount(newAmount);
    setFormData(prev => ({ ...prev, amount: String(newAmount) }));
    if (error) clearError();
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

    if (!formData.name || !formData.category || !formData.amount || parseFloat(formData.amount) <= 0 || !formData.start_date || !formData.end_date) {
      alert("Please fill all fields correctly. Amount must be greater than zero."); return;
    }
    if (new Date(formData.end_date) < new Date(formData.start_date)) {
        alert("End date must be on or after start date."); return;
    }

    const submissionData = {
      name: formData.name, category: formData.category, amount: parseFloat(formData.amount),
      period: formData.period, start_date: format(formData.start_date, 'yyyy-MM-dd'),
      end_date: format(formData.end_date, 'yyyy-MM-dd'),
    };
    
    let success;
    if (isEditMode && budgetToEdit?.id) success = await updateBudget(budgetToEdit.id, submissionData);
    else success = await addBudget(submissionData);

    if (success) {
      if (!isEditMode) {
        const newInitialData = getInitialFormData(); 
        setFormData(newInitialData);
        setSliderAmount(parseFloat(newInitialData.amount) || 500);
      }
      if (onSuccess) onSuccess(); 
      if (onDoneEditing) onDoneEditing(false); 
    }
  };

  const handleCancel = () => { if (onDoneEditing) onDoneEditing(false); };

  return (
    <Card>
      <CardHeader className="pt-4 pb-2"> {/* Adjusted padding */}
        <CardTitle className="text-lg flex items-center gap-2"> {/* Reduced text size */}
          {isEditMode ? 'Edit Budget' : <><PlusCircle className="h-5 w-5" /> Create New Budget</>}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4"> {/* Adjusted padding */}
        <form onSubmit={handleSubmit} className="space-y-3"> {/* Reduced space-y */}
          {error && (
            <Alert variant="destructive" className="text-xs p-2"> {/* Smaller alert */}
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-sm">Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="name">Budget Name</Label>
            <Input id="name" name="name" placeholder="e.g., Monthly Groceries" required value={formData.name} onChange={handleInputChange} disabled={isLoading} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <Select name="category" value={formData.category} onValueChange={(val) => handleSelectChange('category', val)} required disabled={isLoading}>
              <SelectTrigger id="category"><SelectValue placeholder="Select a category" /></SelectTrigger>
              <SelectContent>
                {availableCategories.map(cat => (<SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="amount">Budgeted Amount</Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-grow">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                <Input id="amount" name="amount" placeholder="0.00" required value={formData.amount} onChange={handleAmountInputChange} className="pl-6 text-sm h-9" disabled={isLoading} type="text" />
              </div>
              <span className="w-16 text-right text-sm font-medium">${sliderAmount.toFixed(0)}</span>
            </div>
            <Slider value={[sliderAmount]} onValueChange={handleSliderChange} max={5000} step={10} className="mt-1.5 [&>span:first-child]:h-1" disabled={isLoading} />
          </div>

          <div className="space-y-1.5">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="start_date">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal text-sm h-9", !formData.start_date && "text-muted-foreground")} disabled={isLoading}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date ? format(formData.start_date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.start_date} onSelect={(d) => handleDateChange('start_date', d)} initialFocus disabled={isLoading} /></PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end_date">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal text-sm h-9", !formData.end_date && "text-muted-foreground")} disabled={isLoading || formData.period !== 'custom'}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.end_date ? format(formData.end_date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.end_date} onSelect={(d) => handleDateChange('end_date', d)} initialFocus disabled={isLoading || formData.period !== 'custom'} fromDate={formData.start_date}/></PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button type="submit" disabled={isLoading} className="w-full sm:flex-1">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'Update Budget' : 'Add Budget'}
            </Button>
            {isEditMode && ( 
              <Button variant="outline" type="button" onClick={handleCancel} className="w-full sm:w-auto" disabled={isLoading}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BudgetEntry;