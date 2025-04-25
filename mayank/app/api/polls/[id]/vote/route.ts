import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getAuthUser } from "@/lib/auth"
import { z } from "zod"

const voteSchema = z.object({
  optionId: z.string(),
})

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const pollId = params.id

    // Authenticate user
    const user = await getAuthUser(request)

    if (!user) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()

    // Validate input
    const result = voteSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: result.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { optionId } = result.data

    // Check if poll exists
    const poll = await db.poll.findUnique({
      where: { id: pollId },
      include: {
        options: true,
      },
    })

    if (!poll) {
      return NextResponse.json({ message: "Poll not found" }, { status: 404 })
    }

    // Check if option belongs to poll
    const option = poll.options.find((opt) => opt.id === optionId)
    if (!option) {
      return NextResponse.json({ message: "Invalid option for this poll" }, { status: 400 })
    }

    // Check if user has already voted
    const existingVote = await db.vote.findFirst({
      where: {
        pollId,
        userId: user.id,
      },
    })

    if (existingVote) {
      return NextResponse.json({ message: "You have already voted in this poll" }, { status: 409 })
    }

    // Create vote
    await db.vote.create({
      data: {
        pollId,
        optionId,
        userId: user.id,
      },
    })

    // Get updated poll with vote counts
    const updatedPoll = await db.poll.findUnique({
      where: { id: pollId },
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
        votes: {
          where: {
            userId: user.id,
          },
          select: {
            optionId: true,
          },
        },
      },
    })

    // Format poll for response
    const formattedPoll = {
      id: updatedPoll!.id,
      title: updatedPoll!.title,
      createdAt: updatedPoll!.createdAt,
      createdBy: {
        username: updatedPoll!.user.username,
      },
      totalVotes: updatedPoll!._count.votes,
      options: updatedPoll!.options.map((option) => ({
        id: option.id,
        text: option.text,
        votes: option._count.votes,
      })),
      userVoted: updatedPoll!.votes[0].optionId,
    }

    return NextResponse.json(formattedPoll)
  } catch (error) {
    console.error("Vote error:", error)
    return NextResponse.json({ message: "An error occurred while processing your vote" }, { status: 500 })
  }
}
