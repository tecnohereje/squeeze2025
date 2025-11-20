"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { authenticate, isWebView, TransactionResult, ChainId } from "@lemoncash/mini-app-sdk"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Store, CreditCard, Search, ArrowRight } from "lucide-react"
import BusinessForm from "@/components/business-form"
import BusinessHub from "@/components/business-hub"
import GeneralSale from "@/components/general-sale"
import SpecificSale from "@/components/specific-sale"
import CatalogSale from "@/components/catalog-sale"
import CartSummary from "@/components/cart-summary"
import PaymentInterface from "@/components/payment-interface"
import PaymentSuccess from "@/components/payment-success"
import RatingScreen from "@/components/rating-screen"
import BusinessList from "@/components/business-list"
import BusinessDetail from "@/components/business-detail"
import BusinessRankings from "@/components/business-rankings"
import MyReviews from "@/components/my-reviews"
import {
  getUserBalance,
  executeTransaction,
  submitReview,
  registerBusiness,
  seedMockBusinesses,
} from "@/lib/ledger"
import { getBusinesses, type Business } from "@/lib/business-service"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Types
type BusinessData = {
  name: string
  businessId: string
  fiscalPermit: string
}

export type Product = {
  id: number
  name: string
  price: number
  category: string
}

export type CartItem = {
  product: Product
  quantity: number
}

export default function MiniApp() {
  // Screen and Navigation State
  const [screen, setScreenState] = useState("businessList") // Default to businessList
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const prevScreenRef = useRef<string>(null)

  // Business Data State
  const [businessData, setBusinessData] = useState<BusinessData | null>(null)
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)

  // Simulated Ledger State
  const [wallet, setWallet] = useState<string | undefined>(undefined)
  const [balance, setBalance] = useState<string>("--")

  // UI State
  const [isLoading, setIsLoading] = useState(true)
  const [isWebViewDetected, setIsWebViewDetected] = useState(true)
  const [isTransacting, setIsTransacting] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState<string>("")

  // Payment State
  const [paymentBusinessName, setPaymentBusinessName] = useState("")
  const [paymentRecipientAddress, setPaymentRecipientAddress] = useState("")
  const [paymentAmount, setPaymentAmount] = useState("")

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([])

  // Review State
  const [reviewedBusinessIds, setReviewedBusinessIds] = useState<string[]>([])
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)



  // --- Navigation ---
  const setScreen = (newScreen: string) => {
    window.history.pushState({ screen: newScreen }, "")
    setScreenState(newScreen)
  }

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.screen) {
        setScreenState(event.state.screen)
      } else {
        setScreenState("businessList")
      }
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  // --- Cart Clearing Logic ---
  useEffect(() => {
    const prevScreen = prevScreenRef.current
    const catalogFlowScreens = ["catalogSale", "cartSummary", "qrCodeDisplay"]
    if (prevScreen && catalogFlowScreens.includes(prevScreen) && !catalogFlowScreens.includes(screen)) {
      handleClearCart()
    }
    prevScreenRef.current = screen
  }, [screen])

  // --- Initialization ---
  useEffect(() => {
    const storedBusinessData = localStorage.getItem("businessData")
    if (storedBusinessData) {
      setBusinessData(JSON.parse(storedBusinessData))
    }

    const params = new URLSearchParams(window.location.search)
    const page = params.get("page")
    const businessName = params.get("businessName")
    const recipient = params.get("recipient")
    const amount = params.get("amount")

    // If deeplink contains page=payment with business data, navigate to payment interface
    if (page === "payment" && businessName && recipient) {
      setPaymentBusinessName(businessName)
      setPaymentRecipientAddress(recipient)
      if (amount) setPaymentAmount(amount)
      setScreen("paymentInterface")
    }

    const initializeApp = async () => {
      const inWebView = isWebView()
      setIsWebViewDetected(inWebView)

      // Load reviewed businesses from localStorage
      const storedReviewedIds = localStorage.getItem("reviewedBusinessIds")
      if (storedReviewedIds) {
        setReviewedBusinessIds(JSON.parse(storedReviewedIds))
      }

      try {
        // seedMockBusinesses() // Optional: removed as we use local mock data for list now
      } catch (error) {
        console.error("Failed to seed mock businesses:", error)
      }

      if (!inWebView) {
        setWallet("0xDEMO_WALLET_1")
        setIsLoading(false)
        return
      }
      try {
        const result = await authenticate({ chainId: ChainId.BASE })
        if (result.result === TransactionResult.SUCCESS) {
          setWallet(result.data.wallet)
        } else {
          const error = "error" in result ? result.error : null
          setTransactionStatus(`Authentication failed: ${error?.message || "Unknown error"}`)
        }
      } catch (error) {
        setTransactionStatus(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
      } finally {
        setIsLoading(false)
      }
    }
    initializeApp()
  }, [])

  // Persist reviewed businesses
  useEffect(() => {
    localStorage.setItem("reviewedBusinessIds", JSON.stringify(reviewedBusinessIds))
  }, [reviewedBusinessIds])

  // --- Data Fetching (Simulated) ---
  const fetchBalance = useCallback(async () => {
    if (!wallet) return
    try {
      const userBalance = await getUserBalance(wallet)
      setBalance(userBalance.toFixed(2))
    } catch (error) {
      setTransactionStatus(`Error fetching balance: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }, [wallet])

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  // --- Handlers ---
  const handleBusinessSubmit = async (data: BusinessData) => {
    localStorage.setItem("businessData", JSON.stringify(data))
    setBusinessData(data)
    if (wallet) {
      await registerBusiness(
        wallet,
        data.name,
        "User-created business", // description
        "General", // category
        [], // products - empty initially
      )
    }
    setScreen("businessHub")
  }

  const handlePay = async (amount: string, recipient: string) => {
    if (!wallet || !amount || !recipient) return
    setIsTransacting(true)
    setTransactionStatus("")
    try {
      const numAmount = Number.parseFloat(amount)
      const numBalance = Number.parseFloat(balance)

      if (numAmount > numBalance) {
        throw new Error(`Insufficient balance. You have ${balance} USDC available.`)
      }

      await executeTransaction(wallet, recipient, numAmount)
      setPaymentAmount(amount)
      setPaymentRecipientAddress(recipient)

      const businesses = await getBusinesses()
      const business = businesses.find((b) => b.id === recipient)
      setPaymentBusinessName(business?.fantasyName || "Unknown Business")

      setTransactionStatus(`✅ Payment successful!`)
      await fetchBalance()
      setScreen("paymentSuccess")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      setTransactionStatus(`❌ Payment failed: ${errorMessage}`)
      alert(`Payment failed: ${errorMessage}\n\nPlease try again or contact support if the issue persists.`)
    } finally {
      setIsTransacting(false)
    }
  }

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!wallet) return
    setIsSubmittingReview(true)
    try {
      await submitReview(paymentRecipientAddress, rating, comment, wallet)
    } catch (error) {
      console.error("Failed to submit review:", error)
      // Continue to show success modal even if submission fails
    } finally {
      // Always add to reviewed businesses and show modal
      setReviewedBusinessIds((prev) => [...prev, paymentRecipientAddress])
      setShowSuccessModal(true)
      setIsSubmittingReview(false)
    }
  }

  // --- Cart Management ---
  const handleUpdateCart = (product: Product, quantity: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id)
      if (existingItem) {
        if (quantity <= 0) {
          return prevCart.filter((item) => item.product.id !== product.id)
        }
        return prevCart.map((item) => (item.product.id === product.id ? { ...item, quantity } : item))
      } else {
        if (quantity > 0) {
          return [...prevCart, { product, quantity }]
        }
        return prevCart
      }
    })
  }

  const handleClearCart = () => setCart([])

  const totalAmount = useMemo(() => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0).toFixed(2)
  }, [cart])

  const handleGenerateCartQr = () => {
    if (Number.parseFloat(totalAmount) <= 0) {
      alert("Cart is empty.")
      return
    }
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
      `lemoncash://app/mini-apps/webview/squeeze?page=payment&businessName=${encodeURIComponent(
        businessData?.name || "",
      )}&recipient=${wallet}&amount=${totalAmount}`,
    )}&margin=0`
    setQrCodeUrl(url)
    setScreenState("qrCodeDisplay")
  }

  // --- Screen Rendering ---
  const renderScreen = () => {
    switch (screen) {
      case "paymentInterface":
        return (
          <PaymentInterface
            businessName={paymentBusinessName}
            recipientAddress={paymentRecipientAddress}
            initialAmount={paymentAmount}
            balance={balance}
            onPay={handlePay}
            onCancel={() => setScreen("businessList")}
          />
        )
      case "paymentSuccess":
        return (
          <PaymentSuccess
            amount={paymentAmount}
            businessName={paymentBusinessName}
            onTimeout={() => setScreen("ratingScreen")}
          />
        )
      case "ratingScreen":
        return <RatingScreen businessName={paymentBusinessName} onSubmit={handleReviewSubmit} isSubmitting={isSubmittingReview} />
      case "businessRankings":
        return <BusinessRankings onBack={() => setScreen("businessList")} />
      case "myReviews":
        return <MyReviews wallet={wallet || ""} onBack={() => setScreen("businessList")} />
      case "businessList":
      case "main": // Map main to businessList
        return (
          <BusinessList
            onViewDetails={(business) => {
              setPaymentBusinessName(business.fantasyName)
              setPaymentRecipientAddress(business.id)
              setScreen("ratingScreen")
            }}
            onBack={() => {}} // No back action on main screen
            hiddenBusinessIds={reviewedBusinessIds}
            onNavigateToRankings={() => setScreen("businessRankings")}
            onNavigateToMyReviews={() => setScreen("myReviews")}
          />
        )
      case "businessDetail":
        return selectedBusiness ? (
          <BusinessDetail business={selectedBusiness} onBack={() => setScreen("businessList")} />
        ) : (
          <p>Business not found.</p>
        )
      case "businessForm":
        return <BusinessForm onSubmit={handleBusinessSubmit} initialData={businessData} />
      case "businessHub":
        return <BusinessHub onNavigate={setScreen} />
      case "generalSale":
        return <GeneralSale businessName={businessData?.name || ""} wallet={wallet || ""} />
      case "specificSale":
        return <SpecificSale businessName={businessData?.name || ""} wallet={wallet || ""} />
      case "catalogSale":
        return <CatalogSale businessWallet={wallet || ""} cart={cart} onUpdateCart={handleUpdateCart} onNavigate={setScreen} />
      case "cartSummary":
        return (
          <CartSummary
            cart={cart}
            onUpdateQuantity={(productId, quantity) => {
              const product = cart.find((item) => item.product.id === productId)?.product
              if (product) handleUpdateCart(product, quantity)
            }}
            onRemoveItem={(productId) => {
              const product = cart.find((item) => item.product.id === productId)?.product
              if (product) handleUpdateCart(product, 0)
            }}
            onClearCart={handleClearCart}
            onGenerateQrCode={handleGenerateCartQr}
          />
        )
      case "qrCodeDisplay":
        return (
          <Card className="w-full max-w-md p-6 sm:p-8 border-lemon-500/20 bg-gradient-to-br from-background via-mint-50 to-lemon-50/30 shadow-xl">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-lemon-600 to-emerald-600 bg-clip-text text-transparent mb-2 text-center">
              Scan to Pay
            </h1>
            <p className="text-center text-forest-600 mb-6 text-sm sm:text-base">
              Total: <span className="font-bold text-lg">${totalAmount}</span>
            </p>

            <div className="relative mb-6">
              <div className="absolute inset-0 bg-lemon-gradient-vibrant rounded-2xl blur-xl opacity-30" />
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lemon-gradient-vibrant text-primary-foreground shadow-md">
                <img src={qrCodeUrl || "/placeholder.svg"} alt="Cart QR Code" className="w-full h-auto rounded-xl" />
              </div>
            </div>

            <Button
              onClick={() => setScreen("cartSummary")}
              variant="outline"
              className="w-full h-12 text-base font-semibold bg-white hover:bg-lemon-50 text-forest-700 border-lemon-300 hover:border-lemon-400"
            >
              Back to Cart
            </Button>
          </Card>
        )
      default:
        return <BusinessList 
          onViewDetails={(b) => {
            setPaymentBusinessName(b.fantasyName)
            setPaymentRecipientAddress(b.id)
            setScreen("ratingScreen")
          }} 
          onBack={() => {}} 
          hiddenBusinessIds={reviewedBusinessIds}
        />
    }
  }

  // ... existing loading and webview checks

  return (
    <div className="min-h-screen bg-lemon-mesh font-sans text-foreground selection:bg-primary/30">
      {/* ... existing header */}

      <main className="container px-4 py-6 md:px-6 md:py-8 max-w-md mx-auto md:max-w-3xl lg:max-w-5xl">
        {renderScreen()}
      </main>

      <AlertDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <AlertDialogContent className="bg-gradient-to-br from-lemon-50 to-white border-lemon-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-center text-forest-800">
              Review Submitted! 🍋
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-forest-600 text-base">
              Thanks for sharing your experience. Your feedback helps the community grow!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction
              onClick={() => {
                setShowSuccessModal(false)
                setScreen("businessList")
              }}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-xl px-8"
            >
              Awesome
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
