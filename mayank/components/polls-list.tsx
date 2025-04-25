"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Poll {
  id: string
  title: string
  totalVotes: number
  createdBy: {
    username: string
  }
  createdAt: string
  userVoted?: string
}

interface PaginationData {
  total: number
  page: number
  limit: number
  pages: number
}

export function PollsList() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  const fetchPolls = async (page = 1) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/polls?page=${page}&limit=10`)
      const data = await response.json()
      setPolls(data.polls)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Failed to fetch polls:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPolls()
  }, [])

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      fetchPolls(newPage)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-9 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (polls.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground mb-4">No polls available yet.</p>
        <Button asChild>
          <Link href="/create">Create Your First Poll</Link>
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {polls.map((poll) => (
          <Card key={poll.id}>
            <CardHeader>
              <CardTitle className="text-xl">{poll.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Created by {poll.createdBy.username} on {new Date(poll.createdAt).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {poll.totalVotes} {poll.totalVotes === 1 ? "vote" : "votes"}
                  </Badge>
                  {poll.userVoted && (
                    <Badge variant="outline" className="bg-primary/10">
                      You voted
                    </Badge>
                  )}
                </div>
              </div>
              <Button asChild>
                <Link href={`/polls/${poll.id}`}>{poll.userVoted ? "View Results" : "Vote Now"}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
