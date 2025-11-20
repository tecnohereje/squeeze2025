"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Camera, Loader2, X, Edit3 } from "lucide-react"
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
  const [isCameraActive, setIsCameraActive] = useState(false)
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    setBusinessName(initialBusinessName)
    setRecipientAddress(initialRecipientAddress)
    setAmount(initialAmount || "")
  }, [initialBusinessName, initialRecipientAddress, initialAmount])

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current?.isScanning) {
        html5QrCodeRef.current.stop().catch(console.error)
      }
    }
  }, [])

  const startCameraScanning = async () => {
    setIsScanning(true)
    setScanError("")

    try {
      const qrCodeReaderId = "qr-code-reader"

      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(qrCodeReaderId)
      }

      const qrCodeScanner = html5QrCodeRef.current

      if (qrCodeScanner.isScanning) {
        return
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      }

      await qrCodeScanner.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          handleScanSuccess(decodedText)
          stopCameraScanning()
        },
        (errorMessage) => {
          console.log("[v0] QR scan ongoing:", errorMessage)
        },
      )

      setIsCameraActive(true)
      setIsScanning(false)
    } catch (err: any) {
      console.error("[v0] Camera error:", err)
      setIsScanning(false)
      setIsCameraActive(false)

      if (err.name === "NotAllowedError") {
        setScanError("Camera permission denied. Please enable camera access in your browser settings.")
      } else if (err.name === "NotFoundError") {
        setScanError("No camera found on this device.")
      } else if (err.name === "NotReadableError") {
        setScanError("Camera is already in use by another application.")
      } else if (err.toString().includes("NotSupportedError") || err.toString().includes("HTTPS")) {
        setScanError("Camera requires a secure connection (HTTPS). Please use manual input.")
      } else {
        setScanError("Unable to access camera. Please use manual input.")
      }

      setShowDemoInput(true)
    }
  }

  const stopCameraScanning = () => {
    if (html5QrCodeRef.current?.isScanning) {
      html5QrCodeRef.current
        .stop()
        .then(() => {
          setIsCameraActive(false)
          setIsScanning(false)
        })
        .catch((err) => {
          console.error("[v0] Error stopping camera:", err)
          setIsCameraActive(false)
          setIsScanning(false)
        })
    } else {
      setIsCameraActive(false)
      setIsScanning(false)
    }
  }

  const handleScanSuccess = (decodedText: string) => {
    console.log("[v0] QR Code detected:", decodedText)
    try {
      let parsedUrl: URL

      if (decodedText.startsWith("lemoncash://")) {
        const urlPart = decodedText.replace("lemoncash://app/mini-apps/webview/squeeze", "https://dummy.com")
        parsedUrl = new URL(urlPart)
      } else {
        parsedUrl = new URL(decodedText)
      }

      const name = parsedUrl.searchParams.get("businessName")
      const recipient = parsedUrl.searchParams.get("recipient")
      const amountFromQR = parsedUrl.searchParams.get("amount")

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

        {!showDemoInput && !isCameraActive && (
          <div className="my-6 flex flex-col items-center gap-4">
            <Button
              onClick={startCameraScanning}
              disabled={isScanning}
              className="w-32 h-32 rounded-full bg-lime-gradient-vibrant hover:opacity-90 shadow-lg disabled:opacity-50"
            >
              {isScanning ? <Loader2 className="w-16 h-16 animate-spin" /> : <Camera className="w-16 h-16" />}
            </Button>

            {scanError && (
              <div className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-lg border border-red-200 max-w-xs">
                {scanError}
              </div>
            )}

            <Button
              onClick={() => setShowDemoInput(true)}
              variant="ghost"
              className="text-forest-700 hover:bg-lime-100"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Enter Details Manually
            </Button>
          </div>
        )}

        {isCameraActive && (
          <div className="my-6 flex flex-col items-center gap-4">
            <div className="relative w-full max-w-sm aspect-square bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-lime-500">
              <div id="qr-code-reader" className="w-full h-full"></div>
              <Button
                onClick={stopCameraScanning}
                variant="ghost"
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 p-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-sm text-forest-600 text-center">Position the QR code within the frame</p>
            <Button
              onClick={() => {
                stopCameraScanning()
                setShowDemoInput(true)
              }}
              variant="ghost"
              className="text-forest-700 hover:bg-lime-100"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Enter Manually Instead
            </Button>
          </div>
        )}

        {showDemoInput && !isCameraActive && (
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
              <Camera className="w-4 h-4 mr-2" />
              Back to Scanner
            </Button>
          </div>
        )}

        <Button
          onClick={() => {
            stopCameraScanning()
            onCancel()
          }}
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
