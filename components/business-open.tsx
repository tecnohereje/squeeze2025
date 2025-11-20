'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';

interface BusinessOpenProps {
  wallet: string;
  balance: string;
  onEdit: () => void;
}

export default function BusinessOpen({ wallet, balance, onEdit }: BusinessOpenProps) {
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${wallet}`;

  const handlePrint = () => {
    const originalContent = document.body.innerHTML;
    const printContent = `
      <div style="text-align: center; padding: 20px;">
        <h2>Business Wallet Address</h2>
        <p>${wallet}</p>
        <img src="${qrCodeUrl}" alt="Wallet QR Code" />
      </div>
    `;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // Reload to restore the original state
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8 pt-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">
          Business Open
        </h1>
        <p className="text-slate-400">Accepting Payments</p>
      </div>

      <Card className="mb-6 border-lemon-400/30 bg-gradient-to-br from-lemon-500/10 to-lemon-400/5 backdrop-blur-sm">
        <div className="p-8 text-center">
          <p className="text-slate-400 text-sm mb-2">Available Balance</p>
          <h3 className="text-5xl font-bold text-lemon-400 mb-1">
            {balance}
          </h3>
          <p className="text-slate-400 text-sm">USDC on Base</p>
        </div>
      </Card>

      <Card className="mb-6 border-slate-700 bg-slate-800/50 backdrop-blur-sm p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-4 text-center">
          Scan to Pay
        </h2>
        <div className="flex justify-center">
          <img src={qrCodeUrl} alt="Wallet QR Code" />
        </div>
        <p className="font-mono text-lemon-400 text-sm break-all text-center mt-4">
          {wallet}
        </p>
      </Card>

      <div className="text-center space-x-4">
        <Button
          onClick={handlePrint}
          className="bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white font-semibold h-11"
        >
          Print / Save as PDF
        </Button>
        <Button
          onClick={onEdit}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold h-11"
        >
          Edit Business
        </Button>
      </div>
    </div>
  );
}
