import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"; // Assuming you have a Switch component
import { Moon, Sun, Bell, FileText, ShieldCheck } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CardFooter } from "@/components/ui/card";
import { useState } from "react";

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();

  // Placeholder state for notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences and account settings.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === 'dark' ? <Moon className="h-5 w-5"/> : <Sun className="h-5 w-5"/>}
              Appearance
            </CardTitle>
            <CardDescription>Customize the look and feel of the application.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-select" className="text-base">Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger id="theme-select" className="w-[180px]">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings (Placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5"/>Notifications</CardTitle>
            <CardDescription>Manage how you receive alerts and updates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="flex flex-col gap-1">
                <span>Email Notifications</span>
                <span className="text-xs text-muted-foreground">Receive summaries and important alerts via email.</span>
              </Label>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
                disabled // Placeholder
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="budget-alerts" className="flex flex-col gap-1">
                <span>Budget Alerts</span>
                <span className="text-xs text-muted-foreground">Get notified when you're nearing or over budget.</span>
              </Label>
              <Switch
                id="budget-alerts"
                checked={budgetAlerts}
                onCheckedChange={setBudgetAlerts}
                disabled // Placeholder
              />
            </div>
          </CardContent>
           <CardFooter>
            <p className="text-xs text-muted-foreground">Notification settings are illustrative and will be fully implemented later.</p>
          </CardFooter>
        </Card>
        
        {/* Data Management Settings (Placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5"/>Data Management</CardTitle>
            <CardDescription>Manage your financial data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
             <Button variant="outline" className="w-full justify-start" disabled>Export Transaction Data (CSV)</Button>
             <Button variant="outline" className="w-full justify-start" disabled>Export Budget Data (CSV)</Button>
          </CardContent>
           <CardFooter>
            <p className="text-xs text-muted-foreground">Data export functionality coming soon.</p>
          </CardFooter>
        </Card>

        {/* Security Settings (Placeholder) */}
         <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5"/>Security</CardTitle>
            <CardDescription>Manage account security options.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
             <Button variant="outline" className="w-full justify-start" disabled>Change Password</Button>
             <Button variant="outline" className="w-full justify-start" disabled>Enable Two-Factor Authentication</Button>
          </CardContent>
           <CardFooter>
            <p className="text-xs text-muted-foreground">Advanced security features planned for future updates.</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;