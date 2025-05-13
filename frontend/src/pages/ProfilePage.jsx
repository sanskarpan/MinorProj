import { useState, useEffect } from 'react';
import useAuthStore from '@/store/authStore';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, UserCircle, CheckCircle, AlertCircleIcon } from "lucide-react";
import { formatDate } from '@/utils/formatters';
import { useToast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const { user, updateUserProfile, isLoading: authLoading, error: authError, clearError } = useAuthStore();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || ''); // Display only, not editable for now
  const [isEditing, setIsEditing] = useState(false);
  const [currentError, setCurrentError] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    setCurrentError(authError);
  }, [authError]);

  const handleNameChange = (e) => {
    setName(e.target.value);
    if (currentError) {
      clearError(); // Clear store error
      setCurrentError(null); // Clear local error
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (name === user?.name) {
      setIsEditing(false);
      return;
    }
    const result = await updateUserProfile({ name });
    if (result.success) {
      toast({
        title: "Profile Updated",
        description: "Your name has been successfully updated.",
        variant: "success", // Assuming you have a success variant for toast
      });
      setIsEditing(false);
    } else {
      setCurrentError(result.error || "Failed to update profile.");
    }
  };

  const getInitials = (nameStr) => {
    if (!nameStr) return 'U';
    const parts = nameStr.split(' ');
    if (parts.length > 1) {
      return parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase();
    }
    return nameStr.substring(0, 2).toUpperCase();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">My Profile</h1>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              {/* <AvatarImage src={user.avatarUrl} alt={user.name} /> */}
              <AvatarFallback className="text-3xl">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
              <CardDescription className="text-xs">Joined: {formatDate(user.created_at, 'long')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {currentError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertTitle>Update Failed</AlertTitle>
              <AlertDescription>{currentError}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} disabled readOnly />
               <p className="text-xs text-muted-foreground">Email address cannot be changed here.</p>
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  disabled={authLoading}
                  autoFocus
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Full Name</Label>
                <p className="text-lg font-medium pt-1">{user.name}</p>
              </div>
            )}

            {isEditing ? (
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={authLoading || name === user.name}>
                  {authLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => { setIsEditing(false); setName(user.name); setCurrentError(null); clearError();}} disabled={authLoading}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                Edit Name
              </Button>
            )}
          </form>
        </CardContent>
         <CardFooter className="border-t pt-4 mt-4">
            <p className="text-xs text-muted-foreground">
              For password changes or other account settings, please visit the Settings page.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProfilePage;