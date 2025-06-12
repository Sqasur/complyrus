// filepath: frontend/src/app/folders/[id]/page.js
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
  Folder,
  FileText,
  Upload,
  Download,
  MoreHorizontal,
  ArrowLeft,
  Users,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

function FolderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const folderId = params.id;

  const [folder, setFolder] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadData, setUploadData] = useState({
    name: "",
    type: "pdf",
    isPrivate: true,
  });
  useEffect(() => {
    if (folderId) {
      fetchFolder();
      fetchDocuments();
    }
  }, [folderId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchFolder = async () => {
    try {
      const response = await api.get(`/folders/${folderId}`);
      if (response.data.success) {
        setFolder(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch folder:", error);
      if (error.response?.status === 404) {
        router.push("/teams");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await api.get(`/folders/${folderId}/documents`);
      if (response.data.success) {
        setDocuments(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      // Auto-detect file type and set name
      const fileExtension = file.name.split(".").pop().toLowerCase();
      const fileType = ["pdf", "docx", "xlsx"].includes(fileExtension)
        ? fileExtension
        : "pdf";

      setUploadData({
        ...uploadData,
        name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        type: fileType,
      });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("name", uploadData.name);
      formData.append("type", uploadData.type);
      formData.append("isPrivate", uploadData.isPrivate);

      const response = await api.post(
        `/folders/${folderId}/documents`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        fetchDocuments();
        setUploadDialogOpen(false);
        setUploadFile(null);
        setUploadData({
          name: "",
          type: "pdf",
          isPrivate: true,
        });
      }
    } catch (error) {
      console.error("Failed to upload document:", error);
    }
  };

  const handleDownload = async (documentId, fileName) => {
    try {
      const response = await api.get(`/documents/${documentId}/download`, {
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download document:", error);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      const response = await api.delete(`/documents/${documentId}`);
      if (response.data.success) {
        fetchDocuments();
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-4 w-4 text-red-500" />;
      case "docx":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "xlsx":
        return <FileText className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
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

  if (!folder) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold">Folder not found</h3>
          <p className="text-muted-foreground">
            The folder you&apos;re looking for doesn&apos;t exist or you
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
                <Link href={`/teams/${folder.teamId._id || folder.teamId}`}>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <Folder className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">{folder.name}</h1>
            </div>
            <p className="text-muted-foreground">
              {folder.description || "No description provided"}
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{folder.teamId?.name || "Unknown Team"}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Created {formatDate(folder.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleUpload}>
                  <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                    <DialogDescription>
                      Upload a new document to this folder.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="file">File</Label>
                      <Input
                        id="file"
                        type="file"
                        accept=".pdf,.docx,.xlsx"
                        onChange={handleFileChange}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="name">Document Name</Label>
                      <Input
                        id="name"
                        value={uploadData.name}
                        onChange={(e) =>
                          setUploadData({ ...uploadData, name: e.target.value })
                        }
                        placeholder="Enter document name"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="type">Document Type</Label>
                      <Select
                        value={uploadData.type}
                        onValueChange={(value) =>
                          setUploadData({ ...uploadData, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="docx">Word Document</SelectItem>
                          <SelectItem value="xlsx">
                            Excel Spreadsheet
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isPrivate"
                        checked={uploadData.isPrivate}
                        onChange={(e) =>
                          setUploadData({
                            ...uploadData,
                            isPrivate: e.target.checked,
                          })
                        }
                      />
                      <Label htmlFor="isPrivate">Private document</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setUploadDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={!uploadFile}>
                      Upload
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Documents
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documents.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Private Documents
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {documents.filter((doc) => doc.isPrivate).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {folder.teamId?.name || "Unknown Team"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>Manage documents in this folder</CardDescription>
          </CardHeader>
          <CardContent>
            {documents.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Private</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((document) => (
                    <TableRow key={document._id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getFileIcon(document.type)}
                          <span className="font-medium">{document.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {document.type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {document.versions?.find((v) => v.isCurrent)
                          ?.versionNumber || "v1.0"}
                      </TableCell>
                      <TableCell>
                        {document.isPrivate ? (
                          <Badge variant="secondary">Private</Badge>
                        ) : (
                          <Badge variant="outline">Public</Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(document.createdAt)}</TableCell>
                      <TableCell>
                        {document.createdBy
                          ? `${document.createdBy.firstName} ${document.createdBy.lastName}`
                          : "Unknown"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleDownload(document._id, document.name)
                              }
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteDocument(document._id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No documents</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get started by uploading your first document.
                </p>
                <div className="mt-6">
                  <Button onClick={() => setUploadDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Upload Document
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default withAuth(FolderDetailsPage);
