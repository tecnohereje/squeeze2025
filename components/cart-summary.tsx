"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Minus, Trash2, ShoppingCart } from "lucide-react"

// This is a placeholder. The actual product type will be defined in the parent component.
type CartItem = {
  product: { id: number; name: string; price: number }
  quantity: number
}

interface CartSummaryProps {
  cart: CartItem[]
  onUpdateQuantity: (productId: number, newQuantity: number) => void
  onRemoveItem: (productId: number) => void
  onClearCart: () => void
  onGenerateQrCode: () => void
}

export default function CartSummary({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onGenerateQrCode,
}: CartSummaryProps) {
  const totalAmount = cart.reduce((total, item) => total + item.product.price * item.quantity, 0).toFixed(2)

  return (
    <Card className="w-full max-w-md p-6 sm:p-8 border-lime-500/20 bg-gradient-to-br from-background via-mint-50 to-lime-50/30 shadow-xl">
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-gradient-vibrant shadow-md">
          <ShoppingCart className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-lime-600 to-emerald-600 bg-clip-text text-transparent">
          Cart Summary
        </h1>
      </div>

      <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto pr-2">
        {cart.map((item) => (
          <div
            key={item.product.id}
            className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-gradient-to-r from-white to-lime-50/50 border border-lime-200 shadow-sm"
          >
            <div className="flex-1 min-w-0 mr-3">
              <p className="font-semibold text-forest-700 text-sm sm:text-base truncate">{item.product.name}</p>
              <p className="text-xs sm:text-sm text-lime-600 font-medium">
                ${item.product.price.toFixed(2)} × {item.quantity}
              </p>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                size="sm"
                onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                className="h-8 w-8 p-0 rounded-full bg-white hover:bg-lime-50 text-forest-700 border border-lime-300"
              >
                <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <span className="font-bold text-forest-700 min-w-[24px] text-center text-sm sm:text-base">
                {item.quantity}
              </span>
              <Button
                size="sm"
                onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                className="h-8 w-8 p-0 rounded-full bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-600 hover:to-emerald-600 text-white shadow-md"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemoveItem(item.product.id)}
                className="h-8 w-8 p-0 rounded-full hover:bg-red-50 text-red-600 hover:text-red-700 ml-1"
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <Button
          onClick={onClearCart}
          variant="ghost"
          className="w-full mb-4 text-sm text-forest-600 hover:text-forest-700 hover:bg-lime-50"
        >
          Clear Cart
        </Button>
      )}

      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-lime-100 to-emerald-100 border border-lime-300">
        <div className="flex items-center justify-between">
          <span className="text-base sm:text-lg font-semibold text-forest-700">Total:</span>
          <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-lime-600 to-emerald-600 bg-clip-text text-transparent">
            ${totalAmount}
          </span>
        </div>
      </div>

      <Button
        onClick={onGenerateQrCode}
        className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-lime-gradient-vibrant hover:opacity-90 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={cart.length === 0}
      >
        Generate QR Code
      </Button>
    </Card>
  )
}
