'use client';

import { useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';

interface BusinessOpenProps {
  businessName: string;
  wallet: string;
  balance: string;
  onEdit: () => void;
}

export default function BusinessOpen({
  businessName,
  wallet,
  balance,
  onEdit,
}: BusinessOpenProps) {
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=squeeze://pay?businessName=${encodeURIComponent(
    businessName
  )}&recipient=${wallet}&margin=0`;
  const shareableRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    if (shareableRef.current && navigator.share) {
      try {
        const canvas = await html2canvas(shareableRef.current, {
          useCORS: true,
          backgroundColor: null,
        });
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], 'business-qr.png', {
              type: 'image/png',
            });
            await navigator.share({
              title: `${businessName} QR Code`,
              text: `Scan this QR code to pay ${businessName}.`,
              files: [file],
            });
          }
        }, 'image/png');
      } catch (error) {
        console.error('Error sharing', error);
        alert('Could not share QR code.');
      }
    } else {
      alert('Web Share API is not supported in your browser.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div
        ref={shareableRef}
        className="bg-slate-900" // Match the background for the screenshot
      >
        <div className="text-center mb-8 pt-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">
            {businessName}
          </h1>
          <p className="text-slate-400">Accepting Payments</p>
        </div>

        <div className="grid grid-cols-1 items-center">
          <Card className="border-0 bg-transparent backdrop-blur-sm p-0 shadow-none">
            <div className="flex justify-center">
              <img
                src={qrCodeUrl}
                alt="Business QR Code"
                className="w-full h-full rounded-2xl"
              />
            </div>
            <p className="font-mono text-lemon-400 text-lg break-all text-center pt-2 px-6 pb-6">
              {wallet}
            </p>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mt-6">
        <div className="space-y-6">
          <Card className="border-lemon-400/30 bg-gradient-to-br from-lemon-500/10 to-lemon-400/5 backdrop-blur-sm">
            <div className="p-4 text-center">
              <p className="text-slate-400 text-sm mb-1">Available Balance</p>
              <h3 className="text-3xl font-bold text-lemon-400">
                {balance}
              </h3>
              <p className="text-slate-400 text-xs">USDC on Base</p>
            </div>
          </Card>
          <div className="text-center">
            <Button
              onDoubleClick={onEdit}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold h-11"
            >
              Edit Business (Double Touch)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
