"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
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
  Building2,
  Plus,
  Users,
  Settings,
  Trash2,
  Edit,
  Eye,
} from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

function OrganizationsPage() {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newOrg, setNewOrg] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await api.get("/organizations");
      if (response.data.success) {
        setOrganizations(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganization = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/organizations", newOrg);
      if (response.data.success) {
        setOrganizations([...organizations, response.data.data]);
        setNewOrg({ name: "", description: "" });
        setCreateDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to create organization:", error);
    }
  };

  const getUserRole = (organization) => {
    const userInOrg = organization.users?.find(
      (u) => u.userId === user?._id || u.userId?._id === user?._id
    );
    return userInOrg?.roles?.[0] || "member";
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Organizations</h1>
            <p className="text-muted-foreground">
              Manage your organizations and their settings
            </p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Organization
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateOrganization}>
                <DialogHeader>
                  <DialogTitle>Create New Organization</DialogTitle>
                  <DialogDescription>
                    Create a new organization to manage compliance programs and
                    teams.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Organization Name</Label>
                    <Input
                      id="name"
                      value={newOrg.name}
                      onChange={(e) =>
                        setNewOrg({ ...newOrg, name: e.target.value })
                      }
                      placeholder="Enter organization name"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newOrg.description}
                      onChange={(e) =>
                        setNewOrg({ ...newOrg, description: e.target.value })
                      }
                      placeholder="Enter organization description"
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
                  <Button type="submit">Create Organization</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Organizations Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <Card key={org._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{org.name}</CardTitle>
                  </div>
                  <Badge variant="secondary">{getUserRole(org)}</Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {org.description || "No description provided"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Stats */}
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{org.users?.length || 0} members</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Building2 className="h-4 w-4" />
                      <span>{org.teams?.length || 0} teams</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Link href={`/organizations/${org._id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </Button>
                    {(getUserRole(org) === "orgOwner" ||
                      getUserRole(org) === "orgAdmin") && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Link href={`/organizations/${org._id}/settings`}>
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {organizations.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              No organizations
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by creating a new organization.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default withAuth(OrganizationsPage);
