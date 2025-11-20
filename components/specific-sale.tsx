"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Check } from "lucide-react"

interface SpecificSaleProps {
  businessName: string
  wallet: string
}

export default function SpecificSale({ businessName, wallet }: SpecificSaleProps) {
  const [amount, setAmount] = useState("")
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [copied, setCopied] = useState(false)

  const generateQrCode = () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      alert("Please enter a valid amount")
      return
    }
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
      `lemoncash://app/mini-apps/webview/squeeze?page=payment&businessName=${encodeURIComponent(
        businessName,
      )}&recipient=${wallet}&amount=${amount}`,
    )}&margin=0`
    setQrCodeUrl(url)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(wallet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="w-full max-w-md p-6 sm:p-8 text-center border-lime-500/20 bg-gradient-to-br from-background via-mint-50 to-lime-50/30 shadow-xl">
      <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-lime-600 to-emerald-600 bg-clip-text text-transparent mb-6">
        Specific Sale
      </h1>
      {!qrCodeUrl ? (
        <div className="space-y-6">
          <p className="text-forest-600 text-sm sm:text-base">Enter the amount for this sale to generate a QR code.</p>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-white/80 border-2 border-lime-300 focus:border-lime-500 text-forest-700 placeholder-forest-400 text-center text-4xl sm:text-5xl h-20 sm:h-24 font-bold rounded-2xl shadow-lg"
            min="0"
            step="0.01"
          />
          <div className="text-xs sm:text-sm text-forest-500 font-medium">USDC</div>
          <Button
            onClick={generateQrCode}
            className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-lime-500 via-emerald-500 to-lime-600 hover:from-lime-600 hover:via-emerald-600 hover:to-lime-700 text-white shadow-lg rounded-xl"
          >
            Generate QR Code
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-forest-600 text-sm sm:text-base font-medium">
            Your customer can scan this to pay <span className="font-bold text-lime-600">{amount} USDC</span>
          </p>
          <div className="flex justify-center">
            <div className="p-1 bg-gradient-to-br from-lime-400 via-emerald-400 to-lime-500 rounded-3xl shadow-2xl">
              <div className="bg-white p-4 rounded-[22px]">
                <img
                  src={qrCodeUrl || "/placeholder.svg"}
                  alt="Specific Sale QR Code"
                  className="rounded-xl w-full max-w-[280px] sm:max-w-[320px]"
                />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-lime-50 to-emerald-50 p-4 rounded-xl border border-lime-200">
            <p className="text-xs text-forest-500 mb-2 font-medium">Wallet Address</p>
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-lime-700 text-xs sm:text-sm break-all flex-1 text-left">{wallet}</p>
              <Button
                onClick={copyToClipboard}
                variant="ghost"
                size="sm"
                className="shrink-0 h-8 w-8 p-0 hover:bg-lime-100"
              >
                {copied ? <Check className="h-4 w-4 text-lime-600" /> : <Copy className="h-4 w-4 text-forest-600" />}
              </Button>
            </div>
          </div>
          <Button
            onClick={() => setQrCodeUrl("")}
            className="w-full h-11 bg-white hover:bg-lime-50 text-lime-700 border-2 border-lime-300 hover:border-lime-400 font-semibold rounded-xl"
            variant="outline"
          >
            Create New Sale
          </Button>
        </div>
      )}
    </Card>
  )
}
