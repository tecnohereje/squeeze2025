"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, Loader2 } from "lucide-react"

interface RatingScreenProps {
  businessName: string
  onSubmit: (rating: number, comment: string) => void
  isSubmitting?: boolean
}

export default function RatingScreen({ businessName, onSubmit, isSubmitting = false }: RatingScreenProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")

  const handleSubmit = () => {
    if (rating === 0) {
      alert("Please select a rating.")
      return
    }
    onSubmit(rating, comment)
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] w-full">
      <Card className="w-full max-w-md p-6 sm:p-8 text-center border-lemon-200/30 bg-gradient-to-br from-lemon-50 via-yellow-50 to-orange-50 shadow-xl">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 text-balance">Rate Your Experience</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            with <span className="font-semibold text-primary">{businessName}</span>
          </p>
        </div>

        <div className="flex justify-center gap-2 my-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-110 active:scale-95 p-1 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
              disabled={isSubmitting}
            >
              <Star
                className={`w-10 h-10 sm:w-12 sm:h-12 transition-colors ${
                  (hoverRating || rating) >= star ? "text-yellow-500 fill-yellow-500" : "text-gray-300 fill-transparent"
                }`}
              />
            </button>
          ))}
        </div>

        <Textarea
          placeholder="Share your thoughts (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={isSubmitting}
          className="bg-white/60 backdrop-blur-sm border-lemon-200/50 text-foreground placeholder-muted-foreground min-h-[120px] rounded-2xl focus:border-primary focus:ring-primary disabled:opacity-50"
        />

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0}
          className="w-full h-12 sm:h-14 text-base sm:text-lg mt-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Review"
          )}
        </Button>
      </Card>
    </div>
  )
}
