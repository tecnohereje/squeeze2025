'use client';

import { Button } from '@/components/ui/button';

interface BusinessHubProps {
  onNavigate: (
    screen: 'generalSale' | 'specificSale' | 'catalogSale' | 'businessForm'
  ) => void;
}

export default function BusinessHub({ onNavigate }: BusinessHubProps) {
  return (
    <div className="w-full max-w-xs space-y-4">
      <Button
        onClick={() => onNavigate('generalSale')}
        className="w-full h-24 text-lg"
      >
        General Sale
      </Button>
      <Button
        onClick={() => onNavigate('specificSale')}
        className="w-full h-24 text-lg"
      >
        Specific Sale
      </Button>
      <Button
        onClick={() => onNavigate('catalogSale')}
        className="w-full h-24 text-lg"
      >
        Catalog Sale
      </Button>
      <Button
        onClick={() => onNavigate('businessForm')}
        variant="outline"
        className="w-full h-16 text-lg"
      >
        Edit Business
      </Button>
    </div>
  );
}
