"use client";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { MeetingDetailHeader } from "@/components/meeting-detail-header";
import { AgendaItemList } from "@/components/agenda-item-list";
import { MotionsList } from "@/components/motions-list";
import { ActionItemsTable } from "@/components/action-items-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MeetingDetailPage() {
  const params = useParams();
  const meetingId = params.id as Id<"meetings">;

  return (
    <div className="space-y-6">
      <MeetingDetailHeader meetingId={meetingId} />
      <Tabs defaultValue="agenda">
        <TabsList>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
          <TabsTrigger value="motions">Motions</TabsTrigger>
          <TabsTrigger value="action-items">Action Items</TabsTrigger>
        </TabsList>
        <TabsContent value="agenda"><AgendaItemList meetingId={meetingId} /></TabsContent>
        <TabsContent value="motions"><MotionsList meetingId={meetingId} /></TabsContent>
        <TabsContent value="action-items"><ActionItemsTable meetingId={meetingId} /></TabsContent>
      </Tabs>
    </div>
  );
}
