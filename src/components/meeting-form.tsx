"use client";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Id } from "@convex/_generated/dataModel";

interface MeetingFormProps {
  meetingId?: Id<"meetings">;
  defaultValues?: {
    title: string;
    description?: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    meetingType: string;
  };
}

export function MeetingForm({ meetingId, defaultValues }: MeetingFormProps) {
  const router = useRouter();
  const createMeeting = useMutation(api.meetings.create);
  const updateMeeting = useMutation(api.meetings.update);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) || undefined;
    const dateStr = formData.get("date") as string;
    const startTime = formData.get("startTime") as string;
    const location = formData.get("location") as string;
    const meetingType = formData.get("meetingType") as string;
    // Combine date + startTime into a single timestamp for scheduledAt
    const scheduledAt = new Date(`${dateStr}T${startTime}`).getTime();
    try {
      if (meetingId) {
        await updateMeeting({ meetingId, title, description, scheduledAt, location, type: meetingType });
      } else {
        await createMeeting({ title, description, scheduledAt, location, type: meetingType });
      }
      router.push("/meetings");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">{meetingId ? "Edit Meeting" : "Create Meeting"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label htmlFor="title">Title *</Label><Input id="title" name="title" required defaultValue={defaultValues?.title} /></div>
          <div><Label htmlFor="description">Description</Label><Textarea id="description" name="description" defaultValue={defaultValues?.description} /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label htmlFor="date">Date *</Label><Input id="date" name="date" type="date" required defaultValue={defaultValues?.date} /></div>
            <div><Label htmlFor="startTime">Start Time *</Label><Input id="startTime" name="startTime" type="time" required defaultValue={defaultValues?.startTime} /></div>
            <div><Label htmlFor="endTime">End Time *</Label><Input id="endTime" name="endTime" type="time" required defaultValue={defaultValues?.endTime} /></div>
          </div>
          <div><Label htmlFor="location">Location *</Label><Input id="location" name="location" required defaultValue={defaultValues?.location} /></div>
          <div><Label htmlFor="meetingType">Meeting Type *</Label><Select name="meetingType" defaultValue={defaultValues?.meetingType || "Regular"}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Regular">Regular</SelectItem><SelectItem value="Special">Special</SelectItem><SelectItem value="Emergency">Emergency</SelectItem><SelectItem value="AnnualGeneral">Annual General</SelectItem></SelectContent></Select></div>
          <div className="flex gap-3"><Button type="submit" disabled={loading}>{meetingId ? "Save Changes" : "Create Meeting"}</Button><Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button></div>
        </form>
      </CardContent>
    </Card>
  );
}