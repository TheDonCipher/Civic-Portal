import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

// Ensure environment variables are properly accessed
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Check if credentials are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase credentials not found. Please check your environment variables.",
  );
}

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Initialize realtime subscriptions
export const initializeRealtimeSubscriptions = () => {
  try {
    // Enable realtime subscriptions for the tables we need
    supabase
      .channel("public:issues")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "issues" },
        (payload) => {
          console.log("Issues change received:", payload);
        },
      )
      .subscribe((status) => {
        console.log(`Issues subscription status: ${status}`);
      });

    supabase
      .channel("public:comments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        (payload) => {
          console.log("Comments change received:", payload);
        },
      )
      .subscribe((status) => {
        console.log(`Comments subscription status: ${status}`);
      });

    supabase
      .channel("public:updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "updates" },
        (payload) => {
          console.log("Updates change received:", payload);
        },
      )
      .subscribe((status) => {
        console.log(`Updates subscription status: ${status}`);
      });

    supabase
      .channel("public:solutions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "solutions" },
        (payload) => {
          console.log("Solutions change received:", payload);
        },
      )
      .subscribe((status) => {
        console.log(`Solutions subscription status: ${status}`);
      });

    supabase
      .channel("public:issue_votes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "issue_votes" },
        (payload) => {
          console.log("Issue votes change received:", payload);
        },
      )
      .subscribe((status) => {
        console.log(`Issue votes subscription status: ${status}`);
      });

    supabase
      .channel("public:issue_watchers")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "issue_watchers" },
        (payload) => {
          console.log("Issue watchers change received:", payload);
        },
      )
      .subscribe((status) => {
        console.log(`Issue watchers subscription status: ${status}`);
      });

    supabase
      .channel("public:solution_votes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "solution_votes" },
        (payload) => {
          console.log("Solution votes change received:", payload);
        },
      )
      .subscribe((status) => {
        console.log(`Solution votes subscription status: ${status}`);
      });

    console.log("Realtime subscriptions initialized with event handlers");
  } catch (error) {
    console.error("Error initializing realtime subscriptions:", error);
  }
};

// Call this function when the app initializes
try {
  initializeRealtimeSubscriptions();
} catch (error) {
  console.error("Failed to initialize realtime subscriptions:", error);
}
