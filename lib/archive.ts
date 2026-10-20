import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
export type LibraryItem = {
  status: string;
  favorite: boolean;
  rating?: number;
  added: string;
  episodes?: string[];
  updatedAt?: string;
  completedAt?: string;
  reminder?: string;
};
export type Memory = {
  id: string;
  film: string;
  title: string;
  text: string;
  date: string;
  emotion: string;
  people: string;
  rating: number;
  photo?: string;
};
export type Collection = { id: string; name: string; films: string[] };
export type Archive = {
  activity?: { id: string; film: string; action: string; date: string }[];
  watchTime?: Record<string, number>;
  providerHistory?: Record<string,string[]>;
  availabilityChanges?: { film:string; date:string; country:string }[];
  progress?: Record<string, number>;
  catalog?: import("./catalog").Film[];
  library: Record<string, LibraryItem>;
  top: string[];
  memories: Memory[];
  collections: Collection[];
  profile: { name: string; bio: string; four: string[]; avatar?: string; banner?: string; background?: string; accent?: string; location?: string; handle?: string; genres?: string[] };
  settings: {
    notifications?: boolean;
    motion: boolean;
    country: string;
    autoplay: boolean;
    visualTheme?: "cinema" | "storybook" | "kdrama";
    density?: "gallery" | "compact";
  };
  recent: string[];
};
export const seed: Archive = {
  library: {}, top: [], memories: [], collections: [],
  profile: { name: "Mi perfil", bio: "", four: [] },
  settings: { motion: true, country: "MX", autoplay: false, visualTheme: "cinema" }, recent: [],
};
// v2 starts without the old sample library. v1 remains available for explicit import.
export const storageKey = "afterscene.archive.v2";
const profileImage = z.string().max(3000000).regex(/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/).optional();
const id = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9-]+$/);
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((v) => !Number.isNaN(Date.parse(v + "T12:00:00")));
const unique = (v: string[]) => new Set(v).size === v.length;
const filmSchema = z
  .object({
    id,
    tmdb: z.number().int().min(0),
    type: z.enum(["movie", "tv"]),
    title: z.string().max(300),
    year: z.number(),
    category: z.enum(["Películas", "Series", "Anime", "K-dramas"]),
    genre: z.string(),
    duration: z.string(),
    score: z.number(),
    director: z.string(),
    country: z.string(),
    synopsis: z.string(),
    poster: z.string(),
    backdrop: z.string().optional(),
    trailer: z.string().optional(),
    cast: z.array(z.string()),
    color: z.string(),
    remote: z.boolean().optional(),
  })
  .passthrough();
const archiveSchema = z.object({
  library: z.record(
    id,
    z.object({
      status: z.enum(["planned", "watching", "completed", "paused", "dropped"]),
      favorite: z.boolean(),
      rating: z.number().min(0).max(10).optional(),
      added: date,
      episodes: z.array(z.string().max(20)).max(10000).optional(),
      updatedAt: z.string().datetime().optional(),
      completedAt: z.string().datetime().optional(),
      reminder: z.string().max(10).optional(),
    }),
  ),
  top: z.array(id).max(10).refine(unique),
  memories: z
    .array(
      z.object({
        id,
        film: id,
        title: z.string().min(1).max(100),
        text: z.string().min(1).max(6000),
        date,
        emotion: z.string().max(40),
        people: z.string().max(120),
        rating: z.number().min(0).max(10),
        photo: z
          .string()
          .max(3000000)
          .regex(/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/)
          .optional(),
      }),
    )
    .max(10000),
  collections: z
    .array(
      z.object({
        id,
        name: z.string().min(1).max(70),
        films: z.array(id).max(10000).refine(unique),
      }),
    )
    .max(1000),
  profile: z.object({
    name: z.string().min(1).max(45),
    bio: z.string().max(240),
    four: z.array(id).max(4).refine(unique),
    avatar: profileImage, banner: profileImage, background: profileImage,
    accent: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    location: z.string().max(80).optional(),
    handle: z.string().max(30).regex(/^[a-zA-Z0-9_.-]*$/).optional(),
    genres: z.array(z.string().max(40)).max(15).optional(),
  }),
  settings: z.object({
    motion: z.boolean(),
    country: z.enum(["MX", "ES", "AR", "CO", "US"]),
    autoplay: z.boolean(),
    visualTheme: z.enum(["cinema", "storybook", "kdrama"]).optional(),
    notifications: z.boolean().optional(),
    density: z.enum(["gallery", "compact"]).optional(),
  }),
  recent: z.array(z.string().max(150)).max(5),
  catalog: z.array(filmSchema).max(2000).optional(),
  progress: z.record(z.number().min(0)).optional(),
  watchTime: z.record(date, z.number().min(0)).optional(),
  providerHistory: z.record(z.array(z.string().max(200))).optional(),
  availabilityChanges: z.array(z.object({film:id,date:z.string().datetime(),country:z.string().max(3)})).max(50).optional(),
  activity: z.array(z.object({ id: z.string().max(100), film: id, action: z.string().max(100), date: z.string().datetime() })).max(2000).optional(),
});
export function isArchive(value: unknown): value is Archive {
  return archiveSchema.safeParse(value).success;
}
let client: SupabaseClient | null = null;
export async function getSupabase() {
  if (client) return client;
  const config: any = await fetch("/api/config").then((r) => r.json());
  if (config.supabaseUrl && config.supabaseKey) {
    const { createClient } = await import("@supabase/supabase-js");
    client = createClient(config.supabaseUrl, config.supabaseKey);
  }
  return client;
}
export async function getCloudArchive(userId: string) {
  const c = await getSupabase();
  if (!c) return null;
  const { data, error } = await c
    .from("user_archives")
    .select("data")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data?.data;
}
export async function saveCloudArchive(userId: string, data: Archive) {
  const c = await getSupabase();
  if (!c) return;
  const { error } = await c
    .from("user_archives")
    .upsert({ user_id: userId, data, updated_at: new Date().toISOString() });
  if (error) throw error;
}
