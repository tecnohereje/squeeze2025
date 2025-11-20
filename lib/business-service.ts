import { MOCK_BUSINESSES } from "./mock-data"
import { db } from "./firebase"
import { ref, get } from "firebase/database"

export type Business = {
  id: string
  fiscalName: string
  fantasyName: string
  description: string
  category: string
  verified: boolean
  location: {
    lat: number
    lng: number
    address: string
  }
  // Add these for compatibility with existing UI
  ratings: { author: string; rating: number; comment: string; timestamp?: string }[]
  avgRating: number
}

export const getBusinesses = async (): Promise<Business[]> => {
  try {
    // Try to fetch from Realtime Database
    const businessesRef = ref(db, "businesses")
    const snapshot = await get(businessesRef)
    
    if (!snapshot.exists()) {
      console.warn("No businesses found in Firebase, falling back to mock data.")
      throw new Error("Empty database")
    }

    const businessesData = snapshot.val()
    const businesses = Object.entries(businessesData).map(([id, data]: [string, any]) => {
      // Calculate mock ratings if not present in DB yet
      const mockRatingCount = Math.floor(Math.random() * 50) + 10
      const mockAvgRating = (Math.random() * 1.5 + 3.5).toFixed(1)

      return {
        id,
        ...data,
        // Ensure these exist even if not in DB yet
        ratings: data.ratings || Array(mockRatingCount).fill({ author: "User", rating: 5, comment: "Great!" }),
        avgRating: data.avgRating || Number(mockAvgRating),
      } as Business
    })
    
    console.log("✅ Loaded businesses from Firebase Realtime Database")
    return businesses

  } catch (error) {
    console.warn("Failed to fetch from Firebase, using mock data:", error)
    
    // Fallback to mock data
    return Object.entries(MOCK_BUSINESSES.businesses).map(([id, data]) => {
      const mockRatingCount = Math.floor(Math.random() * 50) + 10
      const mockAvgRating = (Math.random() * 1.5 + 3.5).toFixed(1)

      return {
        id,
        ...data,
        ratings: Array(mockRatingCount).fill({ author: "User", rating: 5, comment: "Great!" }),
        avgRating: Number(mockAvgRating),
      }
    })
  }
}
