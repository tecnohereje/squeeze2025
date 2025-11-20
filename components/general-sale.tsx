'use client';

import { Card } from '@/components/ui/card';

interface GeneralSaleProps {
  businessName: string;
  wallet: string;
}

export default function GeneralSale({
  businessName,
  wallet,
}: GeneralSaleProps) {
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=squeeze://pay?businessName=${encodeURIComponent(
    businessName
  )}&recipient=${wallet}&margin=0`;

  return (
    <Card className="w-full max-w-md p-8 text-center border-slate-700 bg-slate-800/50">
      <h1 className="text-2xl font-bold text-slate-100 mb-4">
        General Sale QR Code
      </h1>
      <p className="text-slate-400 mb-6">
        Your customer can scan this to pay any amount.
      </p>
      <div className="flex justify-center">
        <img
          src={qrCodeUrl}
          alt="General Sale QR Code"
          className="rounded-2xl"
        />
      </div>
      <p className="font-mono text-lemon-400 text-lg break-all text-center pt-4">
        {wallet}
      </p>
    </Card>
  );
}
