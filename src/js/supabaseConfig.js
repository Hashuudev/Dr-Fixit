import { createClient } from "@supabase/supabase-js";

// Supabase Setup

const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwdWFwenhuemtmdGZhaHVrcnhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTMzMzUxOTEsImV4cCI6MjAwODkxMTE5MX0.VFuABW_yaSKvRLBh633vVsx2MF-75hdViymCpM0OMRU";

const SUPABASE_URL = "https://qpuapzxnzkftfahukrxp.supabase.co";
export default supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
