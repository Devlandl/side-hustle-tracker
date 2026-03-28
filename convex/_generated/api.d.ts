/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as crons from "../crons.js";
import type * as expenses from "../expenses.js";
import type * as goals from "../goals.js";
import type * as hustles from "../hustles.js";
import type * as incomeEntries from "../incomeEntries.js";
import type * as recurringIncome from "../recurringIncome.js";
import type * as reminders from "../reminders.js";
import type * as taxSettings from "../taxSettings.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  crons: typeof crons;
  expenses: typeof expenses;
  goals: typeof goals;
  hustles: typeof hustles;
  incomeEntries: typeof incomeEntries;
  recurringIncome: typeof recurringIncome;
  reminders: typeof reminders;
  taxSettings: typeof taxSettings;
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
