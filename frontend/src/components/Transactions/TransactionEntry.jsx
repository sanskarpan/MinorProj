import { useState,useEffect} from 'react';
import useTransactionStore from '@/store/transactionStore';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // For Date Picker
import { Calendar } from "@/components/ui/calendar"; // For Date Picker
import { cn } from "@/lib/utils";
import { format } from "date-fns"; // Date formatting
import { AlertCircle, CalendarIcon, Loader2 } from "lucide-react";

const TransactionEntry = ({ onSuccess }) => {
  const { addTransaction, isLoading, error, clearError } = useTransactionStore();
  const initialDate = new Date(); // Use Date object for calendar

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: initialDate, // Store as Date object
    category: '', // Default to empty, force selection
    type: 'expense',
    notes: '',
  });

  // Combined categories, adjust as needed
  const expenseCategories = [
    { value: 'food', label: 'Food & Dining' },
    { value: 'transport', label: 'Transportation' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'housing', label: 'Housing & Rent' },
    { value: 'health', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'other_expense', label: 'Other Expense' }, // Differentiate other
  ];
  const incomeCategories = [
    { value: 'salary', label: 'Salary' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'investment', label: 'Investment' },
    { value: 'gift', label: 'Gift' },
    { value: 'other_income', label: 'Other Income' }, // Differentiate other
  ];

  const currentCategories = formData.type === 'income' ? incomeCategories : expenseCategories;

  // Reset category if type changes and current category is invalid for new type
  useEffect(() => {
    const isValidCategory = currentCategories.some(c => c.value === formData.category);
    if (formData.category && !isValidCategory) {
      setFormData(prev => ({ ...prev, category: '' })); // Reset category
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.type, formData.category]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (error) clearError();
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAmountChange = (e) => {
     if (error) clearError();
     // Allow only numbers and one decimal point
     const value = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
     setFormData(prev => ({ ...prev, amount: value }));
  };

  const handleRadioChange = (value) => {
    if (error) clearError();
    setFormData(prev => ({ ...prev, type: value }));
  };

  const handleSelectChange = (value) => {
     if (error) clearError();
     setFormData(prev => ({ ...prev, category: value }));
  };

  const handleDateChange = (date) => {
    if (error) clearError();
    if (date) {
      setFormData(prev => ({ ...prev, date: date }));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (error) clearError();

    // Basic validation
    if (!formData.description || !formData.amount || !formData.date || !formData.category || !formData.type) {
      // Ideally show specific validation errors using react-hook-form later
      return;
    }

    const submissionData = {
      ...formData,
      amount: parseFloat(formData.amount),
      // Format date to 'YYYY-MM-DD' string for API
      date: format(formData.date, 'yyyy-MM-dd'),
    };

    const success = await addTransaction(submissionData);

    if (success) {
      // Reset form to initial state
      setFormData({
        description: '',
        amount: '',
        date: initialDate,
        category: '',
        type: 'expense',
        notes: '',
      });
      if (onSuccess) {
        onSuccess(); // Callback to refetch list, etc.
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Transaction</CardTitle>
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

          {/* Transaction Type */}
          <RadioGroup
            name="type"
            value={formData.type}
            onValueChange={handleRadioChange}
            className="grid grid-cols-2 gap-4"
            disabled={isLoading}
          >
            <Label className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer [&:has([data-state=checked])]:border-primary">
              <RadioGroupItem value="expense" id="expense" />
              <span>Expense</span>
            </Label>
            <Label className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer [&:has([data-state=checked])]:border-primary">
              <RadioGroupItem value="income" id="income" />
              <span>Income</span>
            </Label>
          </RadioGroup>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              placeholder="e.g., Coffee, Paycheck"
              required
              value={formData.description}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            {/* Consider using Input with type="number" and step="0.01", but custom handling offers more control */}
             <div className="relative">
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <Input
                  id="amount"
                  name="amount"
                  placeholder="0.00"
                  required
                  value={formData.amount}
                  onChange={handleAmountChange}
                  className="pl-7" // Padding left for the '$' sign
                  disabled={isLoading}
                />
             </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
             <Label htmlFor="date">Date</Label>
             <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={handleDateChange}
                    initialFocus
                    disabled={isLoading}
                  />
                </PopoverContent>
             </Popover>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              name="category"
              value={formData.category}
              onValueChange={handleSelectChange}
              required
              disabled={isLoading}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {currentCategories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Add any extra details..."
              rows={3}
              value={formData.notes}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Add Transaction
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TransactionEntry;