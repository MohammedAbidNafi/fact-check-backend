import { createClient } from "@supabase/supabase-js";
import { response } from "express";

// Create a single supabase client for interacting with your database
const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.PUBLIC_ANON_KEY || ""
);

export const updateDb = async ({
  fact,
  response,
}: {
  fact: string;
  response: string | null;
}) => {
  const { data, error } = await supabase
    .from("facts")
    .insert({ fact: `${fact}`, response: `${response}` })
    .select("id");

  return data;
};

export const getFacts = async () => {
  const { data, error } = await supabase.from("facts").select("fact").limit(20);

  return data;
};
