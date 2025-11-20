'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface CatalogSaleProps {
  businessName: string;
  wallet: string;
}

const products = [
  { id: 1, name: 'Coffee', price: 3.5 },
  { id: 2, name: 'Cappuccino', price: 4.0 },
  { id: 3, name: 'Latte', price: 4.5 },
  { id: 4, name: 'Muffin', price: 2.5 },
  { id: 5, name: 'Croissant', price: 3.0 },
];

export default function CatalogSale({ businessName, wallet }: CatalogSaleProps) {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const totalAmount = useMemo(() => {
    return selectedItems
      .reduce((total, itemId) => {
        const item = products.find((p) => p.id === itemId);
        return total + (item?.price || 0);
      }, 0)
      .toFixed(2);
  }, [selectedItems]);

  const handleSelectItem = (itemId: number) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const generateQrCode = () => {
    if (parseFloat(totalAmount) <= 0) {
      alert('Please select at least one item.');
      return;
    }
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=squeeze://pay?businessName=${encodeURIComponent(
      businessName
    )}&recipient=${wallet}&amount=${totalAmount}&margin=0`;
    setQrCodeUrl(url);
  };

  if (qrCodeUrl) {
    return (
      <Card className="w-full max-w-md p-8 text-center border-slate-700 bg-slate-800/50">
        <h1 className="text-2xl font-bold text-slate-100 mb-4">
          Pay ${totalAmount}
        </h1>
        <p className="text-slate-400 mb-6">
          Your customer can scan this to complete the payment.
        </p>
        <div className="flex justify-center">
          <img
            src={qrCodeUrl}
            alt="Catalog Sale QR Code"
            className="rounded-2xl"
          />
        </div>
        <p className="font-mono text-lemon-400 text-lg break-all text-center pt-4">
          {wallet}
        </p>
        <Button
          onClick={() => {
            setQrCodeUrl('');
            setSelectedItems([]);
          }}
          className="mt-4"
          variant="outline"
        >
          Create New Sale
        </Button>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md p-8 text-center border-slate-700 bg-slate-800/50">
      <h1 className="text-2xl font-bold text-slate-100 mb-4">
        Catalog Sale
      </h1>
      <div className="space-y-4 text-left">
        {products.map((product) => (
          <div key={product.id} className="flex items-center space-x-2">
            <Checkbox
              id={`product-${product.id}`}
              checked={selectedItems.includes(product.id)}
              onCheckedChange={() => handleSelectItem(product.id)}
            />
            <Label
              htmlFor={`product-${product.id}`}
              className="flex justify-between w-full"
            >
              <span>{product.name}</span>
              <span>${product.price.toFixed(2)}</span>
            </Label>
          </div>
        ))}
      </div>
      <div className="mt-6 text-2xl font-bold text-white">
        Total: ${totalAmount}
      </div>
      <Button onClick={generateQrCode} className="w-full h-12 text-lg mt-4">
        Generate QR Code
      </Button>
    </Card>
  );
}
