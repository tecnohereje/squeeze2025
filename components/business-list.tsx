"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Star, MapPin, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { BusinessProfile } from "@/lib/ledger"
import { getBusinesses } from "@/lib/ledger" // Import getBusinesses to fetch from JSONBin

interface BusinessListProps {
  onViewDetails: (business: BusinessProfile) => void
  onBack: () => void
}

export default function BusinessList({ onViewDetails, onBack }: BusinessListProps) {
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([])
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

  const filteredBusinesses = businesses.filter((business) =>
    business.name.toLowerCase().includes(searchQuery.toLowerCase()),
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
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full hover:bg-primary/10 hover:text-primary"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Discover
        </h2>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search businesses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-lime-gradient-subtle border-border/50 focus-visible:ring-primary/50 focus-visible:border-primary rounded-xl shadow-sm"
        />
      </div>

      <div className="grid gap-4">
        {filteredBusinesses.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No businesses found.</p>
        ) : (
          filteredBusinesses.map((business) => (
            <Card
              key={business.id}
              className="group cursor-pointer overflow-hidden border-border/50 bg-lime-gradient-subtle hover:bg-card transition-all hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30"
              onClick={() => onViewDetails(business)}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className="h-16 w-16 rounded-xl bg-lime-gradient-vibrant flex items-center justify-center text-2xl text-primary-foreground shadow-md group-hover:scale-105 transition-transform">
                  {business.name.charAt(0)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg leading-none group-hover:text-primary transition-colors">
                      {business.name}
                    </h3>
                    <div className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-0.5 rounded-full text-xs font-medium border border-primary/20">
                      <Star className="h-3 w-3 fill-current" />
                      <span>{business.avgRating.toFixed(1)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{business.category || "Crypto Merchant"}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
                    <MapPin className="h-3 w-3" />
                    <span>1.2 km away</span>
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
