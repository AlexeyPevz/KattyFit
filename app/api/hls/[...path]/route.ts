import { NextRequest } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

// Very simple proxy that checks access via email+courseId query and then fetches upstream HLS resource
export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const url = new URL(request.url)
  const courseId = url.searchParams.get('courseId')
  const email = url.searchParams.get('email')
  const upstream = url.searchParams.get('upstream') // full upstream URL to m3u8/ts

  if (!courseId || !email || !upstream) {
    return new Response('Bad request', { status: 400 })
  }

  const { data: access } = await supabaseAdmin
    .from('course_access')
    .select('id')
    .eq('user_email', email)
    .eq('course_id', courseId)
    .is('revoked_at', null)
    .maybeSingle()

  if (!access) {
    return new Response('Forbidden', { status: 403 })
  }

  const upstreamRes = await fetch(upstream, {
    headers: {
      // Optionally forward range/user-agent/etc
      'User-Agent': request.headers.get('user-agent') || 'KattyFit-HLS-Proxy',
      'Range': request.headers.get('range') || '',
      'Accept': request.headers.get('accept') || '*/*',
    },
  })

  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
    headers: {
      'Content-Type': upstreamRes.headers.get('content-type') || 'application/octet-stream',
      'Cache-Control': 'no-store',
      'Accept-Ranges': upstreamRes.headers.get('accept-ranges') || 'bytes',
    },
  })
}

