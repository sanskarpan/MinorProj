import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, Wallet } from "lucide-react";

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, isLoading, error: apiError, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (apiError) clearError();
    if (formError) setFormError('');
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setFormError('All fields are required.');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match.');
      return false;
    }
    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setFormError('');

    if (!validateForm()) {
      return;
    }

    const { name, email, password } = formData;
    const success = await signup(name, email, password);

    if (success) {
      navigate('/login', {
        replace: true,
        state: { message: 'Account created successfully! Please sign in.' }
      });
    }
  };

  const displayError = apiError || formError;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <Wallet className="mx-auto h-8 w-8 text-primary" />
          <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
          <CardDescription>Enter your details to get started.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {displayError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Signup Failed</AlertTitle>
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                required
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create Account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary underline underline-offset-4 hover:text-primary/90">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignupPage;