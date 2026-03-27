"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CommitteeForm() {
  const router = useRouter();
  const createCommittee = useMutation(api.committees.create);
  const users = useQuery(api.users.list, {});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createCommittee({
        name: formData.get("name") as string,
        description: (formData.get("description") as string) || undefined,
        purpose: formData.get("purpose") as string,
        chairId: formData.get("chairId") as any,
      });
      router.push("/committees");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle className="font-serif">Create Committee</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label htmlFor="name">Name *</Label><Input id="name" name="name" required /></div>
          <div><Label htmlFor="description">Description</Label><Textarea id="description" name="description" /></div>
          <div><Label htmlFor="purpose">Purpose *</Label><Textarea id="purpose" name="purpose" required /></div>
          <div><Label htmlFor="chairId">Chair *</Label><Select name="chairId"><SelectTrigger><SelectValue placeholder="Select chair..." /></SelectTrigger><SelectContent>{users?.map(u => <SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>)}</SelectContent></Select></div>
          <div className="flex gap-3"><Button type="submit" disabled={loading}>Create Committee</Button><Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button></div>
        </form>
      </CardContent>
    </Card>
  );
}