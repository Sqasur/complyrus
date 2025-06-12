"use client";

import { useState, useEffect } from "react";
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
  Users,
  Plus,
  Building2,
  Settings,
  Eye,
  Calendar,
  User,
} from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState("");
  const [newTeam, setNewTeam] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch organizations first
      const orgsResponse = await api.get("/organizations");
      if (orgsResponse.data.success) {
        setOrganizations(orgsResponse.data.data);
        if (orgsResponse.data.data.length > 0) {
          setSelectedOrg(orgsResponse.data.data[0]._id);
          fetchTeams(orgsResponse.data.data[0]._id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async (orgId) => {
    if (!orgId) return;
    try {
      const response = await api.get(`/organizations/${orgId}/teams`);
      if (response.data.success) {
        setTeams(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    }
  };

  const handleOrgChange = (orgId) => {
    setSelectedOrg(orgId);
    fetchTeams(orgId);
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!selectedOrg) return;

    try {
      const response = await api.post(
        `/organizations/${selectedOrg}/teams`,
        newTeam
      );
      if (response.data.success) {
        setTeams([...teams, response.data.data]);
        setNewTeam({ name: "", description: "" });
        setCreateDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to create team:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const selectedOrgData = organizations.find((org) => org._id === selectedOrg);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Teams</h1>
            <p className="text-muted-foreground">
              Manage teams across your organizations
            </p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedOrg}>
                <Plus className="mr-2 h-4 w-4" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateTeam}>
                <DialogHeader>
                  <DialogTitle>Create New Team</DialogTitle>
                  <DialogDescription>
                    Create a new team in {selectedOrgData?.name}.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Team Name</Label>
                    <Input
                      id="name"
                      value={newTeam.name}
                      onChange={(e) =>
                        setNewTeam({ ...newTeam, name: e.target.value })
                      }
                      placeholder="Enter team name"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newTeam.description}
                      onChange={(e) =>
                        setNewTeam({ ...newTeam, description: e.target.value })
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
                    onClick={() => setCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Team</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Organization Selector */}
        {organizations.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Organization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {organizations.map((org) => (
                  <Button
                    key={org._id}
                    variant={selectedOrg === org._id ? "default" : "outline"}
                    onClick={() => handleOrgChange(org._id)}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    {org.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Teams Grid */}
        {selectedOrg && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Teams in {selectedOrgData?.name}
              </h2>
              <Badge variant="secondary">{teams.length} teams</Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {teams.map((team) => (
                <Card
                  key={team._id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {team.description || "No description provided"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Stats */}
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{team.members?.length || 0} members</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(team.createdAt)}</span>
                        </div>
                      </div>

                      {/* Team Leader */}
                      {team.createdBy && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            Leader:{" "}
                          </span>
                          <span className="font-medium">
                            {team.createdBy.firstName} {team.createdBy.lastName}
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Link href={`/teams/${team._id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Link href={`/teams/${team._id}/settings`}>
                            <Settings className="mr-2 h-4 w-4" />
                            Manage
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {teams.length === 0 && selectedOrg && (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  No teams
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get started by creating a new team in this organization.
                </p>
              </div>
            )}
          </div>
        )}

        {organizations.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              No organizations
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              You need to be part of an organization to create teams.
            </p>
            <Button asChild className="mt-4">
              <Link href="/organizations">View Organizations</Link>
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default withAuth(TeamsPage);
