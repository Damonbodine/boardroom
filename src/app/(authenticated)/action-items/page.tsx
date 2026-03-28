"use client";
import { ActionItemsTable } from "@/components/action-items-table";
import { FollowUpDrafter } from "@/components/follow-up-drafter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ActionItemsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold text-primary">Action Items</h1>
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="follow-up">Follow-Up Drafter</TabsTrigger>
        </TabsList>
        <TabsContent value="all"><ActionItemsTable /></TabsContent>
        <TabsContent value="follow-up"><FollowUpDrafter /></TabsContent>
      </Tabs>
    </div>
  );
}
