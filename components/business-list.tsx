"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Search, CheckCircle2, TrendingUp, MessageSquare } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { Business } from "@/lib/business-service"
import { getBusinesses } from "@/lib/business-service"

interface BusinessListProps {
  onViewDetails: (business: Business) => void
  onBack: () => void
  hiddenBusinessIds?: string[]
  onNavigateToRankings?: () => void
  onNavigateToMyReviews?: () => void
}

export default function BusinessList({ onViewDetails, onBack, hiddenBusinessIds = [], onNavigateToRankings, onNavigateToMyReviews }: BusinessListProps) {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const data = await getBusinesses()
        setBusinesses(data)
      } catch (error) {
        console.error("Failed to fetch businesses:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchBusinesses()
  }, [])

  const filteredBusinesses = businesses
    .filter((business) => !hiddenBusinessIds.includes(business.id))
    .filter((business) =>
      business.fantasyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

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
        {/* Back button removed as this is now the main screen, but kept prop for compatibility if needed later */}
        {/* <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full hover:bg-primary/10 hover:text-primary"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button> */}
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Discover Businesses
        </h2>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search businesses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-lemon-gradient-subtle border-border/50 focus-visible:ring-primary/50 focus-visible:border-primary rounded-xl shadow-sm"
        />
      </div>

      {/* Navigation Buttons */}
      {(onNavigateToRankings || onNavigateToMyReviews) && (
        <div className="grid grid-cols-2 gap-3">
          {onNavigateToRankings && (
            <Button
              onClick={onNavigateToRankings}
              variant="outline"
              className="h-auto py-3 px-4 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200/50 hover:border-yellow-300 hover:bg-yellow-100/50 rounded-xl"
            >
              <div className="flex items-center gap-2 w-full">
                <TrendingUp className="h-5 w-5 text-yellow-600" />
                <div className="flex-1 text-left">
                  <div className="font-semibold text-sm text-foreground">Rankings</div>
                  <div className="text-xs text-muted-foreground">View all businesses</div>
                </div>
              </div>
            </Button>
          )}
          
          {onNavigateToMyReviews && (
            <Button
              onClick={onNavigateToMyReviews}
              variant="outline"
              className="h-auto py-3 px-4 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200/50 hover:border-yellow-300 hover:bg-yellow-100/50 rounded-xl"
            >
              <div className="flex items-center gap-2 w-full">
                <MessageSquare className="h-5 w-5 text-yellow-600" />
                <div className="flex-1 text-left">
                  <div className="font-semibold text-sm text-foreground">My Reviews</div>
                  <div className="text-xs text-muted-foreground">Your submitted reviews</div>
                </div>
              </div>
            </Button>
          )}
        </div>
      )}

      <div className="grid gap-4">
        {filteredBusinesses.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No businesses found.</p>
        ) : (
          filteredBusinesses.map((business) => (
            <Card
              key={business.id}
              className="group cursor-pointer overflow-hidden border-border/50 bg-lemon-gradient-subtle hover:bg-card transition-all hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30"
              onClick={() => onViewDetails(business)}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className="h-16 w-16 rounded-xl bg-lemon-gradient-vibrant flex items-center justify-center text-2xl text-primary-foreground shadow-md group-hover:scale-105 transition-transform shrink-0">
                  {business.fantasyName.charAt(0)}
                </div>
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-lg leading-none group-hover:text-primary transition-colors truncate">
                      {business.fantasyName}
                    </h3>
                    {business.verified && (
                      <CheckCircle2 className="h-10 w-10 text-yellow-500 fill-yellow-500/20 shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{business.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                      {business.category}
                    </span>
                    <div className="flex items-center gap-1 truncate">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{business.location.address}</span>
                    </div>
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
