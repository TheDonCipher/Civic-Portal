import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// Initialize the Supabase client
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://rygyecrhevzrtfjtkfwf.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5Z3llY3JoZXZ6cnRmanRrZndmIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTM0MjQwMDAsImV4cCI6MjAwOTAwMDAwMH0.ZPiA-injdTw7-Y3cO41-jPEKIrJRJ2-a-sDYJOaBgLw";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase URL or Anon Key is missing. Please check your environment variables.",
  );
  console.log("Available env vars:", import.meta.env);
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      "x-application-name": "civic-portal",
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
