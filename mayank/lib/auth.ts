import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import { db } from "./db"

interface JwtPayload {
  id: string
  email: string
  username: string
}

export async function getAuthUser(request: Request | NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null
    }

    const token = authHeader.split(" ")[1]
    if (!token) {
      return null
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as JwtPayload

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        email: true,
      },
    })

    return user
  } catch (error) {
    console.error("Auth error:", error)
    return null
  }
}
