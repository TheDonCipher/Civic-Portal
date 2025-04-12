import { PostgrestError } from "@supabase/supabase-js";

// Define a custom type for count queries
export interface PostgrestCountQueryResult<T> {
  data: T[] | null;
  count: number | null;
  error: PostgrestError | null;
}
