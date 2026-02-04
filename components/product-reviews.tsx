"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { GlassCard } from "@/components/glass-card"
import { toast } from "sonner"
import { graphqlRequest } from "@/lib/graphql-client"

interface Review {
  id: number
  user: string
  rating: number
  comment: string
  createdAt: string
}

interface ProductReviewsProps {
  productId: string
  reviews: Review[]
  averageRating: number
  isAuthenticated: boolean
  onReviewAdded: () => void
}

export function ProductReviews({
  productId,
  reviews,
  averageRating,
  isAuthenticated,
  onReviewAdded,
}: ProductReviewsProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      toast.error("Please login to leave a review")
      return
    }

    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }

    setIsSubmitting(true)
    try {
      await graphqlRequest<{
        submitReview: { success: boolean; message?: string }
      }>(
        `
        mutation SubmitReview($productId: Int!, $rating: Int!, $comment: String!) {
          submitReview(productId: $productId, rating: $rating, comment: $comment) {
            success
            message
          }
        }
        `,
        { productId: Number(productId), rating, comment }
      )
      toast.success("Review submitted successfully!")
      setRating(0)
      setComment("")
      onReviewAdded()
    } catch {
      toast.error("Failed to submit review")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>

        <div className="flex items-center gap-4 mb-6">
          <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
          <div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= averageRating
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {isAuthenticated && (
          <form onSubmit={handleSubmit} className="space-y-4 border-t pt-6">
            <h3 className="font-semibold">Write a Review</h3>

            <div>
              <label className="block text-sm font-medium mb-2">
                Your Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoverRating || rating)
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Your Review
              </label>
              <Textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
                className="glass min-h-[100px]"
                rows={4}
              />
            </div>

            <Button type="submit" variant="gradient" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        )}
      </GlassCard>

      {reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map(review => (
            <GlassCard key={review.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold">{review.user}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              {review.comment && (
                <p className="text-muted-foreground">{review.comment}</p>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  )
}
