'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// This is a placeholder. The actual product type will be defined in the parent component.
type CartItem = {
  product: { id: number; name: string; price: number };
  quantity: number;
};

interface CartSummaryProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: number, newQuantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onClearCart: () => void;
  onGenerateQrCode: () => void;
}

export default function CartSummary({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onGenerateQrCode,
}: CartSummaryProps) {
  const totalAmount = cart
    .reduce((total, item) => total + item.product.price * item.quantity, 0)
    .toFixed(2);

  return (
    <Card className="w-full max-w-md p-8 text-center border-slate-700 bg-slate-800/50">
      <h1 className="text-2xl font-bold text-slate-100 mb-4">
        Cart Summary
      </h1>
      <div className="space-y-4 text-left">
        {cart.map((item) => (
          <div key={item.product.id} className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{item.product.name}</p>
              <p className="text-sm text-slate-400">
                ${item.product.price.toFixed(2)} x {item.quantity}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
              >
                -
              </Button>
              <Button
                size="sm"
                onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
              >
                +
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onRemoveItem(item.product.id)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
      {cart.length > 0 && (
        <Button onClick={onClearCart} variant="link" className="mt-4">
          Clear Cart
        </Button>
      )}
      <div className="mt-6 text-2xl font-bold text-white">
        Total: ${totalAmount}
      </div>
      <Button
        onClick={onGenerateQrCode}
        className="w-full h-12 text-lg mt-4"
        disabled={cart.length === 0}
      >
        Generate QR Code
      </Button>
    </Card>
  );
}
