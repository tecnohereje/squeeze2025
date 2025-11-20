"use client"

import { Card } from "@/components/ui/card"
import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

interface GeneralSaleProps {
  businessName: string
  wallet: string
}

export default function GeneralSale({ businessName, wallet }: GeneralSaleProps) {
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
    `lemoncash://app/mini-apps/webview/squeeze?page=payment&businessName=${encodeURIComponent(
      businessName,
    )}&recipient=${wallet}`,
  )}&margin=0`

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet)
    alert("Wallet address copied!")
  }

  return (
    <Card className="w-full max-w-md p-6 sm:p-8 text-center border-lime-200/30 bg-gradient-to-br from-lime-50 via-emerald-50 to-teal-50 shadow-xl">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-forest-900 mb-2">General Sale QR Code</h1>
        <p className="text-forest-600 text-sm sm:text-base">Your customer can scan this to pay any amount</p>
      </div>

      <div className="flex justify-center mb-6">
        <div className="p-4 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-3xl shadow-lg">
          <div className="bg-white p-3 rounded-2xl">
            <img
              src={qrCodeUrl || "/placeholder.svg"}
              alt="General Sale QR Code"
              className="w-full max-w-[280px] sm:max-w-[320px] rounded-xl"
            />
          </div>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-lime-200/50">
        <p className="text-xs text-forest-600 mb-2 font-medium">Wallet Address</p>
        <p className="font-mono text-lime-600 text-xs sm:text-sm break-all mb-3">{wallet}</p>
        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className="w-full bg-gradient-to-r from-lime-500 to-emerald-500 text-white border-0 hover:from-lime-600 hover:to-emerald-600"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy Address
        </Button>
      </div>
    </Card>
  )
}
