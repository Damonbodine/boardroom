"use client";

import { useAction, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, AlertTriangle, Copy, Check } from "lucide-react";
import { useState } from "react";

export function FollowUpDrafter() {
  const overdueItems = useQuery(api.actionItems.listOverdue, {});
  const draftFollowUp = useAction(api.ai.draftFollowUp);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDraft = async (actionItemId: string) => {
    setGenerating(actionItemId);
    setError(null);
    try {
      const result = await draftFollowUp({ actionItemId: actionItemId as any });
      setDrafts((prev) => ({ ...prev, [actionItemId]: result }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to draft follow-up");
    } finally {
      setGenerating(null);
    }
  };

  const handleCopy = async (actionItemId: string) => {
    const text = drafts[actionItemId];
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(actionItemId);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!overdueItems) {
    return <div className="p-8 text-center text-muted-foreground">Loading overdue items...</div>;
  }

  if (overdueItems.length === 0) {
    return (
      <Card className="border">
        <CardContent className="py-12 text-center text-muted-foreground">
          <Mail className="h-10 w-10 mx-auto mb-2 opacity-40" />
          <p className="font-serif text-lg">No overdue action items</p>
          <p className="text-sm mt-1">All action items are on track.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border">
        <CardHeader className="pb-2">
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Overdue Action Items — Follow-Up Drafter
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-sm text-red-600 mb-4 p-3 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          <div className="divide-y">
            {overdueItems.map((item: any) => (
              <div key={item._id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {new Date(item.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {drafts[item._id] && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(item._id)}
                      >
                        {copied === item._id ? (
                          <Check className="h-4 w-4 mr-1.5 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4 mr-1.5" />
                        )}
                        {copied === item._id ? "Copied" : "Copy"}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleDraft(item._id)}
                      disabled={generating === item._id}
                    >
                      {generating === item._id ? (
                        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      ) : (
                        <Mail className="h-4 w-4 mr-1.5" />
                      )}
                      {generating === item._id ? "Drafting..." : "Draft Follow-Up"}
                    </Button>
                  </div>
                </div>
                {drafts[item._id] && (
                  <div className="mt-3 p-3 bg-muted/50 rounded-md text-sm whitespace-pre-wrap leading-relaxed">
                    {drafts[item._id]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
