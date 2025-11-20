"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, ArrowLeft, User, Globe, Phone, Share2 } from "lucide-react"
import type { BusinessProfile } from "@/lib/ledger"

interface BusinessDetailProps {
  business: BusinessProfile
  onBack: () => void
}

export default function BusinessDetail({ business, onBack }: BusinessDetailProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative -mx-4 -mt-6 bg-lime-gradient-vibrant px-4 pb-6 pt-12 md:mx-0 md:mt-0 md:rounded-2xl md:pt-6 shadow-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="absolute left-4 top-4 rounded-full bg-background/90 hover:bg-background backdrop-blur-sm border border-border/50"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex flex-col items-center text-center space-y-3 mt-4">
          <div className="h-24 w-24 rounded-2xl bg-background shadow-xl flex items-center justify-center text-4xl border-4 border-background/50 backdrop-blur-sm">
            {business.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-primary-foreground">{business.name}</h2>
            <p className="text-primary-foreground/80 font-medium">Crypto Merchant</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full px-3 py-1 text-sm font-normal bg-background/90 backdrop-blur-sm border border-background/50 shadow-sm">
              <Star className="mr-1 h-3 w-3 fill-primary text-primary" />
              <span className="text-foreground">{business.avgRating.toFixed(1)}</span>
              <span className="text-muted-foreground">({business.ratings.length} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Button
          variant="outline"
          className="flex flex-col items-center h-auto py-3 gap-1 rounded-xl border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/50 bg-lime-gradient-subtle transition-all"
        >
          <Globe className="h-5 w-5" />
          <span className="text-xs">Website</span>
        </Button>
        <Button
          variant="outline"
          className="flex flex-col items-center h-auto py-3 gap-1 rounded-xl border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/50 bg-lime-gradient-subtle transition-all"
        >
          <Phone className="h-5 w-5" />
          <span className="text-xs">Call</span>
        </Button>
        <Button
          variant="outline"
          className="flex flex-col items-center h-auto py-3 gap-1 rounded-xl border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/50 bg-lime-gradient-subtle transition-all"
        >
          <Share2 className="h-5 w-5" />
          <span className="text-xs">Share</span>
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight px-1 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Reviews
        </h3>
        <div className="grid gap-3">
          {business.ratings.map((review, index) => (
            <Card
              key={index}
              className="border-border/50 bg-lime-gradient-subtle shadow-sm hover:shadow-md hover:shadow-primary/5 transition-shadow"
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                      <User className="h-3 w-3 text-primary" />
                    </div>
                    <span className="font-medium text-sm">{review.author.slice(0, 6)}...</span>
                  </div>
                  <div className="flex items-center text-primary">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">"{review.comment}"</p>
                <p className="text-xs text-muted-foreground/50 pt-1">
                  {review.timestamp ? new Date(review.timestamp).toLocaleDateString() : "Recently"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
