"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export function ProfileForm() {
  const user = useQuery(api.users.getCurrent, {});
  const updateUser = useMutation(api.users.update);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await updateUser({
        userId: user!._id,
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: (formData.get("phone") as string) || undefined,
        avatarUrl: (formData.get("avatarUrl") as string) || undefined,
        title: (formData.get("title") as string) || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle className="font-serif">Profile Settings</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label htmlFor="name">Full Name *</Label><Input id="name" name="name" required defaultValue={user.name} /></div>
          <div><Label htmlFor="email">Email *</Label><Input id="email" name="email" type="email" required defaultValue={user.email} /></div>
          <div><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" type="tel" defaultValue={user.phone} /></div>
          <div><Label htmlFor="avatarUrl">Avatar URL</Label><Input id="avatarUrl" name="avatarUrl" defaultValue={user.avatarUrl} /></div>
          <div><Label htmlFor="title">Board Title</Label><Input id="title" name="title" defaultValue={user.title} placeholder="e.g., Treasurer" /></div>
          {user.termStart && <div className="text-sm text-muted-foreground">Term: {new Date(user.termStart).toLocaleDateString()} - {user.termEnd ? new Date(user.termEnd).toLocaleDateString() : "Present"}</div>}
          <div className="flex items-center gap-3"><Button type="submit" disabled={loading}>Save Changes</Button>{saved && <span className="text-sm text-green-600">Saved!</span>}</div>
        </form>
      </CardContent>
    </Card>
  );
}