"use client"

import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  return (
    <main className="container mx-auto max-w-md px-4 py-16">
      <h1 className="mb-2 text-3xl font-bold">Forgot password</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Enter your account email and we&apos;ll help you reset your password.
      </p>

      {submitted ? (
        <div className="space-y-4 rounded-lg border p-4">
          <p className="text-sm">
            If an account exists for{" "}
            <span className="font-medium">{email}</span>, a reset link will be
            sent.
          </p>
          <Link href="/login" className="text-sm underline">
            Back to login
          </Link>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={event => {
            event.preventDefault()
            setSubmitted(true)
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <Button type="submit" className="w-full">
            Send reset link
          </Button>
        </form>
      )}
    </main>
  )
}
