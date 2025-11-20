"use client"

import { useState, useMemo, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Plus, Minus } from "lucide-react"
import { getBusinesses, type Product } from "@/lib/ledger" // Import from ledger

// Types
type CartItem = {
  product: Product
  quantity: number
}

interface CatalogSaleProps {
  businessWallet: string // Added to identify which business's products to show
  cart: CartItem[]
  onUpdateCart: (product: Product, quantity: number) => void
  onNavigate: (screen: "cartSummary") => void
}

export default function CatalogSale({ businessWallet, cart, onUpdateCart, onNavigate }: CatalogSaleProps) {
  const [activeCategory, setActiveCategory] = useState("All")
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const businesses = await getBusinesses()
        const business = businesses.find((b) => b.id === businessWallet)
        if (business && business.products) {
          setProducts(business.products)
        } else {
          // Fallback to default products if business has none
          setProducts([
            { id: 1, name: "Coffee", price: 3.5, category: "Drinks" },
            { id: 2, name: "Cappuccino", price: 4.0, category: "Drinks" },
            { id: 3, name: "Latte", price: 4.5, category: "Drinks" },
            { id: 4, name: "Muffin", price: 2.5, category: "Bakery" },
            { id: 5, name: "Croissant", price: 3.0, category: "Bakery" },
            { id: 6, name: "Sandwich", price: 7.0, category: "Food" },
            { id: 7, name: "Salad", price: 8.5, category: "Food" },
          ])
        }
      } catch (error) {
        console.error("Failed to fetch products:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [businessWallet])

  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") {
      return products
    }
    return products.filter((p) => p.category === activeCategory)
  }, [activeCategory, products])

  const categories = useMemo(() => {
    const cats = ["All", ...new Set(products.map((p) => p.category))]
    return cats
  }, [products])

  const cartItemCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }, [cart])

  const getQuantity = (productId: number) => {
    return cart.find((item) => item.product.id === productId)?.quantity || 0
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md p-4 sm:p-6 border-lime-500/20 bg-gradient-to-br from-background via-mint-50 to-lime-50/30 shadow-xl relative">
      {cartItemCount > 0 && (
        <Button
          onClick={() => onNavigate("cartSummary")}
          className="absolute top-4 right-4 rounded-full h-10 sm:h-12 px-3 sm:px-4 bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-600 hover:to-emerald-600 text-white shadow-lg text-sm sm:text-base font-semibold"
        >
          <ShoppingCart className="mr-1 sm:mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Cart </span>({cartItemCount})
        </Button>
      )}
      <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-lime-600 to-emerald-600 bg-clip-text text-transparent mb-6 text-center pr-20 sm:pr-24">
        Catalog Sale
      </h1>

      <div className="flex justify-center gap-2 mb-6 flex-wrap">
        {categories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            onClick={() => setActiveCategory(category)}
            className={
              activeCategory === category
                ? "bg-gradient-to-r from-lime-500 to-emerald-500 text-white border-0 shadow-md h-9 text-sm"
                : "bg-white hover:bg-lime-50 text-forest-700 border-lime-300 hover:border-lime-400 h-9 text-sm"
            }
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="space-y-3 h-[400px] sm:h-96 overflow-y-auto pr-2">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-gradient-to-r from-white to-lime-50/50 border border-lime-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex-1">
              <p className="font-semibold text-forest-700 text-sm sm:text-base">{product.name}</p>
              <p className="text-xs sm:text-sm text-lime-600 font-medium">${product.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                size="sm"
                onClick={() => onUpdateCart(product, getQuantity(product.id) - 1)}
                disabled={getQuantity(product.id) === 0}
                className="h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-full bg-white hover:bg-lime-50 text-forest-700 border border-lime-300 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <span className="font-bold text-forest-700 min-w-[24px] text-center text-sm sm:text-base">
                {getQuantity(product.id)}
              </span>
              <Button
                size="sm"
                onClick={() => onUpdateCart(product, getQuantity(product.id) + 1)}
                className="h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-full bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-600 hover:to-emerald-600 text-white shadow-md"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
