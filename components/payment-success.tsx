"use client"

import { useEffect } from "react"
import { CheckCircle, Sparkles } from "lucide-react"

interface PaymentSuccessProps {
  amount: string
  businessName: string
  onTimeout: () => void
}

export default function PaymentSuccess({ amount, businessName, onTimeout }: PaymentSuccessProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onTimeout()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onTimeout])

  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-12">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-full blur-2xl opacity-30 animate-pulse" />
        <div className="relative bg-gradient-to-br from-lime-500 to-emerald-500 rounded-full p-6 shadow-2xl">
          <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-white" strokeWidth={2.5} />
        </div>
        <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-lime-400 animate-pulse" />
        <Sparkles
          className="absolute -bottom-2 -left-2 w-6 h-6 text-emerald-400 animate-pulse"
          style={{ animationDelay: "0.5s" }}
        />
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-lime-600 to-emerald-600 bg-clip-text text-transparent">
        Payment Successful!
      </h1>

      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-lime-200/50 shadow-lg max-w-sm">
        <p className="text-forest-600 text-sm mb-2">You paid</p>
        <p className="text-4xl sm:text-5xl font-bold text-lime-600 mb-2">${amount}</p>
        <p className="text-forest-600 text-sm">to</p>
        <p className="text-xl font-semibold text-forest-900 mt-1">{businessName}</p>
      </div>

      <p className="text-forest-500 text-sm mt-6 animate-pulse">Redirecting...</p>
    </div>
  )
}
