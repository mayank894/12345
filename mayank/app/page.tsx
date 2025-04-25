import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FeaturedPolls } from "@/components/featured-polls"

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="py-12 md:py-24 text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">Create and Vote in Public Polls</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Create polls, share your opinion, and see what others think in real-time.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/polls">Browse Polls</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/create">Create a Poll</Link>
          </Button>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Featured Polls</h2>
          <Button asChild variant="ghost">
            <Link href="/polls">View all</Link>
          </Button>
        </div>
        <FeaturedPolls />
      </section>

      <section className="py-12 space-y-8">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-4 text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
              <span className="text-xl font-bold">1</span>
            </div>
            <h3 className="text-xl font-semibold">Create an Account</h3>
            <p className="text-muted-foreground">Sign up to create polls and track your voting history.</p>
          </div>
          <div className="space-y-4 text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
              <span className="text-xl font-bold">2</span>
            </div>
            <h3 className="text-xl font-semibold">Create or Vote</h3>
            <p className="text-muted-foreground">Create polls with up to 5 options or vote in existing polls.</p>
          </div>
          <div className="space-y-4 text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
              <span className="text-xl font-bold">3</span>
            </div>
            <h3 className="text-xl font-semibold">See Results</h3>
            <p className="text-muted-foreground">View real-time results after casting your vote.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
