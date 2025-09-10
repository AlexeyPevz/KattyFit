import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Get credentials from environment variables
    const expectedUser = process.env.ADMIN_USERNAME || "KattyFit"
    const expectedPass = process.env.ADMIN_PASSWORD || "admin123"

    // Log for debugging (remove in production)
    console.log("Admin auth attempt:", { 
      provided: { username, password: password ? "***" : "empty" },
      expected: { username: expectedUser, password: expectedPass ? "***" : "empty" }
    })

    if (username === expectedUser && password === expectedPass) {
      const res = NextResponse.json({ 
        success: true, 
        username: username,
        message: "Успешная аутентификация" 
      })
      res.cookies.set("admin_auth", "1", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 8, // 8 hours
      })
      return res
    }

    return NextResponse.json({ 
      error: "Неверный логин или пароль",
      details: "Проверьте правильность введенных данных"
    }, { status: 401 })
  } catch (e) {
    console.error("Admin auth error:", e)
    return NextResponse.json({ 
      error: "Ошибка сервера",
      details: "Попробуйте еще раз позже"
    }, { status: 400 })
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.set("admin_auth", "", { path: "/", maxAge: 0 })
  return res
}
