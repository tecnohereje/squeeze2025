'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ShoppingCart } from 'lucide-react';

// Types
type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
};

type CartItem = {
  product: Product;
  quantity: number;
};

interface CatalogSaleProps {
  businessName: string;
  wallet: string;
  cart: CartItem[];
  onUpdateCart: (product: Product, quantity: number) => void;
  onNavigate: (screen: 'cartSummary') => void;
}

const products: Product[] = [
  { id: 1, name: 'Coffee', price: 3.5, category: 'Drinks' },
  { id: 2, name: 'Cappuccino', price: 4.0, category: 'Drinks' },
  { id: 3, name: 'Latte', price: 4.5, category: 'Drinks' },
  { id: 4, name: 'Muffin', price: 2.5, category: 'Bakery' },
  { id: 5, name: 'Croissant', price: 3.0, category: 'Bakery' },
  { id: 6, name: 'Sandwich', price: 7.0, category: 'Food' },
  { id: 7, name: 'Salad', price: 8.5, category: 'Food' },
];

const categories = ['All', 'Drinks', 'Bakery', 'Food'];

export default function CatalogSale({
  cart,
  onUpdateCart,
  onNavigate,
}: CatalogSaleProps) {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') {
      return products;
    }
    return products.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const getQuantity = (productId: number) => {
    return cart.find((item) => item.product.id === productId)?.quantity || 0;
  };

  return (
    <Card className="w-full max-w-md p-6 border-slate-700 bg-slate-800/50 relative">
      {cartItemCount > 0 && (
        <Button
          onClick={() => onNavigate('cartSummary')}
          className="absolute top-4 right-4 rounded-full h-12 w-24"
        >
          <ShoppingCart className="mr-2" /> Cart ({cartItemCount})
        </Button>
      )}
      <h1 className="text-2xl font-bold text-slate-100 mb-4 text-center">
        Catalog Sale
      </h1>

      <div className="flex justify-center space-x-2 mb-4">
        {categories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? 'default' : 'outline'}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="space-y-4 text-left h-96 overflow-y-auto">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50"
          >
            <div>
              <p className="font-semibold">{product.name}</p>
              <p className="text-sm text-slate-400">
                ${product.price.toFixed(2)}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={() =>
                  onUpdateCart(product, getQuantity(product.id) - 1)
                }
                disabled={getQuantity(product.id) === 0}
              >
                -
              </Button>
              <span>{getQuantity(product.id)}</span>
              <Button
                size="sm"
                onClick={() =>
                  onUpdateCart(product, getQuantity(product.id) + 1)
                }
              >
                +
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}