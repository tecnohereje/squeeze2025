"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Star, CheckCircle2 } from "lucide-react"
import { db } from "@/lib/firebase"
import { ref, get } from "firebase/database"

interface RankedBusiness {
  id: string
  fantasyName: string
  category: string
  verified: boolean
  avgRating: number
  reviewCount: number
}

interface BusinessRankingsProps {
  onBack: () => void
  onViewBusiness?: (businessId: string) => void
}

export default function BusinessRankings({ onBack, onViewBusiness }: BusinessRankingsProps) {
  const [businesses, setBusinesses] = useState<RankedBusiness[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBusinessRankings = async () => {
      try {
        // Fetch all businesses
        const businessesRef = ref(db, "businesses")
        const snapshot = await get(businessesRef)

        if (!snapshot.exists()) {
          setBusinesses([])
          setIsLoading(false)
          return
        }

        const businessesData = snapshot.val()
        const rankedBusinesses: RankedBusiness[] = []

        // For each business, fetch reviews and calculate stats
        for (const [id, business] of Object.entries(businessesData)) {
          const businessData = business as any
          
          // Fetch reviews for this business
          const reviewsRef = ref(db, `businesses/${id}/reviews`)
          const reviewsSnapshot = await get(reviewsRef)

          let avgRating = 0
          let reviewCount = 0

          if (reviewsSnapshot.exists()) {
            const reviews = Object.values(reviewsSnapshot.val()) as any[]
            reviewCount = reviews.length
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
            avgRating = totalRating / reviewCount
          }

          rankedBusinesses.push({
            id,
            fantasyName: businessData.fantasyName,
            category: businessData.category,
            verified: businessData.verified || false,
            avgRating: Number(avgRating.toFixed(1)),
            reviewCount,
          })
        }

        // Sort by average rating (highest first), then by review count
        rankedBusinesses.sort((a, b) => {
          if (b.avgRating !== a.avgRating) {
            return b.avgRating - a.avgRating
          }
          return b.reviewCount - a.reviewCount
        })

        setBusinesses(rankedBusinesses)
      } catch (error) {
        console.error("Failed to fetch business rankings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBusinessRankings()
  }, [])

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
          Business Rankings
        </h2>
      </div>

      <div className="grid gap-4">
        {businesses.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No businesses found. Try seeding the database first.</p>
          </Card>
        ) : (
          businesses.map((business, index) => (
            <Card
              key={business.id}
              className={`group cursor-pointer overflow-hidden border-border/50 bg-lemon-gradient-subtle hover:bg-card transition-all hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 ${
                index === 0 ? "border-yellow-500/50 shadow-md" : ""
              }`}
              onClick={() => onViewBusiness?.(business.id)}
            >
              <CardContent className="p-4 flex items-start gap-4">
                {/* Rank Badge */}
                <div className={`h-12 w-12 rounded-xl ${
                  index === 0 ? "bg-gradient-to-br from-yellow-400 to-orange-500" :
                  index === 1 ? "bg-gradient-to-br from-gray-300 to-gray-400" :
                  index === 2 ? "bg-gradient-to-br from-amber-600 to-amber-700" :
                  "bg-lemon-gradient-vibrant"
                } flex items-center justify-center text-2xl font-bold text-white shadow-md shrink-0`}>
                  {index + 1}
                </div>

                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <h3 className="font-semibold text-lg leading-none group-hover:text-primary transition-colors truncate">
                        {business.fantasyName}
                      </h3>
                      {business.verified && (
                        <CheckCircle2 className="h-5 w-5 text-yellow-500 fill-yellow-500/20 shrink-0" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                      {business.category}
                    </span>
                    
                    {/* Star Rating */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(business.avgRating)
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300 fill-transparent"
                          }`}
                        />
                      ))}
                      <span className="ml-1 font-semibold text-foreground">
                        {business.avgRating > 0 ? business.avgRating.toFixed(1) : "N/A"}
                      </span>
                    </div>

                    <span className="text-muted-foreground">
                      ({business.reviewCount} {business.reviewCount === 1 ? "review" : "reviews"})
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
