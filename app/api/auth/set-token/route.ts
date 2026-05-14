import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { accessToken, user } = await req.json()

  if (!accessToken) {
    return NextResponse.json({ error: "No token provided" }, { status: 400 })
  }

  const isProd = process.env.NODE_ENV === "production"
  const response = NextResponse.json({ success: true })

  response.cookies.set("revela_token", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })

  if (user) {
    response.cookies.set("revela_user", JSON.stringify(user), {
      httpOnly: false,
      secure: isProd,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })
  }

  return response
}