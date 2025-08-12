import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { twoFactorSetupSchema, type TwoFactorSetupForm } from "@shared/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Shield, QrCode, AlertCircle, CheckCircle, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function TwoFactorSetup() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [qrCodeData, setQrCodeData] = useState<{ secret: string; qrCode: string } | null>(null);
  const [isSetupMode, setIsSetupMode] = useState(false);

  const form = useForm<TwoFactorSetupForm>({
    resolver: zodResolver(twoFactorSetupSchema),
    defaultValues: {
      secret: "",
      token: "",
    },
  });

  // Setup 2FA mutation
  const setupMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to setup 2FA');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setQrCodeData(data);
      form.setValue('secret', data.secret);
      setIsSetupMode(true);
    },
    onError: (error: any) => {
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to setup two-factor authentication",
        variant: "destructive",
      });
    },
  });

  // Verify 2FA setup mutation
  const verifyMutation = useMutation({
    mutationFn: async (data: TwoFactorSetupForm) => {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to verify 2FA');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Two-Factor Authentication Enabled",
        description: "Your account is now protected with 2FA",
      });
      setIsSetupMode(false);
      setQrCodeData(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
    },
  });

  // Disable 2FA mutation
  const disableMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to disable 2FA');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Two-Factor Authentication Disabled",
        description: "2FA has been removed from your account",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Disable 2FA",
        description: error.message || "Could not disable two-factor authentication",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TwoFactorSetupForm) => {
    verifyMutation.mutate(data);
  };

  const handleStartSetup = () => {
    setupMutation.mutate();
  };

  const handleCancelSetup = () => {
    setIsSetupMode(false);
    setQrCodeData(null);
    form.reset();
  };

  const handleDisable2FA = () => {
    if (window.confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      disableMutation.mutate();
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          <CardTitle>Two-Factor Authentication</CardTitle>
        </div>
        <CardDescription>
          Add an extra layer of security to your account with two-factor authentication.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {user.twoFactorEnabled ? (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Two-factor authentication is enabled for your account.
              </AlertDescription>
            </Alert>
            
            <Button 
              variant="destructive" 
              onClick={handleDisable2FA}
              disabled={disableMutation.isPending}
            >
              {disableMutation.isPending ? "Disabling..." : "Disable 2FA"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {!isSetupMode ? (
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Two-factor authentication is not enabled. Enable it to add an extra layer of security.
                  </AlertDescription>
                </Alert>
                
                <Button 
                  onClick={handleStartSetup}
                  disabled={setupMutation.isPending}
                >
                  {setupMutation.isPending ? "Setting up..." : "Enable 2FA"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <QrCode className="h-4 w-4" />
                  <AlertDescription>
                    Scan the QR code below with your authenticator app, then enter the 6-digit code to complete setup.
                  </AlertDescription>
                </Alert>

                {qrCodeData && (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <img 
                        src={qrCodeData.qrCode} 
                        alt="QR Code for 2FA setup" 
                        className="border rounded-lg"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Manual Entry Key</Label>
                      <Input 
                        value={qrCodeData.secret} 
                        readOnly 
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Use this key if you can't scan the QR code
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="token">Verification Code</Label>
                    <Input
                      id="token"
                      {...form.register("token")}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                    />
                    {form.formState.errors.token && (
                      <p className="text-sm text-red-500">{form.formState.errors.token.message}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      disabled={verifyMutation.isPending}
                    >
                      {verifyMutation.isPending ? "Verifying..." : "Verify & Enable"}
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCancelSetup}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}