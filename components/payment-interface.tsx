'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QrCode, Camera } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface PaymentInterfaceProps {
  businessName?: string;
  recipientAddress?: string;
  initialAmount?: string;
  balance: string;
  onPay: (amount: string, recipient: string) => void;
  onCancel: () => void;
}

export default function PaymentInterface({
  businessName: initialBusinessName,
  recipientAddress: initialRecipientAddress,
  initialAmount,
  balance,
  onPay,
  onCancel,
}: PaymentInterfaceProps) {
  const [amount, setAmount] = useState(initialAmount || '');
  const [businessName, setBusinessName] = useState(initialBusinessName);
  const [recipientAddress, setRecipientAddress] = useState(
    initialRecipientAddress
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBusinessName(initialBusinessName);
    setRecipientAddress(initialRecipientAddress);
    setAmount(initialAmount || '');
  }, [initialBusinessName, initialRecipientAddress, initialAmount]);

  useEffect(() => {
    if (!businessName && !recipientAddress) {
      fileInputRef.current?.click();

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          setTimeout(() => {
            if (fileInputRef.current?.files?.length === 0) {
              onCancel();
            }
          }, 200);
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        document.removeEventListener(
          'visibilitychange',
          handleVisibilityChange
        );
      };
    }
  }, [businessName, recipientAddress, onCancel]);

  const handleScanFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const html5QrCode = new Html5Qrcode('qr-code-reader', false);
    html5QrCode
      .scanFile(file, false)
      .then((decodedText) => {
        handleScanSuccess(decodedText);
      })
      .catch((err) => {
        alert(`Error scanning file. ${err}`);
      });
  };

  const handleScanSuccess = (decodedText: string) => {
    try {
      const url = new URL(decodedText);
      const name = url.searchParams.get('businessName');
      const recipient = url.searchParams.get('recipient');
      const amountFromQR = url.searchParams.get('amount');

      if (name && recipient) {
        setBusinessName(name);
        setRecipientAddress(recipient);
        if (amountFromQR) {
          setAmount(amountFromQR);
        }
      } else {
        alert('Invalid QR Code');
      }
    } catch (error) {
      alert('Invalid QR Code');
    }
  };

  const handlePayClick = () => {
    const numericAmount = parseFloat(amount);
    const numericBalance = parseFloat(balance);

    if (!amount || numericAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (numericAmount > numericBalance) {
      alert('Insufficient balance');
      return;
    }
    if (recipientAddress) {
      onPay(amount, recipientAddress);
    }
  };

  if (!businessName || !recipientAddress) {
    return (
      <Card className="w-full max-w-md p-8 text-center border-slate-700 bg-slate-800/50">
        <h1 className="text-2xl font-bold text-slate-100 mb-4">
          Ready to Pay
        </h1>
        <p className="text-slate-400 mb-6">
          Use your phone's camera to scan a business's QR code to begin a payment.
        </p>
        <div className="my-8 flex justify-center">
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-32 h-32 rounded-full bg-lemon-500 hover:bg-lemon-600"
          >
            <Camera className="w-16 h-16" />
          </Button>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            onChange={handleScanFile}
            className="hidden"
          />
          <div id="qr-code-reader" className="hidden"></div>
        </div>
        <Button onClick={onCancel} variant="outline" className="mt-4">
          Cancel
        </Button>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md p-8 text-center border-slate-700 bg-slate-800/50">
      <h1 className="text-2xl font-bold text-slate-100 mb-2">
        Pay to {businessName}
      </h1>
      <p className="text-slate-400 mb-6">Enter the amount to pay in USDC</p>
      <div className="space-y-4">
        <div className="relative">
          <Input
            type="number"
            placeholder="Amount (USDC)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-slate-900/50 border-slate-700 text-slate-100 placeholder-slate-600 text-center text-3xl h-20 pr-16"
            min="0"
            step="0.01"
            max={balance}
            readOnly={!!initialAmount}
          />
          {!initialAmount && (
            <Button
              onClick={() => setAmount(balance)}
              variant="ghost"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-auto px-2 py-1 text-lemon-400 hover:bg-slate-700"
            >
              Max
            </Button>
          )}
        </div>
        <div className="text-sm text-slate-400">
          Balance: {balance} USDC
        </div>
        <Button
          onClick={handlePayClick}
          className="w-full bg-gradient-to-r from-lemon-400 to-lemon-500 hover:from-lemon-500 hover:to-lemon-600 text-slate-900 font-semibold h-12 text-lg"
        >
          Pay
        </Button>
      </div>
    </Card>
  );
}
