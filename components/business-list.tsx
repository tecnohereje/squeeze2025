'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

// Placeholder types
type Rating = {
  businessId: string;
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

interface BusinessListProps {
  // In a real app, we would pass a function to fetch the data
}

export default function BusinessList(props: BusinessListProps) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, this is where you would fetch the data
    // from your backend or JSON bin.
    const mockData: Business[] = [
      {
        id: '0xDEMO_WALLET_2',
        name: 'My Cool Cafe',
        avgRating: 4.5,
        ratings: [
          {
            businessId: '0xDEMO_WALLET_2',
            rating: 5,
            comment: 'Great coffee!',
            author: '0xDEMO_WALLET_1',
          },
          {
            businessId: '0xDEMO_WALLET_2',
            rating: 4,
            comment: 'Nice atmosphere.',
            author: '0xDEMO_WALLET_3',
          },
        ],
      },
    ];
    setBusinesses(mockData);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <p>Loading businesses...</p>;
  }

  return (
    <div className="w-full max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold text-slate-100 mb-4 text-center">
        Businesses
      </h1>
      {businesses.map((business) => (
        <Card
          key={business.id}
          className="p-6 border-slate-700 bg-slate-800/50"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-lemon-400">
              {business.name}
            </h2>
            <div className="text-xl font-bold text-yellow-400">
              ★ {business.avgRating.toFixed(1)}
            </div>
          </div>
          <div className="space-y-4">
            {business.ratings.map((rating, index) => (
              <div
                key={index}
                className="p-3 bg-slate-900/50 rounded-lg border border-slate-700"
              >
                <p className="text-slate-300">"{rating.comment}"</p>
                <p className="text-xs text-slate-500 mt-2">
                  - {rating.author.slice(0, 8)}...
                </p>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
