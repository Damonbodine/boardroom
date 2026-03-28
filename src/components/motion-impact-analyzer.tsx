"use client";

import { useAction, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scale, Loader2 } from "lucide-react";
import { useState } from "react";

export function MotionImpactAnalyzer({ motionId }: { motionId: Id<"motions"> }) {
  const motion = useQuery(api.motions.get, { motionId });
  const analyzeImpact = useAction(api.ai.analyzeMotionImpact);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeImpact({ motionId });
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze impact");
    } finally {
      setAnalyzing(false);
    }
  };

  if (!motion) {
    return (
      <Card className="border">
        <CardContent className="pt-6">
          <div className="h-24 animate-pulse bg-muted" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif text-lg">Impact Analysis</CardTitle>
          <Button size="sm" onClick={handleAnalyze} disabled={analyzing}>
            {analyzing ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Scale className="h-4 w-4 mr-1.5" />
            )}
            {analyzing ? "Analyzing..." : "Analyze Impact"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-sm text-red-600 mb-4 p-3 bg-red-50 rounded-md">
            {error}
          </div>
        )}
        {analysis ? (
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed">
            {analysis}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <Scale className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p className="font-serif">No impact analysis yet</p>
            <p className="text-xs mt-1">
              Analyze what this motion changes, who it affects, and financial implications.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
