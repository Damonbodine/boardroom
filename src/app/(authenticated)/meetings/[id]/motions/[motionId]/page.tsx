"use client";
import { useParams } from "next/navigation";
import { Id } from "@convex/_generated/dataModel";
import { VotingPanel } from "@/components/voting-panel";
import { MotionImpactAnalyzer } from "@/components/motion-impact-analyzer";

export default function MotionDetailPage() {
  const params = useParams();
  const motionId = params.motionId as Id<"motions">;

  return (
    <div className="max-w-2xl space-y-6">
      <VotingPanel motionId={motionId} />
      <MotionImpactAnalyzer motionId={motionId} />
    </div>
  );
}
