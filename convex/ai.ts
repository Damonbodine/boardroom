"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "nvidia/nemotron-3-super-120b-a12b:free";

async function callOpenRouter(prompt: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not configured");

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export const generateMinutes = action({
  args: { meetingId: v.id("meetings") },
  returns: v.string(),
  handler: async (ctx, args): Promise<string> => {
    const meeting: any = await ctx.runQuery(api.meetings.get, {
      meetingId: args.meetingId,
    });
    if (!meeting) throw new Error("MEETING_NOT_FOUND");

    const motions: any[] = await ctx.runQuery(api.motions.listByMeeting, {
      meetingId: args.meetingId,
    });

    const actionItems: any[] = await ctx.runQuery(api.actionItems.listByMeeting, {
      meetingId: args.meetingId,
    });

    const agendaSection = (meeting.agendaItems ?? [])
      .map(
        (item: any, i: number) =>
          `${i + 1}. ${item.title} (${item.type}) - ${item.status}${item.notes ? `\n   Notes: ${item.notes}` : ""}`
      )
      .join("\n");

    const motionsSection = (motions ?? [])
      .map(
        (m: any) =>
          `- "${m.title}" by ${m.movedBy?.name ?? "Unknown"}${m.secondedBy?.name ? `, seconded by ${m.secondedBy.name}` : ""} — ${m.status} (For: ${m.votesFor}, Against: ${m.votesAgainst}, Abstain: ${m.votesAbstain})`
      )
      .join("\n");

    const actionItemsSection = (actionItems ?? [])
      .map(
        (a: any) =>
          `- ${a.title} → assigned to ${a.assigneeName ?? "Unknown"}, due ${new Date(a.dueDate).toLocaleDateString()}`
      )
      .join("\n");

    const prompt = `You are a professional board secretary. Generate formal meeting minutes following Robert's Rules of Order conventions for the following meeting:

Meeting: ${meeting.title}
Date: ${new Date(meeting.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
Time: ${meeting.startTime} - ${meeting.endTime}
Location: ${meeting.location}
Type: ${meeting.meetingType}

AGENDA ITEMS:
${agendaSection || "No agenda items recorded."}

MOTIONS:
${motionsSection || "No motions recorded."}

ACTION ITEMS:
${actionItemsSection || "No action items recorded."}

Please format the minutes with:
- Call to Order
- Roll Call (note: members present not available, mark as TBD)
- Approval of Previous Minutes (if applicable)
- Each agenda item with discussion summary
- Motions with full parliamentary notation (moved by, seconded by, vote tally, result)
- Action items assigned
- Adjournment
Use formal parliamentary language.`;

    return await callOpenRouter(prompt);
  },
});

export const generateBriefing = action({
  args: { meetingId: v.id("meetings") },
  returns: v.string(),
  handler: async (ctx, args): Promise<string> => {
    const meeting: any = await ctx.runQuery(api.meetings.get, {
      meetingId: args.meetingId,
    });
    if (!meeting) throw new Error("MEETING_NOT_FOUND");

    const documents: any[] = await ctx.runQuery(api.documents.list, {
      meetingId: args.meetingId,
    });

    const agendaSection = (meeting.agendaItems ?? [])
      .map(
        (item: any, i: number) =>
          `${i + 1}. ${item.title} (${item.type}, ~${item.duration}min)${item.description ? `\n   ${item.description}` : ""}`
      )
      .join("\n");

    const documentsSection = (documents ?? [])
      .map(
        (doc: any) =>
          `- ${doc.title} (${doc.category}, ${doc.fileType})`
      )
      .join("\n");

    const prompt = `You are a board governance analyst. Generate a concise 1-2 page executive briefing for the following upcoming board meeting:

Meeting: ${meeting.title}
Date: ${new Date(meeting.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
Time: ${meeting.startTime} - ${meeting.endTime}
Location: ${meeting.location}
Type: ${meeting.meetingType}

AGENDA ITEMS:
${agendaSection || "No agenda items yet."}

ASSOCIATED DOCUMENTS:
${documentsSection || "No documents attached."}

Please provide:
1. Executive Summary — key themes and priorities for this meeting
2. Key Decisions Needed — what the board must decide, with context
3. Items Requiring Preparation — what members should review beforehand
4. Estimated Timeline — how the meeting flow is likely to proceed
Keep the tone professional and concise.`;

    return await callOpenRouter(prompt);
  },
});

export const draftFollowUp = action({
  args: { actionItemId: v.id("actionItems") },
  returns: v.string(),
  handler: async (ctx, args): Promise<string> => {
    const allItems: any[] = await ctx.runQuery(api.actionItems.list, {});
    const actionItem = (allItems ?? []).find(
      (i: any) => i._id === args.actionItemId
    );
    if (!actionItem) throw new Error("ACTION_ITEM_NOT_FOUND");

    const meeting: any = await ctx.runQuery(api.meetings.get, {
      meetingId: actionItem.meetingId,
    });

    const prompt = `You are a professional board administrator. Draft a polite follow-up message for an overdue action item.

Action Item: ${actionItem.title}
${actionItem.description ? `Description: ${actionItem.description}` : ""}
Assigned To: ${actionItem.assigneeName ?? "the assignee"}
Due Date: ${new Date(actionItem.dueDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
Current Status: ${actionItem.status}
Meeting: ${meeting?.title ?? "Board Meeting"}
Meeting Date: ${meeting ? new Date(meeting.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "N/A"}

Draft a professional, polite follow-up message that:
1. Acknowledges the importance of the task
2. Provides context about why this action item was created and what decision drove it
3. Asks for a status update
4. Offers assistance if there are blockers
Keep the tone respectful and collaborative, not accusatory.`;

    return await callOpenRouter(prompt);
  },
});

export const analyzeMotionImpact = action({
  args: { motionId: v.id("motions") },
  returns: v.string(),
  handler: async (ctx, args): Promise<string> => {
    const motionData: any = await ctx.runQuery(api.motions.get, {
      motionId: args.motionId,
    });
    if (!motionData) throw new Error("MOTION_NOT_FOUND");

    const meeting: any = await ctx.runQuery(api.meetings.get, {
      meetingId: motionData.meetingId,
    });

    const prompt: string = `You are a nonprofit governance expert. Analyze the following motion and provide an impact assessment:

Motion: ${motionData.title}
Description: ${motionData.description}
Status: ${motionData.status}
Votes: For ${motionData.votesFor}, Against ${motionData.votesAgainst}, Abstain ${motionData.votesAbstain}
Meeting: ${meeting?.title ?? "Board Meeting"}

Please analyze:
1. **What This Changes** — What policies, procedures, or operations would change if this motion passes
2. **Who Is Affected** — Board members, staff, stakeholders, or community members impacted
3. **Financial Implications** — Any budget impact, cost, or revenue considerations
4. **Bylaw Alignment** — Whether this is consistent with typical nonprofit bylaws and governance best practices
5. **Risk Assessment** — Potential risks or unintended consequences
6. **Recommendation** — A balanced assessment to help board members make an informed decision

Be thorough but concise. Use clear headings.`;

    return await callOpenRouter(prompt);
  },
});
