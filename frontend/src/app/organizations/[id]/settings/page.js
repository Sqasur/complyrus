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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Building2, Settings, Trash2, Save, ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

function OrganizationSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.id;

  const [organization, setOrganization] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    organizationStatus: "active",
    settings: {
      dataRetentionPeriod: 365,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (orgId) {
      fetchOrganization();
    }
  }, [orgId]);

  const fetchOrganization = async () => {
    try {
      const response = await api.get(`/organizations/${orgId}`);
      if (response.data.success) {
        const org = response.data.data;
        setOrganization(org);
        setFormData({
          name: org.name,
          description: org.description || "",
          organizationStatus: org.organizationStatus,
          settings: {
            dataRetentionPeriod: org.settings?.dataRetentionPeriod || 365,
          },
        });
      }
    } catch (error) {
      console.error("Failed to fetch organization:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.patch(`/organizations/${orgId}`, formData);
      if (response.data.success) {
        setOrganization(response.data.data);
        // Show success message (you can add a toast here)
        console.log("Organization updated successfully");
      }
    } catch (error) {
      console.error("Failed to update organization:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await api.delete(`/organizations/${orgId}`);
      if (response.data.success) {
        router.push("/organizations");
      }
    } catch (error) {
      console.error("Failed to delete organization:", error);
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
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Button asChild variant="ghost" size="sm">
                <Link href={`/organizations/${orgId}`}>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <Settings className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Organization Settings</h1>
            </div>
            <p className="text-muted-foreground">
              Manage settings for {organization.name}
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="danger">Danger Zone</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Update your organization's basic information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Organization Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter organization name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter organization description"
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.organizationStatus}
                    onValueChange={(value) =>
                      setFormData({ ...formData, organizationStatus: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                  Configure data retention and management policies.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="retention">
                    Data Retention Period (days)
                  </Label>
                  <Input
                    id="retention"
                    type="number"
                    value={formData.settings.dataRetentionPeriod}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          dataRetentionPeriod: parseInt(e.target.value),
                        },
                      })
                    }
                    placeholder="365"
                  />
                  <p className="text-sm text-muted-foreground">
                    How long to keep documents and data before automatic
                    deletion.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage security and access controls for your organization.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for all organization members
                    </p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>IP Restrictions</Label>
                    <p className="text-sm text-muted-foreground">
                      Restrict access to specific IP addresses
                    </p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="grid gap-2">
                  <Label htmlFor="allowed-ips">Allowed IP Addresses</Label>
                  <Textarea
                    id="allowed-ips"
                    placeholder="192.168.1.1&#10;10.0.0.0/24"
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter one IP address or CIDR block per line.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Settings */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
                <CardDescription>
                  Manage billing details and subscription settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Billing management will be available in a future update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Danger Zone */}
          <TabsContent value="danger" className="space-y-6">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible and destructive actions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-red-600">
                      Delete Organization
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete this organization and all its data.
                      This action cannot be undone.
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Organization</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{organization.name}"?
                          This will permanently delete the organization and all
                          associated data including teams, documents, and member
                          access. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete Organization
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

export default withAuth(OrganizationSettingsPage);
