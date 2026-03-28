"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Save } from "lucide-react";
import { useState } from "react";

export function MinutesGenerator({ meetingId }: { meetingId: Id<"meetings"> }) {
  const meeting = useQuery(api.meetings.get, { meetingId });
  const generateMinutes = useAction(api.ai.generateMinutes);
  const updateMinutes = useMutation(api.meetings.updateMinutes);
  const [generatedMinutes, setGeneratedMinutes] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const result = await generateMinutes({ meetingId });
      setGeneratedMinutes(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate minutes");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedMinutes) return;
    setSaving(true);
    try {
      await updateMinutes({ meetingId, minutes: generatedMinutes });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save minutes");
    } finally {
      setSaving(false);
    }
  };

  const displayContent = generatedMinutes ?? meeting?.minutesContent;

  return (
    <Card className="border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif text-lg">Meeting Minutes</CardTitle>
          <div className="flex items-center gap-2">
            {generatedMinutes && !meeting?.minutesApproved && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1.5" />
                )}
                Save Minutes
              </Button>
            )}
            {!meeting?.minutesApproved && (
              <Button size="sm" onClick={handleGenerate} disabled={generating}>
                {generating ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-1.5" />
                )}
                {generating ? "Generating..." : "Generate Minutes"}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-sm text-red-600 mb-4 p-3 bg-red-50 rounded-md">
            {error}
          </div>
        )}
        {displayContent ? (
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed">
            {displayContent}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <FileText className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p className="font-serif">No minutes generated yet</p>
            <p className="text-xs mt-1">
              Click &quot;Generate Minutes&quot; to create formatted minutes from this meeting&apos;s data.
            </p>
          </div>
        )}
        {meeting?.minutesApproved && (
          <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
            Minutes approved on{" "}
            {meeting.minutesApprovedAt
              ? new Date(meeting.minutesApprovedAt).toLocaleDateString()
              : "N/A"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
