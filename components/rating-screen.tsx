"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"

interface RatingScreenProps {
  businessName: string
  onSubmit: (rating: number, comment: string) => void
}

export default function RatingScreen({ businessName, onSubmit }: RatingScreenProps) {
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
    <Card className="w-full max-w-md p-6 sm:p-8 text-center border-lime-200/30 bg-gradient-to-br from-lime-50 via-emerald-50 to-teal-50 shadow-xl">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-forest-900 mb-2 text-balance">Rate Your Experience</h1>
        <p className="text-forest-600 text-sm sm:text-base">
          with <span className="font-semibold text-lime-600">{businessName}</span>
        </p>
      </div>

      <div className="flex justify-center gap-2 my-8">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="transition-transform hover:scale-110 active:scale-95 p-1"
            type="button"
          >
            <Star
              className={`w-10 h-10 sm:w-12 sm:h-12 transition-colors ${
                (hoverRating || rating) >= star ? "text-lime-500 fill-lime-500" : "text-lime-200 fill-lime-100"
              }`}
            />
          </button>
        ))}
      </div>

      <Textarea
        placeholder="Share your thoughts (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="bg-white/60 backdrop-blur-sm border-lime-200/50 text-forest-900 placeholder-forest-400 min-h-[120px] rounded-2xl focus:border-lime-400 focus:ring-lime-400"
      />

      <Button
        onClick={handleSubmit}
        className="w-full h-12 sm:h-14 text-base sm:text-lg mt-6 bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-600 hover:to-emerald-600 text-white font-semibold rounded-2xl shadow-lg"
      >
        Submit Review
      </Button>
    </Card>
  )
}
