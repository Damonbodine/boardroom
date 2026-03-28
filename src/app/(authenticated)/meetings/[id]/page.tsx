"use client";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { MeetingDetailHeader } from "@/components/meeting-detail-header";
import { AgendaItemList } from "@/components/agenda-item-list";
import { MotionsList } from "@/components/motions-list";
import { ActionItemsTable } from "@/components/action-items-table";
import { MinutesGenerator } from "@/components/minutes-generator";
import { BoardPacketBriefing } from "@/components/board-packet-briefing";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MeetingDetailPage() {
  const params = useParams();
  const meetingId = params.id as Id<"meetings">;

  return (
    <div className="space-y-6">
      <MeetingDetailHeader meetingId={meetingId} />
      <Tabs defaultValue="agenda">
        <TabsList data-demo="meeting-workspace-tabs">
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
          <TabsTrigger value="motions">Motions</TabsTrigger>
          <TabsTrigger value="action-items">Action Items</TabsTrigger>
          <TabsTrigger value="minutes">Minutes</TabsTrigger>
          <TabsTrigger value="briefing">Briefing</TabsTrigger>
        </TabsList>
        <TabsContent value="agenda"><AgendaItemList meetingId={meetingId} /></TabsContent>
        <TabsContent value="motions"><MotionsList meetingId={meetingId} /></TabsContent>
        <TabsContent value="action-items"><ActionItemsTable meetingId={meetingId} /></TabsContent>
        <TabsContent value="minutes"><MinutesGenerator meetingId={meetingId} /></TabsContent>
        <TabsContent value="briefing"><BoardPacketBriefing meetingId={meetingId} /></TabsContent>
      </Tabs>
    </div>
  );
}
