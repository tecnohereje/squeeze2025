"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Store, FileText, Shield } from "lucide-react"

type BusinessData = {
  name: string
  businessId: string
  fiscalPermit: string
}

interface BusinessFormProps {
  onSubmit: (data: BusinessData) => void
  initialData?: BusinessData | null
}

export default function BusinessForm({ onSubmit, initialData }: BusinessFormProps) {
  const [name, setName] = useState("")
  const [businessId, setBusinessId] = useState("")
  const [fiscalPermit, setFiscalPermit] = useState("")

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setBusinessId(initialData.businessId)
      setFiscalPermit(initialData.fiscalPermit)
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !businessId || !fiscalPermit) {
      // Basic validation
      alert("Please fill all fields")
      return
    }
    onSubmit({ name, businessId, fiscalPermit })
  }

  return (
    <Card className="w-full max-w-md p-6 sm:p-8 text-center border-lime-500/20 bg-gradient-to-br from-background via-mint-50 to-lime-50/30 shadow-xl">
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-2xl shadow-lg">
          <Store className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
        </div>
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-lime-600 to-emerald-600 bg-clip-text text-transparent mb-2">
        Set up your Business
      </h1>
      <p className="text-forest-600 text-sm mb-6">Fill in your business details to get started</p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="relative">
          <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-lime-600" />
          <Input
            type="text"
            placeholder="Business Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="pl-11 bg-white/80 border-2 border-lime-300 focus:border-lime-500 text-forest-700 placeholder-forest-400 h-12 rounded-xl shadow-sm"
          />
        </div>
        <div className="relative">
          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-lime-600" />
          <Input
            type="text"
            placeholder="Business ID"
            value={businessId}
            onChange={(e) => setBusinessId(e.target.value)}
            className="pl-11 bg-white/80 border-2 border-lime-300 focus:border-lime-500 text-forest-700 placeholder-forest-400 h-12 rounded-xl shadow-sm"
          />
        </div>
        <div className="relative">
          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-lime-600" />
          <Input
            type="text"
            placeholder="Fiscal Permit"
            value={fiscalPermit}
            onChange={(e) => setFiscalPermit(e.target.value)}
            className="pl-11 bg-white/80 border-2 border-lime-300 focus:border-lime-500 text-forest-700 placeholder-forest-400 h-12 rounded-xl shadow-sm"
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-lime-500 via-emerald-500 to-lime-600 hover:from-lime-600 hover:via-emerald-600 hover:to-lime-700 text-white font-semibold h-12 sm:h-14 text-base sm:text-lg shadow-lg rounded-xl mt-6"
        >
          Open Business
        </Button>
      </form>
    </Card>
  )
}
