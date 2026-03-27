"use client";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Id } from "@convex/_generated/dataModel";

interface MotionFormProps {
  meetingId: Id<"meetings">;
  onSuccess?: () => void;
}

export function MotionForm({ meetingId, onSuccess }: MotionFormProps) {
  const createMotion = useMutation(api.motions.create);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createMotion({
        meetingId,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
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
      <div><Label htmlFor="title">Motion Title *</Label><Input id="title" name="title" required /></div>
      <div><Label htmlFor="description">Full Text of Motion *</Label><Textarea id="description" name="description" required rows={4} /></div>
      <Button type="submit" disabled={loading}>Propose Motion</Button>
    </form>
  );
}