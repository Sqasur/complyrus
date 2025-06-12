// filepath: frontend/src/app/teams/[id]/settings/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import withAuth from "@/components/withAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Settings,
  Users,
  Trash2,
  Save,
  AlertTriangle,
} from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

function TeamSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.id;

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (teamId) {
      fetchTeam();
    }
  }, [teamId]);

  const fetchTeam = async () => {
    try {
      const response = await api.get(`/teams/${teamId}`);
      if (response.data.success) {
        const teamData = response.data.data;
        setTeam(teamData);
        setFormData({
          name: teamData.name || "",
          description: teamData.description || "",
        });
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await api.put(`/teams/${teamId}`, formData);
      if (response.data.success) {
        setTeam(response.data.data);
        // Show success message or redirect
        router.push(`/teams/${teamId}`);
      }
    } catch (error) {
      console.error("Failed to update team:", error);
      // Show error message
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTeam = async () => {
    try {
      const response = await api.delete(`/teams/${teamId}`);
      if (response.data.success) {
        router.push("/teams");
      }
    } catch (error) {
      console.error("Failed to delete team:", error);
      // Show error message
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
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
            The team you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have access to it.
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
                <Link href={`/teams/${teamId}`}>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <Settings className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Team Settings</h1>
            </div>
            <p className="text-muted-foreground">
              Manage your team&apos;s information and settings
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Update your team&apos;s basic information and settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Team Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter team name"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter team description"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={saving}>
                      <Save className="mr-2 h-4 w-4" />
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible and destructive actions for this team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-red-600">
                        Delete Team
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete this team and all its data. This
                        action cannot be undone.
                      </p>
                    </div>
                    <Dialog
                      open={deleteDialogOpen}
                      onOpenChange={setDeleteDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Team
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <span>Delete Team</span>
                          </DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete &quot;{team.name}
                            &quot;? This action cannot be undone. All team
                            members, folders, and documents will be permanently
                            removed.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleDeleteTeam}
                          >
                            Delete Team
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Team Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Team Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Members</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {team.members?.length || 0}
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Organization</h4>
                  <p className="text-sm text-muted-foreground">
                    {team.organizationId?.name || "Unknown"}
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Created</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(team.createdAt)}
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Created By</h4>
                  <p className="text-sm text-muted-foreground">
                    {team.createdBy
                      ? `${team.createdBy.firstName} ${team.createdBy.lastName}`
                      : "Unknown"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Link href={`/teams/${teamId}`}>
                    <Users className="mr-2 h-4 w-4" />
                    View Team Details
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Link href="/teams">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Teams
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default withAuth(TeamSettingsPage);
