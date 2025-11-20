'use client';

import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

interface PaymentSuccessProps {
  amount: string;
  businessName: string;
  onTimeout: () => void;
}

export default function PaymentSuccess({
  amount,
  businessName,
  onTimeout,
}: PaymentSuccessProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onTimeout();
    }, 3000); // Automatically redirect after 3 seconds

    return () => clearTimeout(timer);
  }, [onTimeout]);

  return (
    <div className="flex flex-col items-center justify-center text-center text-white">
      <CheckCircle className="w-24 h-24 text-green-400 mb-6" />
      <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
      <p className="text-lg text-slate-300">
        You paid ${amount} to {businessName}.
      </p>
    </div>
  );
}
