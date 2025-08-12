import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  CreditCard, 
  Shield, 
  ShieldCheck, 
  UserCheck,
  AlertCircle,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: number;
  accountId: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: string;
  jobTitle?: string;
  phoneNumber?: string;
  preferredLanguages: string[];
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLogin?: string;
  createdAt: string;
}

interface Account {
  id: number;
  name: string;
  credits: number;
  subscriptionPlan: string;
  subscriptionStatus: string;
  createdAt: string;
}

interface CreditTransaction {
  id: number;
  accountId: number;
  userId?: number;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
  user?: Pick<User, 'firstName' | 'lastName' | 'email'>;
}

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false);
  
  // Only allow admins to access this page
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Access denied. Admin privileges required to view user management.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Fetch all users in the same account
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });

  // Fetch account information
  const { data: account } = useQuery<Account>({
    queryKey: ['/api/admin/account'],
  });

  // Fetch credit transactions
  const { data: creditTransactions = [] } = useQuery<CreditTransaction[]>({
    queryKey: ['/api/admin/credit-transactions'],
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      return await apiRequest('POST', '/api/admin/users', userData);
    },
    onSuccess: () => {
      toast({
        title: "User Created",
        description: "New user has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setIsAddUserOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create User",
        description: error.message || "There was an error creating the user.",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, userData }: { userId: number; userData: any }) => {
      return await apiRequest('PATCH', `/api/admin/users/${userId}`, userData);
    },
    onSuccess: () => {
      toast({
        title: "User Updated",
        description: "User information has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update User",
        description: error.message || "There was an error updating the user.",
        variant: "destructive",
      });
    },
  });

  // Add credits mutation
  const addCreditsMutation = useMutation({
    mutationFn: async ({ amount, description }: { amount: number; description: string }) => {
      return await apiRequest('POST', '/api/admin/credits', { amount, description });
    },
    onSuccess: () => {
      toast({
        title: "Credits Added",
        description: "Credits have been successfully added to the account.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/account'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/credit-transactions'] });
      setIsCreditDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Credits",
        description: error.message || "There was an error adding credits.",
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users.filter(user =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'client': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8" />
            User Management
          </h1>
          <p className="text-muted-foreground">
            Manage users and credits for {account?.name || 'your organization'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isCreditDialogOpen} onOpenChange={setIsCreditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <CreditCard className="w-4 h-4 mr-2" />
                Manage Credits
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Credits</DialogTitle>
                <DialogDescription>
                  Add credits to the account. Current balance: {account?.credits || 0} credits
                </DialogDescription>
              </DialogHeader>
              <CreditForm onSubmit={addCreditsMutation.mutate} isLoading={addCreditsMutation.isPending} />
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account for your team
                </DialogDescription>
              </DialogHeader>
              <UserForm onSubmit={createUserMutation.mutate} isLoading={createUserMutation.isPending} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="credits">Credit History</TabsTrigger>
          <TabsTrigger value="account">Account Details</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    Manage users in your organization
                  </CardDescription>
                </div>
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            @{user.username}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.isEmailVerified ? (
                            <Badge variant="secondary" className="text-green-600">
                              <UserCheck className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              Unverified
                            </Badge>
                          )}
                          {user.twoFactorEnabled && (
                            <Badge variant="outline" className="text-blue-600">
                              <ShieldCheck className="w-3 h-3 mr-1" />
                              2FA
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Credit Transaction History</CardTitle>
              <CardDescription>
                Track credit usage and additions for your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creditTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                      <TableCell>
                        {transaction.user 
                          ? `${transaction.user.firstName} ${transaction.user.lastName}`
                          : 'System'
                        }
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={transaction.amount > 0 ? 'secondary' : 'outline'}
                        >
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          {account && (
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Overview of your organization's account
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Organization Name</Label>
                  <p className="text-lg font-medium">{account.name}</p>
                </div>
                <div>
                  <Label>Account Created</Label>
                  <p className="text-lg">{formatDate(account.createdAt)}</p>
                </div>
                <div>
                  <Label>Subscription Plan</Label>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {account.subscriptionPlan}
                  </Badge>
                </div>
                <div>
                  <Label>Available Credits</Label>
                  <p className="text-lg font-bold text-green-600">
                    {account.credits.toLocaleString()} credits
                  </p>
                </div>
                <div>
                  <Label>Subscription Status</Label>
                  <Badge variant={account.subscriptionStatus === 'active' ? 'secondary' : 'destructive'}>
                    {account.subscriptionStatus}
                  </Badge>
                </div>
                <div>
                  <Label>Total Users</Label>
                  <p className="text-lg font-medium">{users.length}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User: {selectedUser.firstName} {selectedUser.lastName}</DialogTitle>
              <DialogDescription>
                Update user information and permissions
              </DialogDescription>
            </DialogHeader>
            <UserForm 
              user={selectedUser}
              onSubmit={(data) => updateUserMutation.mutate({ userId: selectedUser.id, userData: data })}
              isLoading={updateUserMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// User Form Component
function UserForm({ user, onSubmit, isLoading }: { user?: User; onSubmit: (data: any) => void; isLoading: boolean }) {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    username: user?.username || '',
    role: user?.role || 'client',
    jobTitle: user?.jobTitle || '',
    phoneNumber: user?.phoneNumber || '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...formData };
    if (!data.password) {
      const { password, ...dataWithoutPassword } = data;
      onSubmit(dataWithoutPassword);
    } else {
      onSubmit(data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="role">Role</Label>
        <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="client">Client</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="jobTitle">Job Title</Label>
        <Input
          id="jobTitle"
          value={formData.jobTitle}
          onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
        />
      </div>
      
      <div>
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
        />
      </div>
      
      {!user && (
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!user}
            placeholder={user ? 'Leave empty to keep current password' : ''}
          />
        </div>
      )}
      
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Saving...' : user ? 'Update User' : 'Create User'}
      </Button>
    </form>
  );
}

// Credit Form Component
function CreditForm({ onSubmit, isLoading }: { onSubmit: (data: any) => void; isLoading: boolean }) {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      amount: parseInt(formData.amount),
      description: formData.description || `Admin added ${formData.amount} credits`,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="amount">Credit Amount</Label>
        <Input
          id="amount"
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          placeholder="Enter number of credits to add"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Reason for adding credits (optional)"
        />
      </div>
      
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Adding Credits...' : 'Add Credits'}
      </Button>
    </form>
  );
}