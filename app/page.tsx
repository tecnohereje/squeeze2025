'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  authenticate,
  isWebView,
  TransactionResult,
  ChainId,
} from '@lemoncash/mini-app-sdk';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Landmark, RefreshCw, Star, ShoppingBag } from 'lucide-react';
import BusinessForm from '@/components/business-form';
import BusinessHub from '@/components/business-hub';
import GeneralSale from '@/components/general-sale';
import SpecificSale from '@/components/specific-sale';
import CatalogSale from '@/components/catalog-sale';
import CartSummary from '@/components/cart-summary';
import PaymentInterface from '@/components/payment-interface';
import PaymentSuccess from '@/components/payment-success';
import RatingScreen from '@/components/rating-screen';
import BusinessList from '@/components/business-list';
import BusinessDetail from '@/components/business-detail';
import {
  getUserBalance,
  executeTransaction,
  submitReview,
  getBusinesses,
  registerBusiness,
  BusinessProfile,
} from '@/lib/ledger';

// Types
type BusinessData = {
  name: string;
  businessId: string;
  fiscalPermit: string;
};

export type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export default function MiniApp() {
  // Screen and Navigation State
  const [screen, setScreenState] = useState('main');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const prevScreenRef = useRef<string>();

  // Business Data State
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessProfile | null>(null);


  // Simulated Ledger State
  const [wallet, setWallet] = useState<string | undefined>(undefined);
  const [balance, setBalance] = useState<string>('--');

  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [isWebViewDetected, setIsWebViewDetected] = useState(true);
  const [isTransacting, setIsTransacting] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<string>('');

  // Payment State
  const [paymentBusinessName, setPaymentBusinessName] = useState('');
  const [paymentRecipientAddress, setPaymentRecipientAddress] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);

  // --- Navigation ---
  const setScreen = (newScreen: string) => {
    window.history.pushState({ screen: newScreen }, '');
    setScreenState(newScreen);
  };

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.screen) {
        setScreenState(event.state.screen);
      } else {
        setScreenState('main');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // --- Cart Clearing Logic ---
  useEffect(() => {
    const prevScreen = prevScreenRef.current;
    const catalogFlowScreens = ['catalogSale', 'cartSummary', 'qrCodeDisplay'];
    if (
      prevScreen &&
      catalogFlowScreens.includes(prevScreen) &&
      !catalogFlowScreens.includes(screen)
    ) {
      handleClearCart();
    }
    prevScreenRef.current = screen;
  }, [screen]);

  // --- Initialization ---
  useEffect(() => {
    const storedBusinessData = localStorage.getItem('businessData');
    if (storedBusinessData) {
      setBusinessData(JSON.parse(storedBusinessData));
    }

    const params = new URLSearchParams(window.location.search);
    const businessName = params.get('businessName');
    const recipient = params.get('recipient');
    const amount = params.get('amount');
    if (businessName && recipient) {
      setPaymentBusinessName(businessName);
      setPaymentRecipientAddress(recipient);
      if (amount) setPaymentAmount(amount);
      setScreen('paymentInterface');
    }

    const initializeApp = async () => {
      const inWebView = isWebView();
      setIsWebViewDetected(inWebView);
      if (!inWebView) {
        setWallet('0xDEMO_WALLET_1');
        setIsLoading(false);
        return;
      }
      try {
        const result = await authenticate({ chainId: ChainId.BASE });
        if (result.result === TransactionResult.SUCCESS) {
          setWallet(result.data.wallet);
        } else {
          setTransactionStatus(
            `Authentication failed: ${result.error?.message || 'Unknown error'}`
          );
        }
      } catch (error) {
        setTransactionStatus(
          `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      } finally {
        setIsLoading(false);
      }
    };
    initializeApp();
  }, []);

  // --- Data Fetching (Simulated) ---
  const fetchBalance = useCallback(async () => {
    if (!wallet) return;
    try {
      const userBalance = await getUserBalance(wallet);
      setBalance(userBalance.toFixed(2));
    } catch (error) {
      setTransactionStatus(
        `Error fetching balance: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }, [wallet]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // --- Handlers ---
  const handleBusinessSubmit = async (data: BusinessData) => {
    localStorage.setItem('businessData', JSON.stringify(data));
    setBusinessData(data);
    if (wallet) {
      await registerBusiness(wallet, data.name);
    }
    setScreen('businessHub');
  };

  const handlePay = async (amount: string, recipient: string) => {
    if (!wallet || !amount || !recipient) return;
    setIsTransacting(true);
    setTransactionStatus('');
    try {
      await executeTransaction(wallet, recipient, parseFloat(amount));
      setPaymentAmount(amount);
      setPaymentRecipientAddress(recipient);
      setPaymentBusinessName(
        (await getBusinesses()).find((b) => b.id === recipient)?.name ||
          'Unknown Business'
      );
      setTransactionStatus(`✅ Payment successful!`);
      await fetchBalance();
      setScreen('paymentSuccess');
    } catch (error) {
      setTransactionStatus(
        `❌ Payment failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    } finally {
      setIsTransacting(false);
    }
  };

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!wallet) return;
    try {
      await submitReview(paymentRecipientAddress, rating, comment, wallet);
      alert('Review submitted!');
      setScreen('main');
    } catch (error) {
      alert('Failed to submit review.');
    }
  };

  // --- Cart Management ---
  const handleUpdateCart = (product: Product, quantity: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.product.id === product.id
      );
      if (existingItem) {
        if (quantity <= 0) {
          return prevCart.filter((item) => item.product.id !== product.id);
        }
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity } : item
        );
      } else {
        if (quantity > 0) {
          return [...prevCart, { product, quantity }];
        }
        return prevCart;
      }
    });
  };

  const handleClearCart = () => setCart([]);

  const totalAmount = useMemo(() => {
    return cart
      .reduce((total, item) => total + item.product.price * item.quantity, 0)
      .toFixed(2);
  }, [cart]);

  const handleGenerateCartQr = () => {
    if (parseFloat(totalAmount) <= 0) {
      alert('Cart is empty.');
      return;
    }
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=squeeze://pay?businessName=${encodeURIComponent(
      businessData?.name || ''
    )}&recipient=${wallet}&amount=${totalAmount}&margin=0`;
    setQrCodeUrl(url);
    setScreenState('qrCodeDisplay');
  };

  // --- Screen Rendering ---
  const renderScreen = () => {
    switch (screen) {
      case 'paymentInterface':
        return (
          <PaymentInterface
            businessName={paymentBusinessName}
            recipientAddress={paymentRecipientAddress}
            initialAmount={paymentAmount}
            balance={balance}
            onPay={handlePay}
            onCancel={() => setScreen('main')}
          />
        );
      case 'paymentSuccess':
        return (
          <PaymentSuccess
            amount={paymentAmount}
            businessName={paymentBusinessName}
            onTimeout={() => setScreen('ratingScreen')}
          />
        );
      case 'ratingScreen':
        return (
          <RatingScreen
            businessName={paymentBusinessName}
            onSubmit={handleReviewSubmit}
          />
        );
      case 'businessList':
        return (
          <BusinessList
            onViewDetails={(business) => {
              setSelectedBusiness(business);
              setScreen('businessDetail');
            }}
          />
        );
      case 'businessDetail':
        return selectedBusiness ? (
          <BusinessDetail business={selectedBusiness} />
        ) : (
          <p>Business not found.</p>
        );
      case 'businessForm':
        return (
          <BusinessForm
            onSubmit={handleBusinessSubmit}
            initialData={businessData}
          />
        );
      case 'businessHub':
        return <BusinessHub onNavigate={setScreen} />;
      case 'generalSale':
        return (
          <GeneralSale
            businessName={businessData?.name || ''}
            wallet={wallet || ''}
          />
        );
      case 'specificSale':
        return (
          <SpecificSale
            businessName={businessData?.name || ''}
            wallet={wallet || ''}
          />
        );
      case 'catalogSale':
        return (
          <CatalogSale
            cart={cart}
            onUpdateCart={handleUpdateCart}
            onNavigate={setScreen}
          />
        );
      case 'cartSummary':
        return (
          <CartSummary
            cart={cart}
            onUpdateQuantity={(productId, quantity) => {
              const product = cart.find(
                (item) => item.product.id === productId
              )?.product;
              if (product) handleUpdateCart(product, quantity);
            }}
            onRemoveItem={(productId) => {
              const product = cart.find(
                (item) => item.product.id === productId
              )?.product;
              if (product) handleUpdateCart(product, 0);
            }}
            onClearCart={handleClearCart}
            onGenerateQrCode={handleGenerateCartQr}
          />
        );
      case 'qrCodeDisplay':
        return (
          <Card className="w-full max-w-md p-8 text-center border-slate-700 bg-slate-800/50">
            <h1 className="text-2xl font-bold text-slate-100 mb-4">
              Pay ${totalAmount}
            </h1>
            <div className="flex justify-center">
              <img src={qrCodeUrl} alt="Cart QR Code" className="rounded-2xl" />
            </div>
            <Button
              onClick={() => setScreen('cartSummary')}
              className="mt-4"
              variant="outline"
            >
              Back to Cart
            </Button>
          </Card>
        );
      case 'main':
      default:
        return (
          <div className="max-w-2xl mx-auto flex flex-col justify-center items-center h-full">
            <div className="text-center mb-8 pt-8">
              <div className="text-5xl mb-3">🍋</div>
              <h1 className="text-3xl font-bold text-slate-100 mb-2">
                Squeeze
              </h1>
              <p className="text-slate-400">Base Sepolia</p>
            </div>
            <div className="w-full max-w-xs space-y-4">
              {businessData ? (
                <Button
                  onClick={() => setScreen('businessHub')}
                  className="w-full h-24 text-lg bg-lemon-500 hover:bg-lemon-600 text-slate-900 font-semibold"
                >
                  <QrCode className="mr-2 h-6 w-6" /> My Business
                </Button>
              ) : (
                <Button
                  onClick={() => setScreen('businessForm')}
                  className="w-full h-24 text-lg bg-lemon-500 hover:bg-lemon-600 text-slate-900 font-semibold"
                >
                  Set up Business
                </Button>
              )}
              <Button
                onClick={() => {
                  setPaymentBusinessName('');
                  setPaymentRecipientAddress('');
                  setPaymentAmount('');
                  setScreen('paymentInterface');
                }}
                className="w-full h-24 text-lg"
                variant="outline"
              >
                <Landmark className="mr-2 h-6 w-6" /> Go to Payment
              </Button>
              <Button
                onClick={() => setScreen('businessList')}
                className="w-full h-16 text-lg"
                variant="secondary"
              >
                <ShoppingBag className="mr-2 h-6 w-6" /> View Businesses
              </Button>
            </div>
            <div className="mt-6 text-center">
              <p className="text-slate-400 text-sm">
                Simulated Balance: {balance} USDC
              </p>
              <Button
                onClick={fetchBalance}
                variant="link"
                className="text-lemon-400"
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
              </Button>
            </div>
            {transactionStatus && (
              <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm mt-6">
                <div className="p-4">
                  <p className="text-sm text-slate-300 font-mono break-all">
                    {transactionStatus}
                  </p>
                </div>
              </Card>
            )}
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-lemon-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Initializing Mini App...</p>
        </div>
      </main>
    );
  }

  if (!isWebViewDetected && !wallet) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center border-slate-700 bg-slate-800/50">
          <h1 className="text-2xl font-bold text-slate-100 mb-4">
            🍋 Squeeze
          </h1>
          <p className="text-slate-300 mb-2">
            This app only works inside the Lemon Cash mobile app.
          </p>
          <p className="text-slate-400 text-sm">
            Please open this link in your Lemon Cash wallet to use all features.
          </p>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 flex items-center justify-center">
      {renderScreen()}
    </main>
  );
}
