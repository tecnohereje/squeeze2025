"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Star, Calendar } from "lucide-react"
import { db } from "@/lib/firebase"
import { ref, get } from "firebase/database"

interface UserReview {
  businessId: string
  businessName: string
  rating: number
  comment: string
  timestamp: string
}

interface MyReviewsProps {
  wallet: string
  onBack: () => void
  onViewBusiness?: (businessId: string) => void
}

export default function MyReviews({ wallet, onBack, onViewBusiness }: MyReviewsProps) {
  const [reviews, setReviews] = useState<UserReview[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMyReviews = async () => {
      try {
        // Fetch all businesses to get their names
        const businessesRef = ref(db, "businesses")
        const businessesSnapshot = await get(businessesRef)

        if (!businessesSnapshot.exists()) {
          setReviews([])
          setIsLoading(false)
          return
        }

        const businessesData = businessesSnapshot.val()
        const userReviews: UserReview[] = []

        // For each business, fetch reviews and filter by user's wallet
        for (const [businessId, business] of Object.entries(businessesData)) {
          const businessData = business as any
          const reviewsRef = ref(db, `businesses/${businessId}/reviews`)
          const reviewsSnapshot = await get(reviewsRef)

          if (reviewsSnapshot.exists()) {
            const reviews = reviewsSnapshot.val()
            
            // Filter reviews by this user
            Object.entries(reviews).forEach(([reviewId, review]) => {
              const reviewData = review as any
              if (reviewData.author === wallet) {
                userReviews.push({
                  businessId,
                  businessName: businessData.fantasyName,
                  rating: reviewData.rating,
                  comment: reviewData.comment,
                  timestamp: reviewData.timestamp,
                })
              }
            })
          }
        }

        // Sort by timestamp (most recent first)
        userReviews.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )

        setReviews(userReviews)
      } catch (error) {
        console.error("Failed to fetch user reviews:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMyReviews()
  }, [wallet])

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full hover:bg-primary/10 hover:text-primary"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          My Reviews
        </h2>
      </div>

      <div className="grid gap-4">
        {reviews.length === 0 ? (
          <Card className="p-8 text-center bg-lemon-gradient-subtle">
            <div className="space-y-2">
              <p className="text-lg font-semibold text-foreground">No reviews yet</p>
              <p className="text-muted-foreground">
                Start exploring businesses and share your experiences!
              </p>
            </div>
          </Card>
        ) : (
          reviews.map((review, index) => (
            <Card
              key={`${review.businessId}-${index}`}
              className="group cursor-pointer overflow-hidden border-border/50 bg-lemon-gradient-subtle hover:bg-card transition-all hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30"
              onClick={() => onViewBusiness?.(review.businessId)}
            >
              <CardContent className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg leading-none group-hover:text-primary transition-colors truncate">
                      {review.businessName}
                    </h3>
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= review.rating
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300 fill-transparent"
                          }`}
                        />
                      ))}
                      <span className="ml-2 font-semibold text-foreground">
                        {review.rating}.0
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Calendar className="w-3 h-3" />
                    {formatDate(review.timestamp)}
                  </div>
                </div>

                {/* Comment */}
                {review.comment && (
                  <div className="bg-white/50 rounded-lg p-3 border border-border/50">
                    <p className="text-sm text-foreground italic">
                      "{review.comment}"
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {reviews.length > 0 && (
        <div className="text-center text-sm text-muted-foreground pt-2">
          {reviews.length} {reviews.length === 1 ? "review" : "reviews"} found
        </div>
      )}
    </div>
  )
}
