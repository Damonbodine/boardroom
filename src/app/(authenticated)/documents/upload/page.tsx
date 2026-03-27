"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { RoleGuard } from "@/components/role-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

const CATEGORIES = ["Policy", "Minutes", "Financial", "Legal", "Strategic", "General"] as const;

export default function DocumentUploadPage() {
  const router = useRouter();
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const createDocument = useMutation(api.documents.create);
  const meetings = useQuery(api.meetings.list, {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const category = formData.get("category") as typeof CATEGORIES[number];
    const meetingId = formData.get("meetingId") as string;
    const file = fileInputRef.current?.files?.[0];

    if (!title || !category || !file) {
      setError("Please fill in all required fields and select a file.");
      setLoading(false);
      return;
    }

    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error("File upload failed");
      }

      const { storageId } = await result.json();

      await createDocument({
        title,
        storageId,
        category,
        fileType: file.type,
        fileSize: file.size,
        meetingId: meetingId ? (meetingId as Id<"meetings">) : undefined,
      });

      router.push("/documents");
    } catch (err) {
      console.error(err);
      setError("Failed to upload document. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <RoleGuard allowedRoles={["Admin", "Staff"]}>
      <div className="max-w-2xl">
        <h1 className="font-serif text-3xl font-bold text-primary mb-6">Upload Document</h1>
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Document Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                  {error}
                </div>
              )}
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input id="title" name="title" required />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="file">File *</Label>
                <Input id="file" name="file" type="file" ref={fileInputRef} required />
              </div>
              <div>
                <Label htmlFor="meetingId">Related Meeting (optional)</Label>
                <Select name="meetingId">
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    {meetings?.map((m) => (
                      <SelectItem key={m._id} value={m._id}>
                        {m.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? "Uploading..." : "Upload Document"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
