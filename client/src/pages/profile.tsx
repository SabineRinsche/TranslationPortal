import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { subscriptionPlans, memoQLanguages } from "@shared/schema";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, UploadCloud, Camera, Search } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function ProfilePage() {
  const { toast } = useToast();
  
  // Define types for API responses
  interface UserData {
    id: number;
    accountId: number;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    role: string;
    jobTitle?: string;
    phoneNumber?: string;
    profileImageUrl?: string | null;
    preferredLanguages?: string[];
  }
  
  interface AccountData {
    id: number;
    name: string;
    credits: number;
    subscriptionPlan?: string;
    subscriptionStatus?: string;
    subscriptionRenewal?: string;
    users?: UserData[];
  }
  
  // Fetch user data
  const { data: userData, isLoading: isLoadingUser } = useQuery<UserData>({
    queryKey: ['/api/user/profile'],
  });
  
  // Fetch account data
  const { data: accountData, isLoading: isLoadingAccount } = useQuery<AccountData>({
    queryKey: ['/api/account'],
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    jobTitle: '',
    password: '',
    confirmPassword: '',
  });
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Language preferences state
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [languageSearch, setLanguageSearch] = useState('');

  // Update form data when user data is loaded
  React.useEffect(() => {
    if (userData) {
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
        jobTitle: userData.jobTitle || '',
        password: '',
        confirmPassword: '',
      });
      setSelectedLanguages(userData.preferredLanguages || []);
    }
  }, [userData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Update user profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('PATCH', '/api/user/profile', data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "There was a problem updating your profile. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Profile picture upload mutation
  const uploadProfilePictureMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      const response = await fetch('/api/user/profile-picture', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload profile picture');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Refetch user data to update profile image
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been updated successfully.",
      });
      
      // Reset file input
      setSelectedFile(null);
      setUploading(false);
    },
    onError: (error: any) => {
      setUploading(false);
      toast({
        title: "Upload Failed",
        description: error.message || "There was a problem uploading your profile picture. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('PATCH', '/api/user/password', data);
    },
    onSuccess: () => {
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully.",
      });
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }));
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "There was a problem updating your password. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Purchase credits mutation
  const purchaseCreditsMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/account/credits/purchase', data);
    },
    onSuccess: () => {
      toast({
        title: "Credits Purchased",
        description: "Your credits have been added to your account.",
      });
    },
    onError: (error) => {
      toast({
        title: "Purchase Failed",
        description: "There was a problem purchasing credits. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update subscription mutation
  const updateSubscriptionMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/account/subscription', data);
    },
    onSuccess: () => {
      toast({
        title: "Subscription Updated",
        description: "Your subscription has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "There was a problem updating your subscription. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update language preferences mutation
  const updateLanguagePreferencesMutation = useMutation({
    mutationFn: async (preferredLanguages: string[]) => {
      return await apiRequest('PATCH', '/api/user/language-preferences', { preferredLanguages });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      toast({
        title: "Language Preferences Updated",
        description: "Your language preferences have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "There was a problem updating your language preferences. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  // Handle file upload
  const handleFileUpload = () => {
    if (selectedFile) {
      setUploading(true);
      uploadProfilePictureMutation.mutate(selectedFile);
    }
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { password, confirmPassword, ...profileData } = formData;
    updateProfileMutation.mutate(profileData);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }
    updatePasswordMutation.mutate({ password: formData.password });
  };

  const handleCreditPurchase = (amount: number) => {
    purchaseCreditsMutation.mutate({ credits: amount });
  };

  const handleSubscriptionChange = (planId: string) => {
    updateSubscriptionMutation.mutate({ planId });
  };

  // Language preference handlers
  const handleLanguageToggle = (languageValue: string) => {
    setSelectedLanguages(prev => {
      if (prev.includes(languageValue)) {
        return prev.filter(lang => lang !== languageValue);
      } else {
        return [...prev, languageValue];
      }
    });
  };

  const handleSaveLanguagePreferences = () => {
    updateLanguagePreferencesMutation.mutate(selectedLanguages);
  };

  // Filter languages based on search
  const filteredLanguages = memoQLanguages.filter(lang =>
    lang.label.toLowerCase().includes(languageSearch.toLowerCase()) ||
    lang.value.toLowerCase().includes(languageSearch.toLowerCase())
  );

  const isLoading = isLoadingUser || isLoadingAccount;

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">My Details</TabsTrigger>
            <TabsTrigger value="account">My Account</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleProfileSubmit}>
                  <CardContent className="space-y-4">
                    {/* Profile Picture */}
                    <div className="flex flex-col items-center space-y-4 mb-6">
                      {/* Hidden file input */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      
                      {/* Avatar display */}
                      <div className="relative">
                        <Avatar className="h-24 w-24 cursor-pointer" onClick={triggerFileInput}>
                          {userData?.profileImageUrl ? (
                            <AvatarImage src={userData.profileImageUrl} alt={`${userData.firstName} ${userData.lastName}`} />
                          ) : (
                            <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                              {userData ? `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}` : "JD"}
                            </AvatarFallback>
                          )}
                          <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1 rounded-full">
                            <Camera className="h-4 w-4" />
                          </div>
                        </Avatar>
                      </div>
                      
                      {/* File name and upload button */}
                      {selectedFile && (
                        <div className="flex flex-col items-center space-y-2">
                          <div className="text-sm text-muted-foreground flex items-center">
                            <UploadCloud className="h-4 w-4 mr-1" />
                            {selectedFile.name}
                          </div>
                          <Button 
                            type="button" 
                            size="sm" 
                            onClick={handleFileUpload}
                            disabled={uploading || uploadProfilePictureMutation.isPending}
                          >
                            {(uploading || uploadProfilePictureMutation.isPending) && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Upload Photo
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input 
                        id="phoneNumber" 
                        name="phoneNumber"
                        value={formData.phoneNumber || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input 
                        id="jobTitle" 
                        name="jobTitle"
                        value={formData.jobTitle || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                  </CardFooter>
                </form>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>
                    Change your password
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handlePasswordSubmit}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">New Password</Label>
                      <Input 
                        id="password" 
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input 
                        id="confirmPassword" 
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      disabled={updatePasswordMutation.isPending}
                    >
                      {updatePasswordMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Update Password
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="account">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    {accountData?.name} - {accountData?.users?.length || 0} users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Available Credits</h3>
                        <p className="text-muted-foreground">Current balance of translation credits</p>
                      </div>
                      <div className="text-3xl font-bold">{accountData?.credits?.toLocaleString() || 0}</div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Current Plan</h3>
                        <p className="text-muted-foreground">Your subscription tier</p>
                      </div>
                      <div className="font-semibold">
                        {accountData?.subscriptionPlan ? 
                          subscriptionPlans.find(p => p.id === accountData.subscriptionPlan)?.name || accountData?.subscriptionPlan
                          : 'No Plan'
                        }
                      </div>
                    </div>
                    
                    {accountData?.subscriptionRenewal && (
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium">Next Renewal</h3>
                          <p className="text-muted-foreground">Your subscription renewal date</p>
                        </div>
                        <div className="font-semibold">
                          {new Date(accountData.subscriptionRenewal).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Purchase Credits</CardTitle>
                  <CardDescription>
                    Add more translation credits to your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => handleCreditPurchase(10000)}
                      disabled={purchaseCreditsMutation.isPending}
                    >
                      10,000 Credits
                      <span className="block text-sm text-muted-foreground mt-1">£100</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleCreditPurchase(25000)}
                      disabled={purchaseCreditsMutation.isPending}
                    >
                      25,000 Credits
                      <span className="block text-sm text-muted-foreground mt-1">£225</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleCreditPurchase(50000)}
                      disabled={purchaseCreditsMutation.isPending}
                    >
                      50,000 Credits
                      <span className="block text-sm text-muted-foreground mt-1">£400</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Plans</CardTitle>
                  <CardDescription>
                    Choose a plan that works for your needs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {subscriptionPlans.map((plan) => (
                      <Card key={plan.id} className={`hover:border-primary transition-colors ${accountData?.subscriptionPlan === plan.id ? 'border-primary' : ''}`}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                          <div className="flex items-end gap-1">
                            <span className="text-2xl font-bold">£{plan.price}</span>
                            <span className="text-muted-foreground">/month</span>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-sm font-medium mb-2">{plan.credits.toLocaleString()} credits/month</p>
                          <ul className="space-y-1 text-sm">
                            {plan.features.map((feature, i) => (
                              <li key={i} className="flex items-start">
                                <span className="mr-2">✓</span>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                        <CardFooter>
                          <Button 
                            className="w-full" 
                            variant={accountData?.subscriptionPlan === plan.id ? "secondary" : "default"}
                            onClick={() => handleSubscriptionChange(plan.id)}
                            disabled={updateSubscriptionMutation.isPending || accountData?.subscriptionPlan === plan.id}
                          >
                            {accountData?.subscriptionPlan === plan.id ? 'Current Plan' : 'Select Plan'}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Language Settings</CardTitle>
                  <CardDescription>
                    Select the languages you work with. Only selected languages will appear in the translation request interface.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search languages..."
                      value={languageSearch}
                      onChange={(e) => setLanguageSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {selectedLanguages.length} of {memoQLanguages.length} languages selected
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto border rounded-lg p-4">
                    {filteredLanguages.map((language) => (
                      <label 
                        key={language.value}
                        className="flex items-center space-x-3 p-2 rounded hover:bg-muted cursor-pointer"
                      >
                        <Checkbox 
                          checked={selectedLanguages.includes(language.value)}
                          onCheckedChange={() => handleLanguageToggle(language.value)}
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium">{language.label}</span>
                          <span className="text-xs text-muted-foreground ml-2">({language.code})</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  
                  {filteredLanguages.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      No languages found matching your search.
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedLanguages(memoQLanguages.map(l => l.value))}
                      >
                        Select All
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedLanguages([])}
                      >
                        Clear All
                      </Button>
                    </div>
                    <Button 
                      onClick={handleSaveLanguagePreferences}
                      disabled={updateLanguagePreferencesMutation.isPending}
                    >
                      {updateLanguagePreferencesMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}