import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getAuthUser } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Get authenticated user (optional)
    const user = await getAuthUser(request)

    // Get poll with vote counts
    const poll = await db.poll.findUnique({
      where: { id },
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

    if (!poll) {
      return NextResponse.json({ message: "Poll not found" }, { status: 404 })
    }

    // Format poll for response
    const userVoted = user && poll.votes.length > 0 ? poll.votes[0].optionId : null

    const formattedPoll = {
      id: poll.id,
      title: poll.title,
      createdAt: poll.createdAt,
      createdBy: {
        username: poll.user.username,
      },
      totalVotes: poll._count.votes,
      options: poll.options.map((option) => ({
        id: option.id,
        text: option.text,
        votes: option._count.votes,
      })),
      ...(userVoted ? { userVoted } : {}),
    }

    return NextResponse.json(formattedPoll)
  } catch (error) {
    console.error("Get poll error:", error)
    return NextResponse.json({ message: "An error occurred while fetching the poll" }, { status: 500 })
  }
}
