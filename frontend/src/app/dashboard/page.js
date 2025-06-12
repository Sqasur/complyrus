"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import withAuth from "@/components/withAuth";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  FolderOpen,
  Users,
  Building2,
  ClipboardCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  variant = "default",
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const QuickActions = () => (
  <Card>
    <CardHeader>
      <CardTitle>Quick Actions</CardTitle>
      <CardDescription>Common tasks to get you started</CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      <Button className="w-full justify-start" variant="outline">
        <FileText className="mr-2 h-4 w-4" />
        Upload Document
      </Button>
      <Button className="w-full justify-start" variant="outline">
        <FolderOpen className="mr-2 h-4 w-4" />
        Create Folder
      </Button>
      <Button className="w-full justify-start" variant="outline">
        <ClipboardCheck className="mr-2 h-4 w-4" />
        View Compliance Programs
      </Button>
      <Button className="w-full justify-start" variant="outline">
        <Users className="mr-2 h-4 w-4" />
        Manage Team
      </Button>
    </CardContent>
  </Card>
);

const RecentActivity = () => (
  <Card>
    <CardHeader>
      <CardTitle>Recent Activity</CardTitle>
      <CardDescription>Latest updates in your workspace</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="flex h-2 w-2 rounded-full bg-blue-600"></div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium">Document uploaded</p>
          <p className="text-sm text-muted-foreground">
            ISO 27001 Policy uploaded to Security folder
          </p>
        </div>
        <div className="text-sm text-muted-foreground">2h ago</div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex h-2 w-2 rounded-full bg-green-600"></div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium">Compliance check passed</p>
          <p className="text-sm text-muted-foreground">
            GDPR compliance review completed
          </p>
        </div>
        <div className="text-sm text-muted-foreground">4h ago</div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex h-2 w-2 rounded-full bg-orange-600"></div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium">Team member added</p>
          <p className="text-sm text-muted-foreground">
            Sarah Johnson joined the Compliance team
          </p>
        </div>
        <div className="text-sm text-muted-foreground">1d ago</div>
      </div>
    </CardContent>
  </Card>
);

const ComplianceOverview = () => (
  <Card>
    <CardHeader>
      <CardTitle>Compliance Overview</CardTitle>
      <CardDescription>Current compliance status</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm">ISO 27001</span>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Compliant
        </Badge>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <span className="text-sm">GDPR</span>
        </div>
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          Review Required
        </Badge>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm">SOC 2</span>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Compliant
        </Badge>
      </div>
    </CardContent>
  </Card>
);

function DashboardPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening in your compliance workspace today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Documents"
            value="245"
            description="+12 from last month"
            icon={FileText}
          />
          <StatCard
            title="Active Folders"
            value="18"
            description="+2 new this week"
            icon={FolderOpen}
          />
          <StatCard
            title="Team Members"
            value="12"
            description="Across 3 teams"
            icon={Users}
          />
          <StatCard
            title="Compliance Programs"
            value="5"
            description="3 active, 2 pending"
            icon={ClipboardCheck}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <RecentActivity />
          </div>

          <div className="space-y-6">
            <QuickActions />
            <ComplianceOverview />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default withAuth(DashboardPage);
