"use client"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DollarSign, Tag, ShoppingCart, Settings } from "lucide-react"

interface BusinessHubProps {
  onNavigate: (screen: "generalSale" | "specificSale" | "catalogSale" | "businessForm") => void
}

export default function BusinessHub({ onNavigate }: BusinessHubProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Business Hub
        </h2>
        <p className="text-muted-foreground">Choose a sale type to generate a payment QR code</p>
      </div>

      <div className="grid gap-4">
        <Card
          className="group cursor-pointer overflow-hidden border-border/50 bg-lime-gradient-subtle hover:bg-card transition-all hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30"
          onClick={() => onNavigate("generalSale")}
        >
          <CardHeader className="pb-3">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-lime-gradient-vibrant text-primary-foreground shadow-md group-hover:scale-105 transition-transform">
              <DollarSign className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg group-hover:text-primary transition-colors">General Sale</CardTitle>
            <CardDescription>Open amount payment QR code</CardDescription>
          </CardHeader>
        </Card>

        <Card
          className="group cursor-pointer overflow-hidden border-border/50 bg-lime-gradient-subtle hover:bg-card transition-all hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30"
          onClick={() => onNavigate("specificSale")}
        >
          <CardHeader className="pb-3">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-lime-gradient-vibrant text-primary-foreground shadow-md group-hover:scale-105 transition-transform">
              <Tag className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg group-hover:text-primary transition-colors">Specific Sale</CardTitle>
            <CardDescription>Fixed amount payment QR code</CardDescription>
          </CardHeader>
        </Card>

        <Card
          className="group cursor-pointer overflow-hidden border-border/50 bg-lime-gradient-subtle hover:bg-card transition-all hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30"
          onClick={() => onNavigate("catalogSale")}
        >
          <CardHeader className="pb-3">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-lime-gradient-vibrant text-primary-foreground shadow-md group-hover:scale-105 transition-transform">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg group-hover:text-primary transition-colors">Catalog Sale</CardTitle>
            <CardDescription>Product catalog with cart</CardDescription>
          </CardHeader>
        </Card>

        <Card
          className="group cursor-pointer overflow-hidden border-border/50 bg-lime-gradient-subtle hover:bg-card transition-all hover:shadow-md hover:shadow-primary/5 hover:border-primary/20"
          onClick={() => onNavigate("businessForm")}
        >
          <CardHeader className="pb-3">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30 group-hover:scale-105 transition-transform">
              <Settings className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg group-hover:text-primary transition-colors">Edit Business</CardTitle>
            <CardDescription>Update your business information</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
