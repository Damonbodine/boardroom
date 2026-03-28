"use client";

import { useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Loader2 } from "lucide-react";
import { useState } from "react";

export function BoardPacketBriefing({ meetingId }: { meetingId: Id<"meetings"> }) {
  const generateBriefing = useAction(api.ai.generateBriefing);
  const [briefing, setBriefing] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const result = await generateBriefing({ meetingId });
      setBriefing(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate briefing");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif text-lg">Board Packet Briefing</CardTitle>
          <Button size="sm" onClick={handleGenerate} disabled={generating}>
            {generating ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <BookOpen className="h-4 w-4 mr-1.5" />
            )}
            {generating ? "Generating..." : "Generate Briefing"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-sm text-red-600 mb-4 p-3 bg-red-50 rounded-md">
            {error}
          </div>
        )}
        {briefing ? (
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed">
            {briefing}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p className="font-serif">No briefing generated yet</p>
            <p className="text-xs mt-1">
              Generate an executive briefing summarizing key decisions and preparation needed.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
