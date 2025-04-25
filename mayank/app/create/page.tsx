"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { Trash2 } from "lucide-react"
import Link from "next/link"

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

type PollFormValues = z.infer<typeof pollSchema>

export default function CreatePollPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated, user } = useAuth()

  const form = useForm<PollFormValues>({
    resolver: zodResolver(pollSchema),
    defaultValues: {
      title: "",
      options: [{ text: "" }, { text: "" }],
    },
  })

  const { fields, append, remove } = form.useFieldArray({
    name: "options",
  })

  async function onSubmit(data: PollFormValues) {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to create polls",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/polls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to create poll")
      }

      toast({
        title: "Poll created",
        description: "Your poll has been created successfully",
      })

      router.push(`/polls/${result.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create poll",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addOption = () => {
    if (fields.length < 5) {
      append({ text: "" })
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create a New Poll</CardTitle>
          <CardDescription>Create a poll with up to 5 options for others to vote on</CardDescription>
        </CardHeader>
        <CardContent>
          {!isAuthenticated ? (
            <div className="text-center py-6 space-y-4">
              <h3 className="text-lg font-medium">Authentication Required</h3>
              <p className="text-muted-foreground">You need to be logged in to create polls</p>
              <Button asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Poll Question</FormLabel>
                      <FormControl>
                        <Input placeholder="What's your favorite programming language?" {...field} />
                      </FormControl>
                      <FormDescription>Make your question clear and specific</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <FormLabel>Poll Options</FormLabel>
                    <Button type="button" variant="outline" size="sm" onClick={addOption} disabled={fields.length >= 5}>
                      Add Option
                    </Button>
                  </div>

                  {fields.map((field, index) => (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={`options.${index}.text`}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input placeholder={`Option ${index + 1}`} {...field} />
                            </FormControl>
                            {fields.length > 2 && (
                              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}

                  {form.formState.errors.options?.message && (
                    <p className="text-sm font-medium text-destructive">{form.formState.errors.options.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating poll..." : "Create Poll"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
