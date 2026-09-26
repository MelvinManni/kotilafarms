// Sign-in, invite and user-change forms, shared by the pages and the API
import * as z from "zod/mini";
import { text } from "@/schemas/checks";

const role = z.enum(["owner", "manager", "recorder"], { error: "Choose a role." });

export const signInSchema = z.object({
  email: z.email({ error: "Enter the email an owner set up for you." }),
  password: z.string().check(z.minLength(1, "Enter your password.")),
});

export const inviteCreateSchema = z.object({
  name: text(200, { length: 1, message: "Enter their name." }),
  email: z.pipe(z.email({ error: "Enter a valid email address." }), z.transform((e) => e.toLowerCase())),
  role,
});

export const passwordSchema = z.string().check(z.minLength(10, "Use at least 10 characters."));

export const inviteAcceptSchema = z
  .object({ token: z.string().check(z.minLength(20)), password: passwordSchema, confirm: z.string() })
  .check(z.refine<{ password: string; confirm: string }>((v) => v.password === v.confirm, { message: "The two passwords don't match.", path: ["confirm"] }));

export const userUpdateSchema = z
  .object({ role: z.optional(role), active: z.optional(z.boolean()) })
  .check(z.refine<{ role?: string; active?: boolean }>((v) => v.role !== undefined || v.active !== undefined, { message: "Nothing to change." }));

export type SignInInput = z.infer<typeof signInSchema>;
export type InviteCreateInput = z.infer<typeof inviteCreateSchema>;
export type InviteAcceptInput = z.infer<typeof inviteAcceptSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
