import { z } from "zod";
import { isSafePublicUrl } from "./request-security";

const safeUrl = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .refine(isSafePublicUrl, "Only http(s) URLs are allowed.");

const linkSchema = z.object({
  type: z.string().trim().min(1).max(20),
  label: z.string().trim().max(60),
  url: safeUrl(300),
});

const productSchema = z.object({
  title: z.string().trim().max(80),
  price: z.string().trim().max(30),
  url: safeUrl(300),
  image: safeUrl(500),
  desc: z.string().trim().max(300),
});

export const cardPatchSchema = z.object({
  brandName: z.string().trim().max(80),
  headline: z.string().trim().max(120),
  bio: z.string().trim().max(1000),
  avatarUrl: safeUrl(500),
  coverUrl: safeUrl(500),
  phone: z.string().trim().max(40),
  email: z.string().trim().max(120).refine((value) => !value || z.string().email().safeParse(value).success, "Invalid email."),
  website: safeUrl(200),
  address: z.string().trim().max(200),
  theme: z.object({
    preset: z.enum(["snow", "linen", "sky", "mint", "blush", "midnight", "ocean", "forest", "sunset", "mono"]),
    accent: z.string().regex(/^#[0-9a-f]{6}$/i),
  }),
  links: z.array(linkSchema).max(25),
  products: z.array(productSchema).max(25),
  leadFormEnabled: z.boolean(),
  published: z.boolean(),
});

export const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(200),
  name: z.string().trim().max(80),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(200),
});

export const leadPayloadSchema = z.object({
  slug: z.string().trim().min(1).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i, "Invalid card."),
  name: z.string().trim().max(80).default(""),
  email: z.string().trim().max(120).refine((value) => !value || z.string().email().safeParse(value).success, "Invalid email.").default(""),
  phone: z.string().trim().max(40).default(""),
  note: z.string().trim().max(500).default(""),
}).superRefine((value, ctx) => {
  if (!value.email && !value.phone) {
    ctx.addIssue({ code: "custom", path: ["email"], message: "Email or phone required." });
  }
});

export function parseCardPatch(value: unknown) {
  return cardPatchSchema.partial().safeParse(value);
}

export function parseLeadPayload(value: unknown) {
  return leadPayloadSchema.safeParse(value);
}
