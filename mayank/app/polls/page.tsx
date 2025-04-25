import { PollsList } from "@/components/polls-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PollsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">All Polls</h1>
        <Button asChild>
          <Link href="/create">Create Poll</Link>
        </Button>
      </div>
      <PollsList />
    </div>
  )
}
