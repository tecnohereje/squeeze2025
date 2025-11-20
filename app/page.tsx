"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { authenticate, isWebView, TransactionResult, ChainId } from "@lemoncash/mini-app-sdk"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card" // Added Card subcomponents
import { Button } from "@/components/ui/button"
import { RefreshCw, Store, CreditCard, Search, ArrowRight } from "lucide-react" // Added more icons
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
import {
  getUserBalance,
  executeTransaction,
  submitReview,
  getBusinesses,
  registerBusiness,
  seedMockBusinesses, // Import seed function
  type BusinessProfile,
} from "@/lib/ledger"

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
  const [screen, setScreenState] = useState("main")
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const prevScreenRef = useRef<string>()

  // Business Data State
  const [businessData, setBusinessData] = useState<BusinessData | null>(null)
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessProfile | null>(null)

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
        setScreenState("main")
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
    const businessName = params.get("businessName")
    const recipient = params.get("recipient")
    const amount = params.get("amount")
    if (businessName && recipient) {
      setPaymentBusinessName(businessName)
      setPaymentRecipientAddress(recipient)
      if (amount) setPaymentAmount(amount)
      setScreen("paymentInterface")
    }

    const initializeApp = async () => {
      const inWebView = isWebView()
      setIsWebViewDetected(inWebView)

      try {
        await seedMockBusinesses()
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
          setTransactionStatus(`Authentication failed: ${result.error?.message || "Unknown error"}`)
        }
      } catch (error) {
        setTransactionStatus(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
      } finally {
        setIsLoading(false)
      }
    }
    initializeApp()
  }, [])

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
      const businessName = businesses.find((b) => b.id === recipient)?.name
      setPaymentBusinessName(businessName || "Unknown Business")

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
    try {
      await submitReview(paymentRecipientAddress, rating, comment, wallet)
      alert("Review submitted!")
      setScreen("main")
    } catch (error) {
      alert("Failed to submit review.")
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
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=squeeze://pay?businessName=${encodeURIComponent(
      businessData?.name || "",
    )}&recipient=${wallet}&amount=${totalAmount}&margin=0`
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
            onCancel={() => setScreen("main")}
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
        return <RatingScreen businessName={paymentBusinessName} onSubmit={handleReviewSubmit} />
      case "businessList":
        return (
          <BusinessList
            onViewDetails={(business) => {
              setSelectedBusiness(business)
              setScreen("businessDetail")
            }}
            onBack={() => setScreen("main")}
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
        return <CatalogSale cart={cart} onUpdateCart={handleUpdateCart} onNavigate={setScreen} />
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
          <Card className="w-full max-w-md p-6 sm:p-8 border-lime-500/20 bg-gradient-to-br from-background via-mint-50 to-lime-50/30 shadow-xl">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-lime-600 to-emerald-600 bg-clip-text text-transparent mb-2 text-center">
              Scan to Pay
            </h1>
            <p className="text-center text-forest-600 mb-6 text-sm sm:text-base">
              Total: <span className="font-bold text-lg">${totalAmount}</span>
            </p>

            <div className="relative mb-6">
              <div className="absolute inset-0 bg-lime-gradient-vibrant rounded-2xl blur-xl opacity-30" />
              <div className="relative bg-white p-4 sm:p-6 rounded-2xl border-2 border-lime-400 shadow-lg">
                <img src={qrCodeUrl || "/placeholder.svg"} alt="Cart QR Code" className="w-full h-auto rounded-xl" />
              </div>
            </div>

            <Button
              onClick={() => setScreen("cartSummary")}
              variant="outline"
              className="w-full h-12 text-base font-semibold bg-white hover:bg-lime-50 text-forest-700 border-lime-300 hover:border-lime-400"
            >
              Back to Cart
            </Button>
          </Card>
        )
      case "main":
      default:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Hero Section */}
            <section className="space-y-2 text-center md:text-left">
              <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl">
                Manage your <span className="text-primary bg-primary/20 px-2 rounded-lg">crypto business</span>
              </h1>
              <p className="text-muted-foreground text-balance">
                Accept payments, manage products, and grow your business on Base.
              </p>
            </section>

            {/* Action Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card
                className="group relative overflow-hidden border-muted bg-card/50 hover:bg-card transition-all hover:shadow-md cursor-pointer"
                onClick={() => setScreen("businessHub")}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-2">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary-foreground group-hover:scale-110 transition-transform">
                    <Store className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">Business Hub</CardTitle>
                  <CardDescription>Manage your store & products</CardDescription>
                </CardHeader>
                <CardContent>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </CardContent>
              </Card>

              <Card
                className="group relative overflow-hidden border-muted bg-card/50 hover:bg-card transition-all hover:shadow-md cursor-pointer"
                onClick={() => {
                  setPaymentBusinessName("")
                  setPaymentRecipientAddress("")
                  setPaymentAmount("")
                  setScreen("paymentInterface")
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-2">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground group-hover:scale-110 transition-transform">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">Make a Payment</CardTitle>
                  <CardDescription>Pay merchants directly</CardDescription>
                </CardHeader>
                <CardContent>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </CardContent>
              </Card>

              <Card
                className="group relative overflow-hidden border-muted bg-card/50 hover:bg-card transition-all hover:shadow-md cursor-pointer md:col-span-2"
                onClick={() => setScreen("businessList")}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <div>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent-foreground group-hover:scale-110 transition-transform">
                      <Search className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">Discover Businesses</CardTitle>
                    <CardDescription>Find and rate local merchants</CardDescription>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </CardHeader>
              </Card>
            </div>

            {/* Balance Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight">Your Wallet</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-primary"
                  onClick={fetchBalance}
                >
                  <RefreshCw className="mr-1 h-3 w-3" /> Refresh
                </Button>
              </div>
              <Card className="border-muted bg-card/50">
                <CardContent className="p-4 flex flex-col items-center justify-center h-24">
                  <span className="text-sm text-muted-foreground">Simulated Balance</span>
                  <span className="text-2xl font-bold text-foreground">{balance} USDC</span>
                </CardContent>
              </Card>
            </div>
          </div>
        )
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-lemon-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Initializing Mini App...</p>
        </div>
      </main>
    )
  }

  if (!isWebViewDetected && !wallet) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center border-slate-700 bg-slate-800/50">
          <h1 className="text-2xl font-bold text-slate-100 mb-4">🍋 Squeeze</h1>
          <p className="text-slate-300 mb-2">This app only works inside the Lemon Cash mobile app.</p>
          <p className="text-slate-400 text-sm">Please open this link in your Lemon Cash wallet to use all features.</p>
        </Card>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-lime-mesh font-sans text-foreground selection:bg-primary/30">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6 max-w-md mx-auto md:max-w-3xl lg:max-w-5xl">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lime-gradient-vibrant text-primary-foreground shadow-md">
              <Store className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Squeeze
            </span>
          </div>
          <div className="flex items-center gap-2">
            {wallet ? (
              <div className="flex items-center gap-2 rounded-full bg-lime-gradient-subtle px-3 py-1 text-xs font-medium text-foreground border border-primary/20 shadow-sm">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-sm shadow-primary/50" />
                {wallet.slice(0, 6)}...{wallet.slice(-4)}
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="h-8 rounded-full text-xs bg-transparent border-primary/30 hover:bg-primary/10 hover:border-primary"
                onClick={() => {}}
              >
                Connect
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 md:px-6 md:py-8 max-w-md mx-auto md:max-w-3xl lg:max-w-5xl">
        {renderScreen()}
      </main>
    </div>
  )
}
