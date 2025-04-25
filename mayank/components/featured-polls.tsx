"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface Poll {
  id: string
  title: string
  totalVotes: number
  createdBy: {
    username: string
  }
  createdAt: string
}

export function FeaturedPolls() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const response = await fetch("/api/polls?limit=3")
        const data = await response.json()
        setPolls(data.polls)
      } catch (error) {
        console.error("Failed to fetch polls:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPolls()
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-[200px]">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/3" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-8 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (polls.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No polls available yet. Be the first to create one!</p>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {polls.map((poll) => (
        <Link key={poll.id} href={`/polls/${poll.id}`} className="block h-full">
          <Card className="h-full transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle className="line-clamp-2">{poll.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">Created by {poll.createdBy.username}</p>
              <Badge variant="secondary">
                {poll.totalVotes} {poll.totalVotes === 1 ? "vote" : "votes"}
              </Badge>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">Created {new Date(poll.createdAt).toLocaleDateString()}</p>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}
