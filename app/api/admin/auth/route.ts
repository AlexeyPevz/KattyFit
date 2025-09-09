import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Simple static credentials for MVP; in v0 this can be wired to Supabase/Auth later
    const expectedUser = process.env.ADMIN_USERNAME || "KattyFit"
    const expectedPass = process.env.ADMIN_PASSWORD || "admin123"

    if (username === expectedUser && password === expectedPass) {
      const res = NextResponse.json({ success: true })
      res.cookies.set("admin_auth", "1", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 8, // 8 hours
      })
      return res
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  } catch (e) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 })
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.set("admin_auth", "", { path: "/", maxAge: 0 })
  return res
}
