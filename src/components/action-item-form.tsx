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

interface ActionItemFormProps {
  meetingId: Id<"meetings">;
  onSuccess?: () => void;
}

export function ActionItemForm({ meetingId, onSuccess }: ActionItemFormProps) {
  const createItem = useMutation(api.actionItems.create);
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
        assigneeId: formData.get("assigneeId") as Id<"users">,
        dueDate: new Date(formData.get("dueDate") as string).getTime(),
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
      <div className="grid grid-cols-2 gap-3">
        <div><Label htmlFor="assigneeId">Assignee *</Label><Select name="assigneeId"><SelectTrigger><SelectValue placeholder="Select assignee..." /></SelectTrigger><SelectContent>{users?.map(u => <SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>)}</SelectContent></Select></div>
        <div><Label htmlFor="dueDate">Due Date *</Label><Input id="dueDate" name="dueDate" type="date" required /></div>
      </div>
      <Button type="submit" disabled={loading} size="sm">Create Action Item</Button>
    </form>
  );
}