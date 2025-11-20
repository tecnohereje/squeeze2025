import { db } from "./firebase"
import { ref, set } from "firebase/database"
import { MOCK_BUSINESSES } from "./mock-data"

export const seedDatabase = async () => {
  try {
    const businesses = MOCK_BUSINESSES.businesses

    // Write all businesses to /businesses path
    const businessesRef = ref(db, "businesses")
    
    // Convert to proper format with IDs
    const businessesData: Record<string, any> = {}
    for (const [id, business] of Object.entries(businesses)) {
      businessesData[id] = {
        ...business,
        id: id,
        createdAt: new Date().toISOString(),
      }
    }

    await set(businessesRef, businessesData)
    
    console.log("Database seeded successfully!")
    return { success: true }
  } catch (error) {
    console.error("Error seeding database:", error)
    return { success: false, error }
  }
}
