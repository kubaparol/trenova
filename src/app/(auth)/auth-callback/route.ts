import { ProjectUrls } from "@/constants";
import { supabaseClient } from "@/db/supabase.server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();

  if (code) {
    const supabase = await supabaseClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  if (redirectTo) {
    console.log("Redirecting to: ", `${origin}${redirectTo}`);
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  return NextResponse.redirect(`${origin}${ProjectUrls.home}`);
}
