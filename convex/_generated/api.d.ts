/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actionItems from "../actionItems.js";
import type * as agendaItems from "../agendaItems.js";
import type * as ai from "../ai.js";
import type * as auditLogs from "../auditLogs.js";
import type * as committeeMembers from "../committeeMembers.js";
import type * as committees from "../committees.js";
import type * as crons from "../crons.js";
import type * as dashboard from "../dashboard.js";
import type * as documents from "../documents.js";
import type * as files from "../files.js";
import type * as helpers from "../helpers.js";
import type * as meetings from "../meetings.js";
import type * as motions from "../motions.js";
import type * as notifications from "../notifications.js";
import type * as qaCheck from "../qaCheck.js";
import type * as qaSetup from "../qaSetup.js";
import type * as seed from "../seed.js";
import type * as users from "../users.js";
import type * as votes from "../votes.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  actionItems: typeof actionItems;
  agendaItems: typeof agendaItems;
  ai: typeof ai;
  auditLogs: typeof auditLogs;
  committeeMembers: typeof committeeMembers;
  committees: typeof committees;
  crons: typeof crons;
  dashboard: typeof dashboard;
  documents: typeof documents;
  files: typeof files;
  helpers: typeof helpers;
  meetings: typeof meetings;
  motions: typeof motions;
  notifications: typeof notifications;
  qaCheck: typeof qaCheck;
  qaSetup: typeof qaSetup;
  seed: typeof seed;
  users: typeof users;
  votes: typeof votes;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
