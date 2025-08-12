import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { memoQLanguages } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import TwoFactorSetup from '@/components/TwoFactorSetup';

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

export default function SettingsPage() {
  const { toast } = useToast();
  
  // Fetch user data
  const { data: userData, isLoading: isLoadingUser } = useQuery<UserData>({
    queryKey: ['/api/user/profile'],
  });
  
  // Language preferences state
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [languageSearch, setLanguageSearch] = useState('');

  // FIGS languages (French, Italian, German, Spanish) as default selection
  const figsLanguages = ['French', 'Italian', 'German', 'Spanish'];

  // Update language selection when user data is loaded
  React.useEffect(() => {
    if (userData) {
      // Set FIGS languages as default if user has no preferences
      setSelectedLanguages(userData.preferredLanguages || figsLanguages);
    }
  }, [userData]);

  // Language preference mutations
  const updateLanguagePreferencesMutation = useMutation({
    mutationFn: async (languages: string[]) => {
      return await apiRequest('PATCH', '/api/user/language-preferences', {
        preferredLanguages: languages
      });
    },
    onSuccess: () => {
      toast({
        title: "Language Preferences Updated",
        description: "Your language preferences have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "There was a problem updating your language preferences. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleLanguageToggle = (language: string) => {
    setSelectedLanguages(prev => 
      prev.includes(language) 
        ? prev.filter(l => l !== language)
        : [...prev, language]
    );
  };

  const handleSaveLanguagePreferences = () => {
    updateLanguagePreferencesMutation.mutate(selectedLanguages);
  };

  // Filter languages based on search
  const filteredLanguages = memoQLanguages.filter(language =>
    language.label.toLowerCase().includes(languageSearch.toLowerCase()) ||
    language.code.toLowerCase().includes(languageSearch.toLowerCase())
  );

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your application preferences and configurations.
          </p>
        </div>

        <div className="space-y-6">
          {/* Language Preferences Card */}
          <Card>
            <CardHeader>
              <CardTitle>Language Preferences</CardTitle>
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
                      {language.targetOnly && (
                        <span className="text-xs text-orange-600 ml-2">[Target only]</span>
                      )}
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedLanguages(figsLanguages)}
                  >
                    FIGS Only
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

          {/* Two-Factor Authentication */}
          <TwoFactorSetup />

          {/* Additional Settings Sections can be added here in the future */}
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Additional application settings will be available here in future updates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">More settings options coming soon...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}