"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, PlayCircle, RotateCcw, X } from "lucide-react";

type DemoStep = {
  id: string;
  title: string;
  body: string;
  whyItMatters: string;
  routePrefix: string;
  target?: string;
  actionLabel?: string;
};

type DemoScenario = {
  id: string;
  title: string;
  estimatedMinutes: number;
  description: string;
  steps: DemoStep[];
};

const BOARDROOM_SCENARIO: DemoScenario = {
  id: "quarterly-board-prep",
  title: "Quarterly Board Meeting Prep",
  estimatedMinutes: 2,
  description:
    "Show how Boardroom helps a nonprofit board admin review governance health, inspect an upcoming meeting, and track follow-through.",
  steps: [
    {
      id: "dashboard",
      title: "Start with the governance overview",
      body:
        "This dashboard is the quickest way for a nonprofit leader to see meeting readiness, unresolved motions, overdue follow-up, and member activity.",
      whyItMatters:
        "Skeptical nonprofits need to see operational clarity immediately, not hunt across the app for signals.",
      routePrefix: "/dashboard",
      target: "[data-demo='dashboard-overview']",
      actionLabel: "Open dashboard",
    },
    {
      id: "stats",
      title: "Review the executive summary cards",
      body:
        "These top-line metrics surface the numbers a board chair or administrator cares about first: upcoming meetings, open motions, overdue items, and active members.",
      whyItMatters:
        "This proves the app can summarize governance workload rather than acting as a passive record store.",
      routePrefix: "/dashboard",
      target: "[data-demo='dashboard-stats']",
    },
    {
      id: "overdue-items",
      title: "Inspect overdue follow-through",
      body:
        "The overdue action items table highlights unresolved work so the team can see accountability gaps before the next meeting.",
      whyItMatters:
        "Nonprofits often need better follow-through more than they need more meeting notes.",
      routePrefix: "/dashboard",
      target: "[data-demo='dashboard-action-items']",
    },
    {
      id: "meetings-list",
      title: "Open the meetings workspace",
      body:
        "The meetings page gives staff a clear list of scheduled, completed, and emergency meetings and acts as the entry point into agenda prep.",
      whyItMatters:
        "This is where a board admin moves from summary to actual meeting management.",
      routePrefix: "/meetings",
      target: "[data-demo='meetings-table']",
      actionLabel: "Open meetings",
    },
    {
      id: "meeting-detail",
      title: "Open a meeting to review the details",
      body:
        "Choose a meeting from the list to see the date, location, status, and the full working surface for agenda, motions, and follow-up.",
      whyItMatters:
        "This step shows the app is built for real board operations, not just list pages.",
      routePrefix: "/meetings/",
      target: "[data-demo='meeting-detail-header']",
    },
    {
      id: "meeting-workspace",
      title: "Use the meeting workspace tabs",
      body:
        "Agenda, motions, action items, minutes, and briefing all live together so governance work stays attached to the meeting context.",
      whyItMatters:
        "This is the strongest product proof in the app: preparation, deliberation, and follow-up are connected.",
      routePrefix: "/meetings/",
      target: "[data-demo='meeting-workspace-tabs']",
    },
  ],
};

function getScenarioById(id: string | null): DemoScenario | null {
  if (id === BOARDROOM_SCENARIO.id) return BOARDROOM_SCENARIO;
  return null;
}

function routeMatches(pathname: string, routePrefix: string) {
  if (routePrefix.endsWith("/")) {
    return pathname.startsWith(routePrefix);
  }
  return pathname === routePrefix || pathname.startsWith(`${routePrefix}/`);
}

export function DemoMode() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const demoId = searchParams.get("demo");
  const stepParam = searchParams.get("step");
  const scenario = useMemo(() => getScenarioById(demoId), [demoId]);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!scenario) {
      setStepIndex(0);
      return;
    }

    const parsedStep = Number(stepParam ?? "1");
    const nextStepIndex =
      Number.isFinite(parsedStep) && parsedStep > 0
        ? Math.min(parsedStep - 1, scenario.steps.length - 1)
        : 0;

    setStepIndex((prev) => (prev === nextStepIndex ? prev : nextStepIndex));
  }, [demoId, scenario, stepParam]);

  const currentStep = scenario?.steps[stepIndex];

  useEffect(() => {
    if (!scenario) return;

    const nextStepParam = String(stepIndex + 1);
    if (stepParam === nextStepParam) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("demo", scenario.id);
    params.set("step", nextStepParam);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, scenario, searchParams, stepIndex, stepParam]);

  useEffect(() => {
    if (!currentStep?.target) return;

    const element = document.querySelector(currentStep.target);
    if (!element) return;

    element.setAttribute("data-demo-active", "true");
    element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });

    return () => {
      element.removeAttribute("data-demo-active");
    };
  }, [currentStep, pathname]);

  if (!scenario || !currentStep) {
    return null;
  }

  const onExpectedRoute = routeMatches(pathname, currentStep.routePrefix);
  const isLastStep = stepIndex === scenario.steps.length - 1;

  function updateSearch(nextDemo: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextDemo) {
      params.set("demo", nextDemo);
      params.set("step", String(stepIndex + 1));
    } else {
      params.delete("demo");
      params.delete("step");
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function nextStep() {
    if (!onExpectedRoute) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("demo", scenario.id);
      params.set("step", String(stepIndex + 1));
      const route =
        currentStep.routePrefix === "/meetings/" ? "/meetings" : currentStep.routePrefix;
      router.push(`${route}?${params.toString()}`);
      return;
    }

    if (!isLastStep) {
      setStepIndex((prev) => prev + 1);
    }
  }

  function previousStep() {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  }

  function restartScenario() {
    setStepIndex(0);
    router.push("/dashboard?demo=quarterly-board-prep&step=1");
  }

  function exitDemo() {
    updateSearch(null);
  }

  return (
    <div className="pointer-events-none fixed right-6 bottom-6 z-50 w-full max-w-md">
      <div className="pointer-events-auto rounded-2xl border border-border bg-card/95 p-5 shadow-2xl backdrop-blur">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                Guided Demo
              </Badge>
              <span className="text-xs text-muted-foreground">
                Step {stepIndex + 1} of {scenario.steps.length}
              </span>
            </div>
            <h2 className="font-serif text-xl font-semibold">{scenario.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{scenario.description}</p>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0" onClick={exitDemo}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${((stepIndex + 1) / scenario.steps.length) * 100}%` }}
          />
        </div>

        <div className="space-y-3">
          <div data-demo-panel-step={currentStep.id}>
            <h3 className="text-base font-semibold">{currentStep.title}</h3>
            <p className="mt-1 text-sm text-foreground/90">{currentStep.body}</p>
          </div>

          <div className="rounded-xl border border-border bg-muted/40 p-3">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Why this matters
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">{currentStep.whyItMatters}</p>
          </div>

          {!onExpectedRoute && (
            <div className="rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
              Go to the next screen to continue this walkthrough.
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={previousStep} disabled={stepIndex === 0}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back
            </Button>
            <Button variant="ghost" size="sm" onClick={restartScenario}>
              <RotateCcw className="mr-1.5 h-4 w-4" />
              Restart
            </Button>
          </div>
          <Button size="sm" onClick={nextStep}>
            {!onExpectedRoute ? (
              <>
                <PlayCircle className="mr-1.5 h-4 w-4" />
                {currentStep.actionLabel ?? "Go there"}
              </>
            ) : isLastStep ? (
              "Finish"
            ) : (
              <>
                Next
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {isLastStep && onExpectedRoute && (
          <div className="mt-3 rounded-xl border border-success/30 bg-success/10 p-3 text-sm text-success">
            You’ve completed the guided demo. Keep exploring, or restart the scenario any time.
          </div>
        )}
      </div>
    </div>
  );
}

export function DemoModeStartButton({
  className,
}: {
  className?: string;
}) {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      className={cn("gap-2", className)}
      onClick={() => router.push("/dashboard?demo=quarterly-board-prep&step=1")}
    >
      <PlayCircle className="h-4 w-4" />
      Start guided demo
    </Button>
  );
}
