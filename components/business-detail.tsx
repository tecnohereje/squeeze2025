"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, ArrowLeft, User, Globe, MapPin, X } from "lucide-react"
import type { BusinessProfile } from "@/lib/ledger"
import { useState } from "react"

interface BusinessDetailProps {
  business: BusinessProfile
  onBack: () => void
}

const businessLocations: Record<string, { lat: number; lng: number; address: string }> = {
  "0xDEMO_WALLET_2": {
    lat: 40.758,
    lng: -73.9855,
    address: "123 Broadway, New York, NY 10001",
  },
  "0xDEMO_WALLET_4": {
    lat: 34.0522,
    lng: -118.2437,
    address: "456 Sunset Blvd, Los Angeles, CA 90028",
  },
  "0xDEMO_WALLET_5": {
    lat: 37.7749,
    lng: -122.4194,
    address: "789 Market St, San Francisco, CA 94103",
  },
  "0xDEMO_WALLET_6": {
    lat: 41.8781,
    lng: -87.6298,
    address: "321 Michigan Ave, Chicago, IL 60601",
  },
}

export default function BusinessDetail({ business, onBack }: BusinessDetailProps) {
  const [showMap, setShowMap] = useState(false)

  const location = businessLocations[business.id] || {
    lat: 40.7128,
    lng: -74.006,
    address: "Location not specified",
  }

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

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="flex flex-col items-center h-auto py-3 gap-1 rounded-xl border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/50 bg-lime-gradient-subtle transition-all"
          onClick={() => window.open(`https://${business.name.toLowerCase().replace(/\s+/g, "")}.com`, "_blank")}
        >
          <Globe className="h-5 w-5" />
          <span className="text-xs">Website</span>
        </Button>
        <Button
          variant="outline"
          className="flex flex-col items-center h-auto py-3 gap-1 rounded-xl border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/50 bg-lime-gradient-subtle transition-all"
          onClick={() => setShowMap(true)}
        >
          <MapPin className="h-5 w-5" />
          <span className="text-xs">Location</span>
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight px-1 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Reviews
        </h3>
        <div className="grid gap-3">
          {business.ratings.map((review, index) => (
            <Card
              key={`${review.author}-${review.timestamp || index}`}
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
                      <Star key={`star-${index}-${i}`} className="h-3 w-3 fill-current" />
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

      {showMap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-2xl mx-4 h-[70vh] bg-background rounded-2xl shadow-2xl overflow-hidden border-2 border-primary/20 animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 left-0 right-0 z-10 bg-lime-gradient-vibrant px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary-foreground" />
                <h3 className="font-semibold text-primary-foreground">{business.name}</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMap(false)}
                className="rounded-full hover:bg-background/20 text-primary-foreground"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="pt-14 h-full flex flex-col">
              <div className="flex-1">
                <iframe
                  src={`https://www.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Map showing ${business.name} location`}
                />
              </div>
              <div className="bg-card border-t border-border/50 p-4">
                <p className="text-sm text-muted-foreground flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>{location.address}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
