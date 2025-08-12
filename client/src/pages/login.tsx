import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loginSchema, type LoginForm } from "@shared/schema";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle, Shield } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string>("");
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      twoFactorCode: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setError("");
      const result = await login(data.email, data.password, data.twoFactorCode);
      
      if (result.success) {
        setLocation("/");
      } else if (result.requiresTwoFactor) {
        setRequiresTwoFactor(true);
        setError("");
      } else {
        setError(result.message || "Login failed");
        setRequiresTwoFactor(false);
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
      setRequiresTwoFactor(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your Alpha Translation Portal account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {requiresTwoFactor && (
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Two-factor authentication is enabled. Please enter your verification code.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="john@example.com"
                disabled={requiresTwoFactor}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...form.register("password")}
                placeholder="Your password"
                disabled={requiresTwoFactor}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
              )}
            </div>

            {requiresTwoFactor && (
              <div className="space-y-2">
                <Label htmlFor="twoFactorCode">Two-Factor Code</Label>
                <Input
                  id="twoFactorCode"
                  {...form.register("twoFactorCode")}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  autoFocus
                />
                {form.formState.errors.twoFactorCode && (
                  <p className="text-sm text-red-500">{form.formState.errors.twoFactorCode.message}</p>
                )}
              </div>
            )}

            <Button type="submit" className="w-full">
              {requiresTwoFactor ? "Verify & Sign In" : "Sign In"}
            </Button>

            {!requiresTwoFactor && (
              <>
                <div className="text-center">
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot your password?
                  </Link>
                </div>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Don't have an account? </span>
                  <Link href="/register" className="text-primary hover:underline">
                    Create one
                  </Link>
                </div>
              </>
            )}

            {requiresTwoFactor && (
              <div className="text-center">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setRequiresTwoFactor(false);
                    form.reset();
                  }}
                >
                  Use different account
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}