import { NextRequest } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { env } from "@/lib/env"
import crypto from "crypto"

function verifyJwt(token: string, secret: string): { sub: string; courseId: string; exp: number } | null {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split('.')
    if (!headerB64 || !payloadB64 || !signatureB64) return null
    const data = `${headerB64}.${payloadB64}`
    const expected = crypto.createHmac('sha256', secret).update(data).digest('base64url')
    if (expected !== signatureB64) return null
    const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf8')
    const payload = JSON.parse(payloadJson)
    if (typeof payload.exp === 'number' && Date.now() / 1000 > payload.exp) return null
    return payload
  } catch {
    return null
  }
}

// Hardened proxy: require signed token and restrict upstream hosts via allowlist
export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const url = request.nextUrl
  const token = url.searchParams.get('token') || ''
  const upstream = url.searchParams.get('upstream') // full upstream URL to m3u8/ts

  if (!token || !upstream) {
    return new Response('Bad request', { status: 400 })
  }

  const payload = verifyJwt(token, process.env.HLS_JWT_SECRET || 'default-secret')
  if (!payload) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Restrict upstream host
  let upstreamUrl: URL
  try {
    upstreamUrl = new URL(upstream)
  } catch {
    return new Response('Invalid upstream', { status: 400 })
  }
  const allowedHosts = (process.env.HLS_ALLOWED_HOSTS || 'localhost').split(',')
  const allowed = allowedHosts.includes(upstreamUrl.host)
  if (!allowed) {
    return new Response('Upstream not allowed', { status: 403 })
  }

  const { data: access } = await supabaseAdmin
    .from('course_access')
    .select('id')
    .eq('user_email', payload.sub)
    .eq('course_id', payload.courseId)
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
