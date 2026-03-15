import { NextResponse } from "next/server"

export const runtime = "edge"

export async function POST() {
  return NextResponse.json(
    { error: "GitHub 登录已启用，用户名注册已停用" },
    { status: 404 }
  )
}
