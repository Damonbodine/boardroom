import { internalMutation } from "./_generated/server";

export const seedAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Idempotent — skip if already seeded
    const existing = await ctx.db.query("users").take(1);
    if (existing.length > 0) return;

    // ── Users ──────────────────────────────────────────────
    const margaretId = await ctx.db.insert("users", {
      clerkId: "clerk_admin_001",
      name: "Margaret Chen",
      email: "margaret@boardroom.org",
      phone: "555-0101",
      role: "Admin",
      title: "Board Chair",
      isActive: true,
      termStart: 1704067200000,
      termEnd: 1767225600000,
      createdAt: 1704067200000,
      updatedAt: 1704067200000,
    });

    const jamesId = await ctx.db.insert("users", {
      clerkId: "clerk_member_001",
      name: "James Williams",
      email: "james@boardroom.org",
      phone: "555-0102",
      role: "BoardMember",
      title: "Treasurer",
      isActive: true,
      termStart: 1704067200000,
      termEnd: 1767225600000,
      createdAt: 1704067200000,
      updatedAt: 1704067200000,
    });

    const sarahId = await ctx.db.insert("users", {
      clerkId: "clerk_member_002",
      name: "Sarah Johnson",
      email: "sarah@boardroom.org",
      phone: "555-0103",
      role: "BoardMember",
      title: "Secretary",
      isActive: true,
      termStart: 1704067200000,
      termEnd: 1767225600000,
      createdAt: 1704067200000,
      updatedAt: 1704067200000,
    });

    const robertId = await ctx.db.insert("users", {
      clerkId: "clerk_member_003",
      name: "Robert Davis",
      email: "robert@boardroom.org",
      role: "BoardMember",
      title: "Vice Chair",
      isActive: true,
      termStart: 1704067200000,
      termEnd: 1767225600000,
      createdAt: 1704067200000,
      updatedAt: 1704067200000,
    });

    const emilyId = await ctx.db.insert("users", {
      clerkId: "clerk_staff_001",
      name: "Emily Martinez",
      email: "emily@boardroom.org",
      phone: "555-0105",
      role: "Staff",
      isActive: true,
      createdAt: 1704067200000,
      updatedAt: 1704067200000,
    });

    // ── Meetings ───────────────────────────────────────────
    const q1MeetingId = await ctx.db.insert("meetings", {
      title: "Q1 Board Meeting",
      description: "Regular quarterly board meeting",
      date: 1711929600000,
      startTime: "14:00",
      endTime: "16:00",
      location: "Main Conference Room",
      meetingType: "Regular",
      status: "Completed",
      minutesContent: "Minutes of Q1 board meeting...",
      minutesApproved: true,
      minutesApprovedAt: 1712016000000,
      createdAt: 1710720000000,
      updatedAt: 1712016000000,
      createdById: margaretId,
    });

    const emergencyMeetingId = await ctx.db.insert("meetings", {
      title: "Emergency Budget Review",
      description: "Emergency session to review budget shortfall",
      date: 1714521600000,
      startTime: "10:00",
      endTime: "12:00",
      location: "Zoom Link",
      meetingType: "Emergency",
      status: "Completed",
      minutesApproved: false,
      createdAt: 1714348800000,
      updatedAt: 1714521600000,
      createdById: margaretId,
    });

    const q2MeetingId = await ctx.db.insert("meetings", {
      title: "Q2 Board Meeting",
      description: "Regular quarterly board meeting",
      date: 1719792000000,
      startTime: "14:00",
      endTime: "16:30",
      location: "Main Conference Room",
      meetingType: "Regular",
      status: "Scheduled",
      minutesApproved: false,
      createdAt: 1717200000000,
      updatedAt: 1717200000000,
      createdById: margaretId,
    });

    const agmMeetingId = await ctx.db.insert("meetings", {
      title: "Annual General Meeting 2024",
      description: "Annual general meeting for all stakeholders",
      date: 1732147200000,
      startTime: "09:00",
      endTime: "17:00",
      location: "Grand Ballroom, City Hotel",
      meetingType: "AnnualGeneral",
      status: "Scheduled",
      minutesApproved: false,
      createdAt: 1717200000000,
      updatedAt: 1717200000000,
      createdById: margaretId,
    });

    // ── Agenda Items (for Q2 Board Meeting) ────────────────
    await ctx.db.insert("agendaItems", {
      meetingId: q2MeetingId,
      title: "Call to Order",
      description: "Opening the meeting",
      sortOrder: 1,
      duration: 5,
      type: "Information",
      status: "Pending",
      createdAt: 1717200000000,
      updatedAt: 1717200000000,
    });

    await ctx.db.insert("agendaItems", {
      meetingId: q2MeetingId,
      title: "Approval of Previous Minutes",
      description: "Review and approve Q1 meeting minutes",
      sortOrder: 2,
      duration: 10,
      type: "Vote",
      status: "Pending",
      createdAt: 1717200000000,
      updatedAt: 1717200000000,
    });

    await ctx.db.insert("agendaItems", {
      meetingId: q2MeetingId,
      title: "Financial Report",
      description: "Q2 financial review presented by Treasurer",
      sortOrder: 3,
      duration: 30,
      type: "Discussion",
      status: "Pending",
      createdAt: 1717200000000,
      updatedAt: 1717200000000,
    });

    await ctx.db.insert("agendaItems", {
      meetingId: q2MeetingId,
      title: "New Program Proposal",
      description: "Proposal for youth mentorship program",
      sortOrder: 4,
      duration: 45,
      type: "Action",
      status: "Pending",
      createdAt: 1717200000000,
      updatedAt: 1717200000000,
    });

    await ctx.db.insert("agendaItems", {
      meetingId: q2MeetingId,
      title: "Adjournment",
      description: "Close of meeting",
      sortOrder: 5,
      duration: 5,
      type: "Information",
      status: "Pending",
      createdAt: 1717200000000,
      updatedAt: 1717200000000,
    });

    // ── Motions ────────────────────────────────────────────
    const motion1Id = await ctx.db.insert("motions", {
      meetingId: q1MeetingId,
      movedById: sarahId,
      secondedById: jamesId,
      title: "Approve Q1 Minutes",
      description: "Motion to approve the minutes from the Q1 Board Meeting as presented",
      status: "Passed",
      votesFor: 3,
      votesAgainst: 0,
      votesAbstain: 0,
      result: "Motion passed unanimously",
      createdAt: 1711929600000,
      updatedAt: 1711929600000,
    });

    const motion2Id = await ctx.db.insert("motions", {
      meetingId: emergencyMeetingId,
      movedById: jamesId,
      title: "Increase Annual Dues",
      description: "Motion to increase annual membership dues from $50 to $75 effective January 2025",
      status: "Voting",
      votesFor: 1,
      votesAgainst: 1,
      votesAbstain: 0,
      createdAt: 1714521600000,
      updatedAt: 1714521600000,
    });

    const motion3Id = await ctx.db.insert("motions", {
      meetingId: q2MeetingId,
      movedById: margaretId,
      title: "Hire Executive Director",
      description: "Motion to authorize the hiring committee to recruit a new Executive Director with a salary range of $80,000-$100,000",
      status: "Proposed",
      votesFor: 0,
      votesAgainst: 0,
      votesAbstain: 0,
      createdAt: 1717200000000,
      updatedAt: 1717200000000,
    });

    // ── Votes (for the passed motion) ──────────────────────
    await ctx.db.insert("votes", {
      motionId: motion1Id,
      memberId: jamesId,
      vote: "For",
      castAt: Date.now(),
      createdAt: 1711929600000,
    });

    await ctx.db.insert("votes", {
      motionId: motion1Id,
      memberId: sarahId,
      vote: "For",
      castAt: Date.now(),
      createdAt: 1711929600000,
    });

    await ctx.db.insert("votes", {
      motionId: motion1Id,
      memberId: robertId,
      vote: "For",
      castAt: Date.now(),
      createdAt: 1711929600000,
    });

    // ── Committees ─────────────────────────────────────────
    const financeCommitteeId = await ctx.db.insert("committees", {
      name: "Finance Committee",
      description: "Oversees financial planning, budgeting, and audit",
      purpose: "Review financial statements, develop annual budget, oversee audit process",
      chairId: jamesId,
      isActive: true,
      createdAt: 1704067200000,
      updatedAt: 1704067200000,
    });

    const governanceCommitteeId = await ctx.db.insert("committees", {
      name: "Governance Committee",
      description: "Ensures board operates effectively and ethically",
      purpose: "Review bylaws, recruit new board members, conduct board self-assessments",
      chairId: margaretId,
      isActive: true,
      createdAt: 1704067200000,
      updatedAt: 1704067200000,
    });

    const fundraisingCommitteeId = await ctx.db.insert("committees", {
      name: "Fundraising Committee",
      description: "Plans and executes fundraising initiatives",
      purpose: "Develop fundraising strategy, plan annual gala, cultivate major donors",
      chairId: robertId,
      isActive: true,
      createdAt: 1704067200000,
      updatedAt: 1704067200000,
    });

    // ── Committee Members ──────────────────────────────────
    await ctx.db.insert("committeeMembers", {
      committeeId: financeCommitteeId,
      userId: jamesId,
      role: "Chair",
      joinedAt: 1704067200000,
      createdAt: 1704067200000,
    });

    await ctx.db.insert("committeeMembers", {
      committeeId: financeCommitteeId,
      userId: emilyId,
      role: "Member",
      joinedAt: 1704067200000,
      createdAt: 1704067200000,
    });

    await ctx.db.insert("committeeMembers", {
      committeeId: governanceCommitteeId,
      userId: margaretId,
      role: "Chair",
      joinedAt: 1704067200000,
      createdAt: 1704067200000,
    });

    await ctx.db.insert("committeeMembers", {
      committeeId: governanceCommitteeId,
      userId: sarahId,
      role: "Member",
      joinedAt: 1704067200000,
      createdAt: 1704067200000,
    });

    await ctx.db.insert("committeeMembers", {
      committeeId: fundraisingCommitteeId,
      userId: robertId,
      role: "Chair",
      joinedAt: 1704067200000,
      createdAt: 1704067200000,
    });

    await ctx.db.insert("committeeMembers", {
      committeeId: fundraisingCommitteeId,
      userId: sarahId,
      role: "Member",
      joinedAt: 1704067200000,
      createdAt: 1704067200000,
    });

    // ── Action Items ───────────────────────────────────────
    await ctx.db.insert("actionItems", {
      meetingId: q2MeetingId,
      assigneeId: jamesId,
      title: "Prepare Q2 Financial Report",
      description: "Compile financial data and prepare presentation for Q2 board meeting",
      dueDate: 1719187200000,
      status: "InProgress",
      createdAt: 1717200000000,
      updatedAt: 1717200000000,
    });

    await ctx.db.insert("actionItems", {
      meetingId: emergencyMeetingId,
      assigneeId: margaretId,
      title: "Update Bylaws Draft",
      description: "Incorporate feedback from last meeting into bylaws revision",
      dueDate: 1716595200000,
      status: "Overdue",
      createdAt: 1714348800000,
      updatedAt: 1714348800000,
    });

    await ctx.db.insert("actionItems", {
      meetingId: q2MeetingId,
      assigneeId: robertId,
      title: "Schedule Annual Gala Venue",
      description: "Contact and book venue for the annual fundraising gala",
      dueDate: 1721865600000,
      status: "Open",
      createdAt: 1717200000000,
      updatedAt: 1717200000000,
    });

    await ctx.db.insert("actionItems", {
      meetingId: q1MeetingId,
      assigneeId: sarahId,
      title: "Complete Board Self-Assessment",
      description: "Fill out the annual board effectiveness survey",
      dueDate: 1718582400000,
      status: "Completed",
      completedAt: 1718496000000,
      createdAt: 1717200000000,
      updatedAt: 1718496000000,
    });

    // ── Documents ──────────────────────────────────────────
    await ctx.db.insert("documents", {
      uploadedById: margaretId,
      title: "Organization Bylaws v3.2",
      description: "Current bylaws of the organization",
      category: "Policy",
      fileUrl: "/placeholder/bylaws.pdf",
      fileSize: 245000,
      fileType: "application/pdf",
      version: 3,
      isConfidential: false,
      createdAt: 1704067200000,
      updatedAt: 1704067200000,
    });

    await ctx.db.insert("documents", {
      uploadedById: jamesId,
      meetingId: q1MeetingId,
      title: "Q1 2024 Financial Statements",
      description: "Quarterly financial report",
      category: "Financial",
      fileUrl: "/placeholder/q1-financials.pdf",
      fileSize: 512000,
      fileType: "application/pdf",
      version: 1,
      isConfidential: true,
      createdAt: 1711929600000,
      updatedAt: 1711929600000,
    });

    await ctx.db.insert("documents", {
      uploadedById: sarahId,
      meetingId: q1MeetingId,
      title: "Q1 Meeting Minutes",
      description: "Approved minutes from Q1 Board Meeting",
      category: "Minutes",
      fileUrl: "/placeholder/q1-minutes.pdf",
      fileSize: 128000,
      fileType: "application/pdf",
      version: 1,
      isConfidential: false,
      createdAt: 1712016000000,
      updatedAt: 1712016000000,
    });

    // ── Notifications ──────────────────────────────────────
    await ctx.db.insert("notifications", {
      userId: jamesId,
      type: "MeetingScheduled",
      title: "New Meeting Scheduled",
      message: "Q2 Board Meeting has been scheduled for July 1, 2024 at 2:00 PM",
      link: "/meetings",
      isRead: false,
      createdAt: 1717200000000,
    });

    await ctx.db.insert("notifications", {
      userId: robertId,
      type: "VoteRequired",
      title: "Your Vote is Needed",
      message: "A motion to increase annual dues requires your vote",
      link: "/meetings",
      isRead: false,
      createdAt: 1714521600000,
    });

    await ctx.db.insert("notifications", {
      userId: jamesId,
      type: "ActionItemAssigned",
      title: "New Action Item Assigned",
      message: "You have been assigned: Prepare Q2 Financial Report",
      link: "/action-items",
      isRead: true,
      createdAt: 1717200000000,
    });
  },
});