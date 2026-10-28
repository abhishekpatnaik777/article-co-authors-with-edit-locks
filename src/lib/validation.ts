import { z } from "zod";

export const signInSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const articleSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  body: z.string().trim().min(1, "Body is required."),
  coAuthorIds: z.array(z.string()).default([]),
});

export const lockSchema = z.object({
  clientId: z.string().min(1, "clientId is required."),
});