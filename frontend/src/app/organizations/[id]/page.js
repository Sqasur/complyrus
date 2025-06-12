"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import withAuth from "@/components/withAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  Users,
  UserPlus,
  Settings,
  Folder,
  FileText,
  Plus,
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import Link from "next/link";

function OrganizationDetailsPage() {
  const params = useParams();
  const orgId = params.id;

  const [organization, setOrganization] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [createTeamDialogOpen, setCreateTeamDialogOpen] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: "",
    role: "employee",
  });
  const [newTeam, setNewTeam] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (orgId) {
      fetchOrganization();
      fetchTeams();
    }
  }, [orgId]);

  const fetchOrganization = async () => {
    try {
      const response = await api.get(`/organizations/${orgId}`);
      if (response.data.success) {
        setOrganization(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch organization:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await api.get(`/organizations/${orgId}/teams`);
      if (response.data.success) {
        setTeams(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    }
  };

  const handleInviteUser = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(
        `/organizations/${orgId}/invite`,
        inviteData
      );
      if (response.data.success) {
        // Refresh organization data
        fetchOrganization();
        setInviteData({ email: "", role: "employee" });
        setInviteDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to invite user:", error);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`/organizations/${orgId}/teams`, newTeam);
      if (response.data.success) {
        setTeams([...teams, response.data.data]);
        setNewTeam({ name: "", description: "" });
        setCreateTeamDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to create team:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "orgOwner":
        return "bg-red-100 text-red-800";
      case "orgAdmin":
        return "bg-blue-100 text-blue-800";
      case "teamLeader":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!organization) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold">Organization not found</h3>
          <p className="text-muted-foreground">
            The organization you're looking for doesn't exist or you don't have
            access to it.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Building2 className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">{organization.name}</h1>
            </div>
            <p className="text-muted-foreground">
              {organization.description || "No description provided"}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button asChild variant="outline">
              <Link href={`/organizations/${orgId}/settings`}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Members
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {organization.users?.length || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Teams</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teams.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <Badge
                    variant={
                      organization.organizationStatus === "active"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {organization.organizationStatus}
                  </Badge>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Created</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    {formatDate(organization.createdAt)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Organization Members</h3>
              <Dialog
                open={inviteDialogOpen}
                onOpenChange={setInviteDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleInviteUser}>
                    <DialogHeader>
                      <DialogTitle>Invite New Member</DialogTitle>
                      <DialogDescription>
                        Send an invitation to join this organization.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={inviteData.email}
                          onChange={(e) =>
                            setInviteData({
                              ...inviteData,
                              email: e.target.value,
                            })
                          }
                          placeholder="Enter email address"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                          value={inviteData.role}
                          onValueChange={(value) =>
                            setInviteData({ ...inviteData, role: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employee">Employee</SelectItem>
                            <SelectItem value="teamLeader">
                              Team Leader
                            </SelectItem>
                            <SelectItem value="orgAdmin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setInviteDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Send Invitation</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organization.users?.map((member) => (
                    <TableRow key={member.userId._id || member.userId}>
                      <TableCell>
                        <div className="font-medium">
                          {member.userId.firstName} {member.userId.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          @{member.userId.username}
                        </div>
                      </TableCell>
                      <TableCell>{member.userId.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(member.roles[0])}>
                          {member.roles[0]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(member.userId.createdAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>Change Role</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Remove from Organization
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Teams</h3>
              <Dialog
                open={createTeamDialogOpen}
                onOpenChange={setCreateTeamDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Team
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleCreateTeam}>
                    <DialogHeader>
                      <DialogTitle>Create New Team</DialogTitle>
                      <DialogDescription>
                        Create a new team within this organization.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="teamName">Team Name</Label>
                        <Input
                          id="teamName"
                          value={newTeam.name}
                          onChange={(e) =>
                            setNewTeam({ ...newTeam, name: e.target.value })
                          }
                          placeholder="Enter team name"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="teamDescription">Description</Label>
                        <Textarea
                          id="teamDescription"
                          value={newTeam.description}
                          onChange={(e) =>
                            setNewTeam({
                              ...newTeam,
                              description: e.target.value,
                            })
                          }
                          placeholder="Enter team description"
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCreateTeamDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Create Team</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teams.map((team) => (
                <Card
                  key={team._id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                    <CardDescription>
                      {team.description || "No description provided"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{team.members?.length || 0} members</span>
                        <span>Created {formatDate(team.createdAt)}</span>
                      </div>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Link href={`/teams/${team._id}`}>View Team</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {teams.length === 0 && (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No teams</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get started by creating a new team.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">
                Document management coming soon
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Document management features will be available in the next
                update.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

export default withAuth(OrganizationDetailsPage);
