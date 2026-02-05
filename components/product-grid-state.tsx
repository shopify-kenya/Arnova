"use client"

import Link from "next/link"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <GlassCard key={index} className="p-4 animate-pulse">
          <div className="h-48 bg-muted/50 rounded-lg mb-4" />
          <div className="h-4 bg-muted/50 rounded w-3/4 mb-2" />
          <div className="h-4 bg-muted/50 rounded w-1/2 mb-4" />
          <div className="h-8 bg-muted/50 rounded w-full" />
        </GlassCard>
      ))}
    </div>
  )
}

export function ProductGridEmpty({
  title = "No products found",
  description = "Try adjusting your filters or check back later.",
  actionHref = "/store",
  actionLabel = "Browse all products",
}: {
  title?: string
  description?: string
  actionHref?: string
  actionLabel?: string
}) {
  return (
    <GlassCard className="p-8 text-center">
      <h3 className="font-serif text-2xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      <Link href={actionHref}>
        <Button variant="gradient">{actionLabel}</Button>
      </Link>
    </GlassCard>
  )
}
