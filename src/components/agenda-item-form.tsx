"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Id } from "@convex/_generated/dataModel";

interface AgendaItemFormProps {
  meetingId: Id<"meetings">;
  onSuccess?: () => void;
}

export function AgendaItemForm({ meetingId, onSuccess }: AgendaItemFormProps) {
  const createItem = useMutation(api.agendaItems.create);
  const users = useQuery(api.users.list, {});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createItem({
        meetingId,
        title: formData.get("title") as string,
        description: (formData.get("description") as string) || undefined,
        presenter: (formData.get("presenter") as Id<"users">) || undefined,
        duration: parseInt(formData.get("duration") as string),
        type: formData.get("type") as "Information" | "Discussion" | "Action" | "Vote",
      });
      e.currentTarget.reset();
      onSuccess?.();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border p-4">
      <div><Label htmlFor="title">Title *</Label><Input id="title" name="title" required /></div>
      <div><Label htmlFor="description">Description</Label><Textarea id="description" name="description" /></div>
      <div className="grid grid-cols-3 gap-3">
        <div><Label htmlFor="presenter">Presenter</Label><Select name="presenter"><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent>{users?.map(u => <SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>)}</SelectContent></Select></div>
        <div><Label htmlFor="duration">Duration (min) *</Label><Input id="duration" name="duration" type="number" required min={1} /></div>
        <div><Label htmlFor="type">Type *</Label><Select name="type" defaultValue="Discussion"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Information">Information</SelectItem><SelectItem value="Discussion">Discussion</SelectItem><SelectItem value="Action">Action</SelectItem><SelectItem value="Vote">Vote</SelectItem></SelectContent></Select></div>
      </div>
      <Button type="submit" disabled={loading} size="sm">Add Item</Button>
    </form>
  );
}