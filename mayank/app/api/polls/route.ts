import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getAuthUser } from "@/lib/auth"
import { z } from "zod"

const pollSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  options: z
    .array(
      z.object({
        text: z.string().min(1, "Option text is required"),
      }),
    )
    .min(2, "At least 2 options are required")
    .max(5, "Maximum 5 options allowed"),
})

export async function POST(request: Request) {
  try {
    // Authenticate user
    const user = await getAuthUser(request)

    if (!user) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()

    // Validate input
    const result = pollSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: result.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { title, options } = result.data

    // Create poll with options
    const poll = await db.poll.create({
      data: {
        title,
        userId: user.id,
        options: {
          create: options.map((option) => ({
            text: option.text,
          })),
        },
      },
      include: {
        options: true,
      },
    })

    return NextResponse.json(poll, { status: 201 })
  } catch (error) {
    console.error("Create poll error:", error)
    return NextResponse.json({ message: "An error occurred while creating the poll" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // Get authenticated user (optional)
    const user = await getAuthUser(request)

    // Get polls with vote counts
    const polls = await db.poll.findMany({
      take: limit,
      skip,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        options: {
          select: {
            id: true,
            text: true,
            _count: {
              select: {
                votes: true,
              },
            },
          },
        },
        user: {
          select: {
            username: true,
          },
        },
        _count: {
          select: {
            votes: true,
          },
        },
        ...(user
          ? {
              votes: {
                where: {
                  userId: user.id,
                },
                select: {
                  optionId: true,
                },
              },
            }
          : {}),
      },
    })

    // Format polls for response
    const formattedPolls = polls.map((poll) => {
      const userVoted = user && poll.votes.length > 0 ? poll.votes[0].optionId : null

      return {
        id: poll.id,
        title: poll.title,
        createdAt: poll.createdAt,
        createdBy: poll.user,
        totalVotes: poll._count.votes,
        options: poll.options.map((option) => ({
          id: option.id,
          text: option.text,
          votes: option._count.votes,
        })),
        ...(userVoted ? { userVoted } : {}),
      }
    })

    // Get total count for pagination
    const totalPolls = await db.poll.count()

    return NextResponse.json({
      polls: formattedPolls,
      pagination: {
        total: totalPolls,
        page,
        limit,
        pages: Math.ceil(totalPolls / limit),
      },
    })
  } catch (error) {
    console.error("Get polls error:", error)
    return NextResponse.json({ message: "An error occurred while fetching polls" }, { status: 500 })
  }
}
