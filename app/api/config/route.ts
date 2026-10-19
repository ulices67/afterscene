import { setting } from "@/lib/server-config";
export async function GET() {
  return Response.json(
    {
      supabaseUrl: setting("NEXT_PUBLIC_SUPABASE_URL"),
      supabaseKey: setting("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
      tmdb: !!setting("TMDB_READ_ACCESS_TOKEN"),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
