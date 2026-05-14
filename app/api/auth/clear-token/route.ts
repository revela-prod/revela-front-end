import { NextResponse } from "next/server"

export async function POST() {
  const isProd = process.env.NODE_ENV === "production"
  const response = NextResponse.json({ success: true })

  const expiredCookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    maxAge: 0,
    path: "/",
  }

  response.cookies.set("revela_token", "", expiredCookieOptions)
  response.cookies.set("revela_user", "", {
    ...expiredCookieOptions,
    httpOnly: false,
  })

  return response
}