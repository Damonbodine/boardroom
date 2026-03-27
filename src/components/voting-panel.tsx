"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThumbsUp, ThumbsDown, MinusCircle } from "lucide-react";
import { useState } from "react";

export function VotingPanel({ motionId }: { motionId: Id<"motions"> }) {
  const motion = useQuery(api.motions.get, { motionId });
  const currentUser = useQuery(api.users.getCurrent, {});
  const myVote = useQuery(api.votes.getMyVote, { motionId });
  const castVote = useMutation(api.votes.cast);
  const [submitting, setSubmitting] = useState(false);

  if (!motion || !currentUser) {
    return (
      <Card className="border">
        <CardContent className="pt-6">
          <div className="h-32 animate-pulse bg-muted" />
        </CardContent>
      </Card>
    );
  }

  const isVoting = motion.status === "Voting";
  const isBoardMember = currentUser.role === "BoardMember";
  const canVote = isVoting && isBoardMember;

  const handleVote = async (value: "For" | "Against" | "Abstain") => {
    setSubmitting(true);
    try {
      await castVote({ motionId, userId: currentUser._id, value });
    } finally {
      setSubmitting(false);
    }
  };

  const voteButtons: { value: "For" | "Against" | "Abstain"; icon: typeof ThumbsUp; color: string; activeColor: string }[] = [
    { value: "For", icon: ThumbsUp, color: "bg-green-600 hover:bg-green-700 text-white", activeColor: "ring-2 ring-green-600 ring-offset-2" },
    { value: "Against", icon: ThumbsDown, color: "bg-red-600 hover:bg-red-700 text-white", activeColor: "ring-2 ring-red-600 ring-offset-2" },
    { value: "Abstain", icon: MinusCircle, color: "bg-muted-foreground hover:bg-muted-foreground/90 text-white", activeColor: "ring-2 ring-muted-foreground ring-offset-2" },
  ];

  return (
    <Card className="border">
      <CardHeader>
        <CardTitle className="font-serif text-lg">Vote Tally</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <p className="text-3xl font-bold font-serif text-green-700">{motion.votesFor}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">For</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold font-serif text-red-700">{motion.votesAgainst}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Against</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold font-serif text-muted-foreground">{motion.votesAbstain}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Abstain</p>
          </div>
        </div>

        {canVote && !myVote && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              Cast your vote:
            </p>
            <div className="flex gap-3">
              {voteButtons.map((btn) => (
                <Button
                  key={btn.value}
                  className={cn(btn.color)}
                  disabled={submitting}
                  onClick={() => handleVote(btn.value)}
                >
                  <btn.icon className="h-4 w-4 mr-1.5" />
                  {btn.value}
                </Button>
              ))}
            </div>
          </div>
        )}

        {canVote && myVote && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              You voted: <span className="font-semibold text-foreground">{myVote.vote}</span>
            </p>
          </div>
        )}

        {!isVoting && (
          <p className="text-sm text-muted-foreground text-center pt-2">
            Voting is {motion.status === "Passed" || motion.status === "Failed" ? "closed" : "not yet open"}.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
