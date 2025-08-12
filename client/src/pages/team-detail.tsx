import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { 
  Users, 
  ArrowLeft, 
  CreditCard, 
  Plus,
  Crown,
  Mail,
  Calendar,
  Building2,
  TrendingUp
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";

// Types
interface Team {
  id: number;
  name: string;
  description?: string;
  credits: number;
  subscriptionPlan: string;
  subscriptionStatus: string;
  billingEmail?: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: number;
  accountId: number;
  teamId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'client';
  isActive: boolean;
  createdAt: string;
}

interface CreditTransaction {
  id: number;
  accountId: number;
  amount: number;
  type: string;
  description?: string;
  createdAt: string;
}

const TeamDetailPage: React.FC = () => {
  const { teamId } = useParams();
  const [, setLocation] = useLocation();
  const [isAddCreditsOpen, setIsAddCreditsOpen] = useState(false);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditDescription, setCreditDescription] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch team details
  const { data: team, isLoading: teamLoading } = useQuery<Team>({
    queryKey: [`/api/admin/teams/${teamId}`],
    enabled: !!teamId,
  });

  // Fetch team users
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  // Fetch credit transactions
  const { data: creditTransactions = [], isLoading: creditsLoading } = useQuery<CreditTransaction[]>({
    queryKey: ["/api/admin/credit-transactions"],
  });

  // Filter users for this team
  const teamUsers = users.filter(user => user.teamId === parseInt(teamId || "0"));

  // Add credits mutation
  const addCreditsMutation = useMutation({
    mutationFn: async (data: { amount: number; description?: string }) => {
      return await apiRequest(`/api/admin/teams/${teamId}/credits`, "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/teams/${teamId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/credit-transactions"] });
      setIsAddCreditsOpen(false);
      setCreditAmount("");
      setCreditDescription("");
      toast({
        title: "Success",
        description: "Credits added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add credits",
        variant: "destructive",
      });
    },
  });

  const handleAddCredits = () => {
    const amount = parseInt(creditAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid credit amount",
        variant: "destructive",
      });
      return;
    }
    
    addCreditsMutation.mutate({
      amount,
      description: creditDescription || undefined,
    });
  };

  if (teamLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">Loading team details...</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">Team not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setLocation("/teams")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Teams
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">{team.name}</h1>
        {team.description && (
          <p className="text-muted-foreground">{team.description}</p>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Credits</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{team.credits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Current balance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              Active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{team.subscriptionPlan}</div>
            <p className="text-xs text-muted-foreground">
              <Badge variant={team.subscriptionStatus === 'active' ? 'default' : 'secondary'} className="text-xs">
                {team.subscriptionStatus}
              </Badge>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Team Members</TabsTrigger>
          <TabsTrigger value="credits">Credit Usage</TabsTrigger>
          <TabsTrigger value="account">Account Details</TabsTrigger>
        </TabsList>

        {/* Team Members Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members ({teamUsers.length})
              </CardTitle>
              <CardDescription>
                Users assigned to this team
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="text-center py-8">Loading users...</div>
              ) : teamUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No users assigned to this team</p>
                  <p className="text-sm">Users can be assigned through User Management</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? 'default' : 'destructive'}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(user.createdAt), "MMM d, yyyy")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credit Usage Tab */}
        <TabsContent value="credits" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Credit Transactions
                  </CardTitle>
                  <CardDescription>
                    Credit usage and purchases for this team
                  </CardDescription>
                </div>
                <Button onClick={() => setIsAddCreditsOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Credits
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {creditsLoading ? (
                <div className="text-center py-8">Loading transactions...</div>
              ) : creditTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No credit transactions found</p>
                  <p className="text-sm">Credit usage will appear here</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {creditTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <span className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{transaction.type}</Badge>
                        </TableCell>
                        <TableCell>{transaction.description || '—'}</TableCell>
                        <TableCell>
                          {format(new Date(transaction.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Details Tab */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                Subscription and billing details for this team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium">Team Name</Label>
                    <p className="text-lg">{team.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Current Credits</Label>
                    <p className="text-lg">{team.credits.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Subscription Plan</Label>
                    <p className="text-lg capitalize">{team.subscriptionPlan}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Subscription Status</Label>
                    <Badge variant={team.subscriptionStatus === 'active' ? 'default' : 'secondary'}>
                      {team.subscriptionStatus}
                    </Badge>
                  </div>
                  {team.billingEmail && (
                    <div>
                      <Label className="text-sm font-medium">Billing Email</Label>
                      <p className="text-lg flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {team.billingEmail}
                      </p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium">Team Created</Label>
                    <p className="text-lg flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(team.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Credits Dialog */}
      <Dialog open={isAddCreditsOpen} onOpenChange={setIsAddCreditsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Credits</DialogTitle>
            <DialogDescription>
              Add credits to {team.name}'s account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Credit Amount *</Label>
              <Input
                id="amount"
                type="number"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                placeholder="Enter number of credits to add"
              />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={creditDescription}
                onChange={(e) => setCreditDescription(e.target.value)}
                placeholder="Reason for adding credits"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCreditsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddCredits} 
              disabled={addCreditsMutation.isPending}
            >
              {addCreditsMutation.isPending ? "Adding..." : "Add Credits"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamDetailPage;