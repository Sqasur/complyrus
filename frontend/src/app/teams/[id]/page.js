"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  UserPlus,
  Settings,
  Folder,
  FileText,
  MoreHorizontal,
  ArrowLeft,
  Building2,
  Calendar,
  Mail,
  Plus,
} from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

function TeamDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.id;

  const [team, setTeam] = useState(null);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [newMember, setNewMember] = useState({
    userId: "",
    role: "employee",
  });
  useEffect(() => {
    if (teamId) {
      fetchTeam();
      fetchFolders();
    }
  }, [teamId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTeam = async () => {
    try {
      const response = await api.get(`/teams/${teamId}`);
      if (response.data.success) {
        setTeam(response.data.data);
        // Fetch available users from the organization
        if (response.data.data.organizationId) {
          fetchAvailableUsers(
            response.data.data.organizationId._id ||
              response.data.data.organizationId
          );
        }
      }
    } catch (error) {
      console.error("Failed to fetch team:", error);
      if (error.response?.status === 404) {
        router.push("/teams");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async (orgId) => {
    try {
      const response = await api.get(`/organizations/${orgId}`);
      if (response.data.success) {
        // Get users who are not already team members
        const orgUsers = response.data.data.users || [];
        const teamMemberIds =
          team?.members?.map((m) => m.userId._id || m.userId) || [];
        const available = orgUsers.filter(
          (user) => !teamMemberIds.includes(user.userId._id || user.userId)
        );
        setAvailableUsers(available);
      }
    } catch (error) {
      console.error("Failed to fetch available users:", error);
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await api.get(`/teams/${teamId}/folders`);
      if (response.data.success) {
        setFolders(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch folders:", error);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`/teams/${teamId}/members`, newMember);
      if (response.data.success) {
        // Refresh team data
        fetchTeam();
        setNewMember({ userId: "", role: "employee" });
        setAddMemberDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to add member:", error);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      const response = await api.delete(`/teams/${teamId}/members/${userId}`);
      if (response.data.success) {
        fetchTeam();
      }
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "teamLeader":
        return "bg-blue-100 text-blue-800";
      case "employee":
        return "bg-gray-100 text-gray-800";
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

  if (!team) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold">Team not found</h3>
          <p className="text-muted-foreground">
            The team you're looking for doesn't exist or you don't have access
            to it.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/teams">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <Users className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">{team.name}</h1>
            </div>
            <p className="text-muted-foreground">
              {team.description || "No description provided"}
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Building2 className="h-4 w-4" />
                <span>
                  {team.organizationId?.name || "Unknown Organization"}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Created {formatDate(team.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button asChild variant="outline">
              <Link href={`/teams/${teamId}/settings`}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Team Members
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {team.members?.length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Document Folders
              </CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{folders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Leader</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {team.createdBy
                  ? `${team.createdBy.firstName} ${team.createdBy.lastName}`
                  : "Unknown"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="members" className="space-y-6">
          <TabsList>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="folders">Document Folders</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Team Members</h3>
              <Dialog
                open={addMemberDialogOpen}
                onOpenChange={setAddMemberDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleAddMember}>
                    <DialogHeader>
                      <DialogTitle>Add Team Member</DialogTitle>
                      <DialogDescription>
                        Add a new member to this team from your organization.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="user">Select User</Label>
                        <Select
                          value={newMember.userId}
                          onValueChange={(value) =>
                            setNewMember({ ...newMember, userId: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a user..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableUsers.map((user) => (
                              <SelectItem
                                key={user.userId._id || user.userId}
                                value={user.userId._id || user.userId}
                              >
                                {user.userId.firstName} {user.userId.lastName} (
                                {user.userId.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                          value={newMember.role}
                          onValueChange={(value) =>
                            setNewMember({ ...newMember, role: value })
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
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setAddMemberDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={!newMember.userId}>
                        Add Member
                      </Button>
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
                  {team.members?.map((member) => (
                    <TableRow key={member.userId._id || member.userId}>
                      <TableCell>
                        <div className="font-medium">
                          {member.userId.firstName} {member.userId.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          @{member.userId.username}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{member.userId.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(member.role)}>
                          {member.role}
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
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() =>
                                handleRemoveMember(
                                  member.userId._id || member.userId
                                )
                              }
                            >
                              Remove from Team
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

          {/* Folders Tab */}
          <TabsContent value="folders" className="space-y-6">
            {" "}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Document Folders</h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Folder
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target);
                      try {
                        const response = await api.post(
                          `/teams/${teamId}/folders`,
                          {
                            name: formData.get("name"),
                            description: formData.get("description"),
                          }
                        );
                        if (response.data.success) {
                          fetchFolders();
                          e.target.reset();
                        }
                      } catch (error) {
                        console.error("Failed to create folder:", error);
                      }
                    }}
                  >
                    <DialogHeader>
                      <DialogTitle>Create New Folder</DialogTitle>
                      <DialogDescription>
                        Create a new document folder for this team.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="folder-name">Folder Name</Label>
                        <Input
                          id="folder-name"
                          name="name"
                          placeholder="Enter folder name"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="folder-description">Description</Label>
                        <Input
                          id="folder-description"
                          name="description"
                          placeholder="Enter folder description (optional)"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Create Folder</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            {folders.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {folders.map((folder) => (
                  <Card
                    key={folder._id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <Folder className="h-5 w-5 text-primary" />
                        <span>{folder.name}</span>
                      </CardTitle>
                      <CardDescription>
                        {folder.description || "No description provided"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          Created {formatDate(folder.createdAt)}
                        </div>
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Link href={`/folders/${folder._id}`}>
                            <FileText className="mr-2 h-4 w-4" />
                            View Documents
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Folder className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No folders</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get started by creating a document folder for this team.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">
                Activity tracking coming soon
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Team activity and audit logs will be available in a future
                update.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

export default withAuth(TeamDetailsPage);
