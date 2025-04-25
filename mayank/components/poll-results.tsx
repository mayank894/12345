import { Progress } from "@/components/ui/progress"

interface PollOption {
  id: string
  text: string
  votes: number
}

interface Poll {
  options: PollOption[]
  totalVotes: number
  userVoted?: string
}

export function PollResults({ poll }: { poll: Poll }) {
  return (
    <div className="space-y-4">
      {poll.options.map((option) => {
        const percentage = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0

        const isUserVote = option.id === poll.userVoted

        return (
          <div key={option.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{option.text}</span>
                {isUserVote && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Your vote</span>
                )}
              </div>
              <span className="text-sm font-medium">
                {percentage}% ({option.votes})
              </span>
            </div>
            <Progress value={percentage} className={`h-2 ${isUserVote ? "bg-muted" : ""}`} />
          </div>
        )
      })}
      <div className="text-sm text-muted-foreground text-right pt-2">Total votes: {poll.totalVotes}</div>
    </div>
  )
}
