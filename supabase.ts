import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// TypeScript type for an order row
export type Order = {
  id: number;
  name: string;
  phone: string;
  address: string;
  quantity: "20L" | "40L";
  floor: string;
  status: "pending" | "accepted" | "delivered";
  created_at: string;
};
