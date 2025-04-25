"use client"

import Link from "next/link"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { PollResults } from "@/components/poll-results"
import { Skeleton } from "@/components/ui/skeleton"

interface PollOption {
  id: string
  text: string
  votes: number
}

interface Poll {
  id: string
  title: string
  options: PollOption[]
  totalVotes: number
  createdBy: {
    username: string
  }
  createdAt: string
  userVoted?: string
}

export default function PollDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [poll, setPoll] = useState<Poll | null>(null)
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isVoting, setIsVoting] = useState(false)
  const { toast } = useToast()
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const response = await fetch(`/api/polls/${id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch poll")
        }
        const data = await response.json()
        setPoll(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load poll details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPoll()
  }, [id, toast])

  const handleVote = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to vote in polls",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (!selectedOption) {
      toast({
        title: "Selection required",
        description: "Please select an option to vote",
        variant: "destructive",
      })
      return
    }

    setIsVoting(true)
    try {
      const response = await fetch(`/api/polls/${id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ optionId: selectedOption }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to submit vote")
      }

      const updatedPoll = await response.json()
      setPoll(updatedPoll)

      toast({
        title: "Vote submitted",
        description: "Your vote has been recorded successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit vote",
        variant: "destructive",
      })
    } finally {
      setIsVoting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
            <Skeleton className="h-10 w-1/3 mt-6" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!poll) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Poll not found</h2>
        <p className="text-muted-foreground mt-2">The poll you're looking for doesn't exist or has been removed.</p>
        <Button asChild className="mt-6">
          <Link href="/polls">Browse Polls</Link>
        </Button>
      </div>
    )
  }

  const hasVoted = Boolean(poll.userVoted)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{poll.title}</h1>
        <Button variant="outline" asChild>
          <Link href="/polls">Back to Polls</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cast Your Vote</CardTitle>
          <CardDescription>
            Created by {poll.createdBy.username} on {new Date(poll.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasVoted ? (
            <div className="space-y-6">
              <div className="bg-muted p-4 rounded-md text-center">You have already voted in this poll.</div>
              <PollResults poll={poll} />
            </div>
          ) : (
            <div className="space-y-6">
              <RadioGroup value={selectedOption} onValueChange={setSelectedOption} className="space-y-3">
                {poll.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id} className="text-base">
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <Button onClick={handleVote} disabled={isVoting || !selectedOption} className="w-full sm:w-auto">
                {isVoting ? "Submitting..." : "Submit Vote"}
              </Button>
            </div>
          )}

          {hasVoted && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="font-medium mb-4">Poll Results</h3>
              <PollResults poll={poll} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
