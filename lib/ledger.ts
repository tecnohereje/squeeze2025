// --- BINS ---
const JSONBIN_API_KEY = "$2a$10$GVC9H798HC/RmxOCkazso.2poPKnfchlFGC5CI1BM/3PJBAu6VwJK" // Shared Key
const USERS_BIN_URL = "https://api.jsonbin.io/v3/b/691edcc743b1c97be9b91b85"
const RATINGS_BIN_URL = "https://api.jsonbin.io/v3/b/691edd3743b1c97be9b91cab"
const BUSINESSES_BIN_URL = "https://api.jsonbin.io/v3/b/691edd11ae596e708f64d351"

import { db } from "./firebase"
import { ref, push } from "firebase/database"

const initialBalance = 100

// --- Types ---
type UserLedger = {
  [walletAddress: string]: {
    balance: number
  }
}

type Business = {
  walletAddress: string
  name: string
  description?: string // New field
  category?: string // New field
  products?: Product[] // New field for catalog
  location?: {
    lat: number
    lng: number
    address: string
  }
}

type BusinessLedger = {
  [walletAddress: string]: Business
}

export type Rating = {
  businessId: string
  rating: number
  comment: string
  author: string
  timestamp: string
}

export type BusinessProfile = {
  id: string
  name: string
  avgRating: number
  ratings: Rating[]
  description?: string // New field
  category?: string // New field
  products?: Product[] // New field for catalog
  location?: {
    lat: number
    lng: number
    address: string
  }
}

export type Product = {
  id: number
  name: string
  price: number
  category: string
}

// --- Private Functions ---
async function getBin<T>(binUrl: string): Promise<T> {
  const response = await fetch(binUrl, {
    headers: {
      "X-Master-Key": JSONBIN_API_KEY,
    },
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch bin: ${binUrl}`)
  }
  const data = await response.json()
  return data.record
}

async function updateBin<T>(binUrl: string, data: T): Promise<void> {
  const response = await fetch(binUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": JSONBIN_API_KEY,
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error(`Failed to update bin: ${binUrl}`)
  }
}

// --- Public Functions ---

// User and Transaction Management
export async function getUserBalance(walletAddress: string): Promise<number> {
  const ledger = await getBin<UserLedger>(USERS_BIN_URL)
  if (!ledger[walletAddress]) {
    ledger[walletAddress] = { balance: initialBalance }
    await updateBin(USERS_BIN_URL, ledger)
    return initialBalance
  }
  return ledger[walletAddress].balance
}

export async function executeTransaction(fromAddress: string, toAddress: string, amount: number): Promise<void> {
  const ledger = await getBin<UserLedger>(USERS_BIN_URL)
  if (!ledger[fromAddress]) {
    ledger[fromAddress] = { balance: initialBalance }
  }
  if (!ledger[toAddress]) {
    ledger[toAddress] = { balance: initialBalance }
  }
  if (ledger[fromAddress].balance < amount) {
    throw new Error("Insufficient funds")
  }
  ledger[fromAddress].balance -= amount
  ledger[toAddress].balance += amount
  await updateBin(USERS_BIN_URL, ledger)
}

// Rating and Business Management
export const submitReview = async (
  businessId: string,
  rating: number,
  comment: string,
  wallet: string,
): Promise<boolean> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  try {
    // Save to Firebase Realtime Database
    const reviewData = {
      author: wallet,
      rating,
      comment,
      timestamp: new Date().toISOString(),
    }

    // Add to reviews path for this business
    const reviewsRef = ref(db, `businesses/${businessId}/reviews`)
    await push(reviewsRef, reviewData)

    console.log("Review saved to Firebase Realtime Database")
    return true
  } catch (error) {
    console.error("Failed to save review to Firebase Realtime Database:", error)
    // Continue gracefully even if Firebase fails
    return false
  }
}

export async function registerBusiness(
  walletAddress: string,
  name: string,
  description?: string,
  category?: string,
  products?: Product[],
  location?: {
    lat: number
    lng: number
    address: string
  },
): Promise<void> {
  const businesses = await getBin<BusinessLedger>(BUSINESSES_BIN_URL)
  businesses[walletAddress] = {
    walletAddress,
    name,
    description,
    category,
    products,
    location,
  }
  await updateBin(BUSINESSES_BIN_URL, businesses)
}

export async function updateBusinessProducts(walletAddress: string, products: Product[]): Promise<void> {
  const businesses = await getBin<BusinessLedger>(BUSINESSES_BIN_URL)
  if (businesses[walletAddress]) {
    businesses[walletAddress].products = products
    await updateBin(BUSINESSES_BIN_URL, businesses)
  }
}

export async function getBusinesses(): Promise<BusinessProfile[]> {
  const businesses = await getBin<BusinessLedger>(BUSINESSES_BIN_URL)
  const allRatings = await getBin<Rating[]>(RATINGS_BIN_URL)

  const profiles: BusinessProfile[] = []

  for (const walletAddress in businesses) {
    const business = businesses[walletAddress]
    const businessRatings = allRatings.filter((r) => r.businessId === walletAddress)
    const avgRating =
      businessRatings.length > 0 ? businessRatings.reduce((sum, r) => sum + r.rating, 0) / businessRatings.length : 0

    profiles.push({
      id: business.walletAddress,
      name: business.name,
      avgRating,
      ratings: businessRatings,
      description: business.description, // Include new fields
      category: business.category,
      products: business.products,
      location: business.location,
    })
  }

  return profiles
}

export async function seedMockBusinesses(): Promise<void> {
  const mockBusinesses = [
    {
      walletAddress: "0xDEMO_WALLET_2",
      name: "Lemon Coffee",
      description: "Premium coffee shop with a citrus twist",
      category: "Food & Beverage",
      location: {
        lat: 40.758,
        lng: -73.9855,
        address: "123 Broadway, New York, NY 10001",
      },
      products: [
        { id: 1, name: "Lemon Cold Brew", price: 4.5, category: "Drinks" },
        { id: 2, name: "Cappuccino", price: 4.0, category: "Drinks" },
        { id: 3, name: "Lemon Cake", price: 3.5, category: "Bakery" },
      ],
    },
    {
      walletAddress: "0xDEMO_WALLET_4",
      name: "Crypto Burgers",
      description: "Gourmet burgers for the blockchain era",
      category: "Food & Beverage",
      location: {
        lat: 34.0522,
        lng: -118.2437,
        address: "456 Sunset Blvd, Los Angeles, CA 90028",
      },
      products: [
        { id: 1, name: "Classic Burger", price: 8.0, category: "Food" },
        { id: 2, name: "Crypto Combo", price: 12.0, category: "Food" },
      ],
    },
    {
      walletAddress: "0xDEMO_WALLET_5",
      name: "Pixel Art Store",
      description: "Custom NFT and digital art prints",
      category: "Art & Design",
      location: {
        lat: 37.7749,
        lng: -122.4194,
        address: "789 Market St, San Francisco, CA 94103",
      },
      products: [
        { id: 1, name: "Custom NFT Print", price: 25.0, category: "Art" },
        { id: 2, name: "Pixel Avatar", price: 15.0, category: "Art" },
      ],
    },
    {
      walletAddress: "0xDEMO_WALLET_6",
      name: "Base Electronics",
      description: "Tech gadgets and accessories",
      category: "Electronics",
      location: {
        lat: 41.8781,
        lng: -87.6298,
        address: "321 Michigan Ave, Chicago, IL 60601",
      },
      products: [
        { id: 1, name: "USB-C Cable", price: 12.0, category: "Accessories" },
        { id: 2, name: "Wireless Mouse", price: 25.0, category: "Accessories" },
      ],
    },
  ]

  const businesses = await getBin<BusinessLedger>(BUSINESSES_BIN_URL)

  // Only seed if they don't exist
  for (const mock of mockBusinesses) {
    if (!businesses[mock.walletAddress]) {
      businesses[mock.walletAddress] = mock
    }
  }

  await updateBin(BUSINESSES_BIN_URL, businesses)

  // Seed mock ratings if they don't exist
  const allRatings = await getBin<Rating[]>(RATINGS_BIN_URL)
  const mockRatings: Rating[] = [
    {
      businessId: "0xDEMO_WALLET_2",
      rating: 5,
      comment: "Best cold brew in town! 🍋",
      author: "0x123...abc",
      timestamp: new Date().toISOString(),
    },
    {
      businessId: "0xDEMO_WALLET_2",
      rating: 4,
      comment: "Great atmosphere, slightly pricey.",
      author: "0x456...def",
      timestamp: new Date().toISOString(),
    },
    {
      businessId: "0xDEMO_WALLET_2",
      rating: 5,
      comment: "Love the lemon cake!",
      author: "0x789...ghi",
      timestamp: new Date().toISOString(),
    },
    {
      businessId: "0xDEMO_WALLET_4",
      rating: 3,
      comment: "Good burger, slow service.",
      author: "0xabc...123",
      timestamp: new Date().toISOString(),
    },
    {
      businessId: "0xDEMO_WALLET_4",
      rating: 5,
      comment: "Accepts crypto! Awesome.",
      author: "0xdef...456",
      timestamp: new Date().toISOString(),
    },
    {
      businessId: "0xDEMO_WALLET_5",
      rating: 5,
      comment: "Amazing custom prints.",
      author: "0xghi...789",
      timestamp: new Date().toISOString(),
    },
    {
      businessId: "0xDEMO_WALLET_6",
      rating: 2,
      comment: "Item arrived damaged.",
      author: "0xjkl...012",
      timestamp: new Date().toISOString(),
    },
    {
      businessId: "0xDEMO_WALLET_6",
      rating: 5,
      comment: "Fast shipping!",
      author: "0xmno...345",
      timestamp: new Date().toISOString(),
    },
  ]

  // Only add ratings that don't exist
  for (const mockRating of mockRatings) {
    const exists = allRatings.some(
      (r) =>
        r.businessId === mockRating.businessId && r.author === mockRating.author && r.comment === mockRating.comment,
    )
    if (!exists) {
      allRatings.push(mockRating)
    }
  }

  await updateBin(RATINGS_BIN_URL, allRatings)
}
