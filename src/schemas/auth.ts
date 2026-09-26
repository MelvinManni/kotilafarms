// Sign-in, invite and user-change forms, shared by the pages and the API
import { z } from "zod";

const role = z.enum(["owner", "manager", "recorder"], { error: "Choose a role." });

export const signInSchema = z.object({
  email: z.email({ error: "Enter the email an owner set up for you." }),
  password: z.string().min(1, "Enter your password."),
});

export const inviteCreateSchema = z.object({
  name: z.string().trim().min(1, "Enter their name."),
  email: z.email({ error: "Enter a valid email address." }).transform((e) => e.toLowerCase()),
  role,
});

export const passwordSchema = z.string().min(10, "Use at least 10 characters.");

export const inviteAcceptSchema = z
  .object({ token: z.string().min(20), password: passwordSchema, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { message: "The two passwords don't match.", path: ["confirm"] });

export const userUpdateSchema = z
  .object({ role: role.optional(), active: z.boolean().optional() })
  .refine((v) => v.role !== undefined || v.active !== undefined, { message: "Nothing to change." });

export type SignInInput = z.infer<typeof signInSchema>;
export type InviteCreateInput = z.infer<typeof inviteCreateSchema>;
export type InviteAcceptInput = z.infer<typeof inviteAcceptSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
