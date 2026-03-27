"use client";
import { useParams } from "next/navigation";
import { Id } from "@convex/_generated/dataModel";
import { VotingPanel } from "@/components/voting-panel";

export default function MotionDetailPage() {
  const params = useParams();
  const motionId = params.motionId as Id<"motions">;

  return (
    <div className="max-w-2xl">
      <VotingPanel motionId={motionId} />
    </div>
  );
}
