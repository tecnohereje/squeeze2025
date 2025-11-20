'use client';

import { Card } from '@/components/ui/card';
import { Star } from 'lucide-react';

// Placeholder types
type Rating = {
  rating: number;
  comment: string;
  author: string;
};

type Business = {
  id: string;
  name: string;
  avgRating: number;
  ratings: Rating[];
};

interface BusinessDetailProps {
  business: Business;
}

export default function BusinessDetail({ business }: BusinessDetailProps) {
  return (
    <div className="w-full max-w-2xl space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-lemon-400">
          {business.name}
        </h1>
        <div className="text-2xl font-bold text-yellow-400 flex items-center">
          <Star className="w-6 h-6 mr-2" /> {business.avgRating.toFixed(1)}
        </div>
      </div>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-100 border-b border-slate-700 pb-2">
          Reviews
        </h2>
        {business.ratings.map((rating, index) => (
          <Card
            key={index}
            className="p-4 bg-slate-900/50 border border-slate-700"
          >
            <div className="flex items-center mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < rating.rating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-slate-600'
                  }`}
                />
              ))}
            </div>
            <p className="text-slate-300">"{rating.comment}"</p>
            <p className="text-xs text-slate-500 mt-2 text-right">
              - {rating.author.slice(0, 10)}...
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
