"use client"

import { seedDatabase } from "@/lib/seed-firebase"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function SeedPage() {
  const [status, setStatus] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSeed = async () => {
    setIsLoading(true)
    setStatus("Seeding database...")
    try {
      const result = await seedDatabase()
      if (result.success) {
        setStatus("✅ Database seeded successfully! Check your Firebase Console.")
      } else {
        setStatus(`❌ Error: ${JSON.stringify(result.error)}`)
      }
    } catch (error) {
      setStatus(`❌ Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-lemon-mesh p-4">
      <Card className="p-8 max-w-md w-full space-y-4">
        <h1 className="text-2xl font-bold text-center">Firebase Database Seed</h1>
        <p className="text-sm text-muted-foreground text-center">
          Click the button below to populate your Firestore database with mock business data.
        </p>
        <Button 
          onClick={handleSeed} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Seeding..." : "Seed Database"}
        </Button>
        {status && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <pre className="text-sm whitespace-pre-wrap">{status}</pre>
          </div>
        )}
      </Card>
    </div>
  )
}
