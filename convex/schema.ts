import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    role: v.union(v.literal('Admin'), v.literal('BoardMember'), v.literal('Staff')),
    title: v.optional(v.string()),
    termStart: v.optional(v.number()),
    termEnd: v.optional(v.number()),
    isActive: v.boolean(),
    lastLoginAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_clerkId', ['clerkId'])
    .index('by_email', ['email'])
    .index('by_role', ['role'])
    .index('by_isActive', ['isActive']),

  meetings: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    date: v.number(),
    startTime: v.string(),
    endTime: v.string(),
    location: v.string(),
    meetingType: v.union(v.literal('Regular'), v.literal('Special'), v.literal('Emergency'), v.literal('AnnualGeneral')),
    status: v.union(v.literal('Scheduled'), v.literal('InProgress'), v.literal('Completed'), v.literal('Cancelled')),
    minutesContent: v.optional(v.string()),
    minutesApproved: v.boolean(),
    minutesApprovedAt: v.optional(v.number()),
    createdById: v.id('users'),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_date', ['date'])
    .index('by_status', ['status'])
    .index('by_createdById', ['createdById'])
    .index('by_meetingType', ['meetingType']),

  agendaItems: defineTable({
    meetingId: v.id('meetings'),
    title: v.string(),
    description: v.optional(v.string()),
    presenter: v.optional(v.id('users')),
    sortOrder: v.number(),
    duration: v.number(),
    type: v.union(v.literal('Information'), v.literal('Discussion'), v.literal('Action'), v.literal('Vote')),
    status: v.union(v.literal('Pending'), v.literal('InProgress'), v.literal('Completed'), v.literal('Tabled'), v.literal('Deferred')),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_meetingId', ['meetingId'])
    .index('by_meetingId_sortOrder', ['meetingId', 'sortOrder']),

  motions: defineTable({
    meetingId: v.id('meetings'),
    agendaItemId: v.optional(v.id('agendaItems')),
    title: v.string(),
    description: v.string(),
    movedById: v.id('users'),
    secondedById: v.optional(v.id('users')),
    status: v.union(v.literal('Proposed'), v.literal('Seconded'), v.literal('Voting'), v.literal('Passed'), v.literal('Failed'), v.literal('Tabled'), v.literal('Withdrawn')),
    votesFor: v.number(),
    votesAgainst: v.number(),
    votesAbstain: v.number(),
    result: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_meetingId', ['meetingId'])
    .index('by_status', ['status'])
    .index('by_movedById', ['movedById']),

  votes: defineTable({
    motionId: v.id('motions'),
    memberId: v.id('users'),
    vote: v.union(v.literal('For'), v.literal('Against'), v.literal('Abstain')),
    castAt: v.number(),
    createdAt: v.number(),
  })
    .index('by_motionId', ['motionId'])
    .index('by_memberId', ['memberId'])
    .index('by_motionId_memberId', ['motionId', 'memberId']),

  documents: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    category: v.union(v.literal('Policy'), v.literal('Minutes'), v.literal('Financial'), v.literal('Legal'), v.literal('Strategic'), v.literal('General')),
    fileUrl: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
    uploadedById: v.id('users'),
    meetingId: v.optional(v.id('meetings')),
    version: v.number(),
    isConfidential: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_category', ['category'])
    .index('by_uploadedById', ['uploadedById'])
    .index('by_meetingId', ['meetingId'])
    .index('by_isConfidential', ['isConfidential']),

  committees: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    chairId: v.id('users'),
    purpose: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_chairId', ['chairId'])
    .index('by_isActive', ['isActive']),

  committeeMembers: defineTable({
    committeeId: v.id('committees'),
    userId: v.id('users'),
    role: v.union(v.literal('Chair'), v.literal('Member')),
    joinedAt: v.number(),
    createdAt: v.number(),
  })
    .index('by_committeeId', ['committeeId'])
    .index('by_userId', ['userId'])
    .index('by_committeeId_userId', ['committeeId', 'userId']),

  actionItems: defineTable({
    meetingId: v.id('meetings'),
    agendaItemId: v.optional(v.id('agendaItems')),
    title: v.string(),
    description: v.optional(v.string()),
    assigneeId: v.id('users'),
    dueDate: v.number(),
    status: v.union(v.literal('Open'), v.literal('InProgress'), v.literal('Completed'), v.literal('Overdue')),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_meetingId', ['meetingId'])
    .index('by_assigneeId', ['assigneeId'])
    .index('by_status', ['status'])
    .index('by_dueDate', ['dueDate']),

  notifications: defineTable({
    userId: v.id('users'),
    type: v.union(v.literal('MeetingScheduled'), v.literal('MeetingReminder'), v.literal('VoteRequired'), v.literal('DocumentShared'), v.literal('ActionItemAssigned'), v.literal('MinutesPublished'), v.literal('SystemAlert')),
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index('by_userId', ['userId'])
    .index('by_userId_isRead', ['userId', 'isRead']),

  auditLogs: defineTable({
    userId: v.id('users'),
    action: v.union(v.literal('Create'), v.literal('Update'), v.literal('Delete'), v.literal('StatusChange'), v.literal('Vote'), v.literal('Upload'), v.literal('Login')),
    entityType: v.string(),
    entityId: v.string(),
    details: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_userId', ['userId'])
    .index('by_entityType_entityId', ['entityType', 'entityId'])
    .index('by_createdAt', ['createdAt']),
});