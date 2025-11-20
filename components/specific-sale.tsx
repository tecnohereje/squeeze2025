'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SpecificSaleProps {
  businessName: string;
  wallet: string;
}

export default function SpecificSale({
  businessName,
  wallet,
}: SpecificSaleProps) {
  const [amount, setAmount] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const generateQrCode = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=squeeze://pay?businessName=${encodeURIComponent(
      businessName
    )}&recipient=${wallet}&amount=${amount}&margin=0`;
    setQrCodeUrl(url);
  };

  return (
    <Card className="w-full max-w-md p-8 text-center border-slate-700 bg-slate-800/50">
      <h1 className="text-2xl font-bold text-slate-100 mb-4">
        Specific Sale
      </h1>
      {!qrCodeUrl ? (
        <div className="space-y-4">
          <p className="text-slate-400">
            Enter the amount for this sale to generate a QR code.
          </p>
          <Input
            type="number"
            placeholder="Amount (USDC)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-slate-900/50 border-slate-700 text-slate-100 placeholder-slate-600 text-center text-3xl h-20"
            min="0"
            step="0.01"
          />
          <Button onClick={generateQrCode} className="w-full h-12 text-lg">
            Generate QR Code
          </Button>
        </div>
      ) : (
        <div>
          <p className="text-slate-400 mb-6">
            Your customer can scan this to pay {amount} USDC.
          </p>
          <div className="flex justify-center">
            <img
              src={qrCodeUrl}
              alt="Specific Sale QR Code"
              className="rounded-2xl"
            />
          </div>
          <p className="font-mono text-lemon-400 text-lg break-all text-center pt-4">
            {wallet}
          </p>
          <Button onClick={() => setQrCodeUrl('')} className="mt-4" variant="outline">
            Create New Sale
          </Button>
        </div>
      )}
    </Card>
  );
}
