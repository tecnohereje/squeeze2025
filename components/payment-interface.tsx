"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Camera, Loader2 } from "lucide-react"
import { Html5Qrcode } from "html5-qrcode"

interface PaymentInterfaceProps {
  businessName?: string
  recipientAddress?: string
  initialAmount?: string
  balance: string
  onPay: (amount: string, recipient: string) => void
  onCancel: () => void
}

export default function PaymentInterface({
  businessName: initialBusinessName,
  recipientAddress: initialRecipientAddress,
  initialAmount,
  balance,
  onPay,
  onCancel,
}: PaymentInterfaceProps) {
  const [amount, setAmount] = useState(initialAmount || "")
  const [businessName, setBusinessName] = useState(initialBusinessName)
  const [recipientAddress, setRecipientAddress] = useState(initialRecipientAddress)
  const [isScanning, setIsScanning] = useState(false)
  const [scanError, setScanError] = useState("")
  const [showDemoInput, setShowDemoInput] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setBusinessName(initialBusinessName)
    setRecipientAddress(initialRecipientAddress)
    setAmount(initialAmount || "")
  }, [initialBusinessName, initialRecipientAddress, initialAmount])

  useEffect(() => {
    if (!businessName && !recipientAddress) {
      fileInputRef.current?.click()

      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          setTimeout(() => {
            if (fileInputRef.current?.files?.length === 0) {
              onCancel()
            }
          }, 200)
        }
      }

      document.addEventListener("visibilitychange", handleVisibilityChange)

      return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange)
      }
    }
  }, [businessName, recipientAddress, onCancel])

  const handleScanFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setScanError("No file selected")
      return
    }

    setIsScanning(true)
    setScanError("")

    const html5QrCode = new Html5Qrcode("qr-code-reader", false)
    html5QrCode
      .scanFile(file, false)
      .then((decodedText) => {
        handleScanSuccess(decodedText)
        setIsScanning(false)
      })
      .catch((err) => {
        setScanError("Invalid QR code. Please try again or enter details manually.")
        setIsScanning(false)
        setShowDemoInput(true)
      })
  }

  const handleScanSuccess = (decodedText: string) => {
    try {
      const url = new URL(decodedText)
      const name = url.searchParams.get("businessName")
      const recipient = url.searchParams.get("recipient")
      const amountFromQR = url.searchParams.get("amount")

      if (name && recipient) {
        setBusinessName(name)
        setRecipientAddress(recipient)
        if (amountFromQR) {
          setAmount(amountFromQR)
        }
        setScanError("")
      } else {
        setScanError("Invalid QR Code format")
        setShowDemoInput(true)
      }
    } catch (error) {
      setScanError("Could not read QR code")
      setShowDemoInput(true)
    }
  }

  const handlePayClick = () => {
    const numericAmount = Number.parseFloat(amount)
    const numericBalance = Number.parseFloat(balance)

    if (!amount || numericAmount <= 0) {
      alert("Please enter a valid amount")
      return
    }
    if (numericAmount > numericBalance) {
      alert(`Insufficient balance. You have ${balance} USDC available.`)
      return
    }
    if (!recipientAddress) {
      alert("Recipient address is missing")
      return
    }
    onPay(amount, recipientAddress)
  }

  if (!businessName || !recipientAddress) {
    return (
      <Card className="w-full max-w-md p-6 sm:p-8 border-lime-500/20 bg-gradient-to-br from-background via-mint-50 to-lime-50/30 shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-lime-600 to-emerald-600 bg-clip-text text-transparent mb-2 text-center">
          Ready to Pay
        </h1>
        <p className="text-forest-600 text-center mb-6 text-sm sm:text-base">
          Scan a business QR code or enter payment details manually
        </p>

        {!showDemoInput && (
          <div className="my-6 flex flex-col items-center gap-4">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanning}
              className="w-32 h-32 rounded-full bg-lime-gradient-vibrant hover:opacity-90 shadow-lg disabled:opacity-50"
            >
              {isScanning ? <Loader2 className="w-16 h-16 animate-spin" /> : <Camera className="w-16 h-16" />}
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

            {scanError && (
              <div className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-lg border border-red-200">
                {scanError}
              </div>
            )}

            <Button
              onClick={() => setShowDemoInput(true)}
              variant="ghost"
              className="text-forest-700 hover:bg-lime-100"
            >
              Enter Details Manually
            </Button>
          </div>
        )}

        {showDemoInput && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="text-sm font-medium text-forest-700 mb-1 block">Business Name</label>
              <Input
                placeholder="Business Name"
                value={businessName || ""}
                onChange={(e) => setBusinessName(e.target.value)}
                className="bg-white border-lime-300 focus:border-lime-500 text-forest-900"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-forest-700 mb-1 block">Recipient Address</label>
              <Input
                placeholder="0x..."
                value={recipientAddress || ""}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="bg-white border-lime-300 focus:border-lime-500 text-forest-900 font-mono text-sm"
              />
            </div>
            <Button
              onClick={() => {
                if (businessName && recipientAddress) {
                  // Trigger re-render to show payment screen
                  setBusinessName(businessName)
                  setRecipientAddress(recipientAddress)
                }
              }}
              className="w-full bg-lime-gradient-vibrant hover:opacity-90 text-forest-900 font-semibold h-11"
              disabled={!businessName || !recipientAddress}
            >
              Continue
            </Button>
            <Button
              onClick={() => setShowDemoInput(false)}
              variant="ghost"
              className="w-full text-forest-700 hover:bg-lime-100"
            >
              Back to Scanner
            </Button>
          </div>
        )}

        <Button
          onClick={onCancel}
          variant="outline"
          className="w-full border-lime-300 hover:bg-lime-50 text-forest-700 bg-transparent"
        >
          Cancel
        </Button>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md p-6 sm:p-8 border-lime-500/20 bg-gradient-to-br from-background via-mint-50 to-lime-50/30 shadow-xl">
      <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-lime-600 to-emerald-600 bg-clip-text text-transparent mb-2 text-center">
        Pay to {businessName}
      </h1>
      <p className="text-forest-600 text-center mb-6 text-sm sm:text-base">Enter the amount to pay in USDC</p>

      <div className="space-y-4">
        <div className="relative">
          <Input
            type="number"
            placeholder="Amount (USDC)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-white border-2 border-lime-300 focus:border-lime-500 text-forest-900 placeholder-forest-400 text-center text-3xl h-20 pr-16 font-bold"
            min="0"
            step="0.01"
            max={balance}
            readOnly={!!initialAmount}
          />
          {!initialAmount && (
            <Button
              onClick={() => setAmount(balance)}
              variant="ghost"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-auto px-3 py-1.5 text-lime-600 hover:bg-lime-100 font-semibold"
            >
              Max
            </Button>
          )}
        </div>

        <div className="text-sm text-forest-600 text-center bg-lime-50 p-2 rounded-lg border border-lime-200">
          Available Balance: <span className="font-bold">{balance} USDC</span>
        </div>

        <Button
          onClick={handlePayClick}
          className="w-full bg-lime-gradient-vibrant hover:opacity-90 text-forest-900 font-bold h-14 text-lg shadow-lg"
        >
          Confirm Payment
        </Button>

        <Button
          onClick={onCancel}
          variant="outline"
          className="w-full border-lime-300 hover:bg-lime-50 text-forest-700 bg-transparent"
        >
          Cancel
        </Button>
      </div>
    </Card>
  )
}
