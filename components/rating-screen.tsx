'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';

interface RatingScreenProps {
  businessName: string;
  onSubmit: (rating: number, comment: string) => void;
}

export default function RatingScreen({
  businessName,
  onSubmit,
}: RatingScreenProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (rating === 0) {
      alert('Please select a rating.');
      return;
    }
    onSubmit(rating, comment);
  };

  return (
    <Card className="w-full max-w-md p-8 text-center border-slate-700 bg-slate-800/50">
      <h1 className="text-2xl font-bold text-slate-100 mb-2">
        Rate your experience with {businessName}
      </h1>
      <div className="flex justify-center my-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-10 h-10 cursor-pointer ${
              (hoverRating || rating) >= star
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-slate-600'
            }`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
          />
        ))}
      </div>
      <Textarea
        placeholder="Leave a comment (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="bg-slate-900/50 border-slate-700 text-slate-100 placeholder-slate-600"
      />
      <Button onClick={handleSubmit} className="w-full h-12 text-lg mt-6">
        Submit Review
      </Button>
    </Card>
  );
}
