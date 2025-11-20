'use client';

import { useState, useEffect } from 'react';
import {
  authenticate,
  isWebView,
  TransactionResult,
  ChainId,
  callSmartContract,
} from '@lemoncash/mini-app-sdk';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Landmark } from 'lucide-react';
import BusinessForm from '@/components/business-form';
import BusinessOpen from '@/components/business-open';
import PaymentInterface from '@/components/payment-interface';

type BusinessData = {
  name: string;
  businessId: string;
  fiscalPermit: string;
};

export default function MiniApp() {
  const [screen, setScreenState] = useState('main');
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [wallet, setWallet] = useState<string | undefined>(undefined);
  const [balance, setBalance] = useState<string>('--');
  const [isLoading, setIsLoading] = useState(true);
  const [isWebViewDetected, setIsWebViewDetected] = useState(true);
  const [isTransacting, setIsTransacting] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<string>('');
  const [paymentBusinessName, setPaymentBusinessName] = useState('');
  const [paymentRecipientAddress, setPaymentRecipientAddress] = useState('');

  const setScreen = (newScreen: string) => {
    window.history.pushState({ screen: newScreen }, '');
    setScreenState(newScreen);
  };

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      setScreenState('main');
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    const storedBusinessData = localStorage.getItem('businessData');
    if (storedBusinessData) {
      setBusinessData(JSON.parse(storedBusinessData));
    }

    const params = new URLSearchParams(window.location.search);
    const businessName = params.get('businessName');
    const recipient = params.get('recipient');

    if (businessName && recipient) {
      setPaymentBusinessName(businessName);
      setPaymentRecipientAddress(recipient);
      setScreen('paymentInterface');
    }

    const initializeApp = async () => {
      const inWebView = isWebView();
      setIsWebViewDetected(inWebView);

      if (!inWebView) {
        setIsLoading(false);
        return;
      }

      try {
        const result = await authenticate({
          chainId: ChainId.BASE,
        });

        if (result.result === TransactionResult.SUCCESS) {
          setWallet(result.data.wallet);
        } else if (result.result === TransactionResult.FAILED) {
          setTransactionStatus(
            `Authentication failed: ${result.error.message}`
          );
        } else if (result.result === TransactionResult.CANCELLED) {
          setTransactionStatus('Authentication was cancelled');
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

  useEffect(() => {
    const fetchBalance = async () => {
      if (!wallet) return;

      try {
        const response = await fetch(
          `https://api.routescan.io/v2/network/testnet/evm/84532/etherscan/api?module=account&action=tokenbalance&contractaddress=0x036CbD53842c5426634e7929541eC2318f3dCF7e&address=${wallet}`
        );
        const data = await response.json();
        if (data.status === '1') {
          const balanceInWei = BigInt(data.result);
          const balanceInUsdc = Number(balanceInWei) / 1e6;
          setBalance(balanceInUsdc.toFixed(2));
        } else {
          setBalance('0.00');
        }
      } catch (error) {
        setTransactionStatus(
          `Error fetching balance: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 5000);

    return () => clearInterval(interval);
  }, [wallet]);

  const handleBusinessSubmit = (data: BusinessData) => {
    localStorage.setItem('businessData', JSON.stringify(data));
    setBusinessData(data);
    setScreen('businessOpen');
  };

  const handlePay = async (amount: string, recipient: string) => {
    if (!wallet || !amount || !recipient) return;

    setIsTransacting(true);
    setTransactionStatus('');

    try {
      const amountInSmallestUnit = BigInt(parseFloat(amount) * 1e6);
      const result = await callSmartContract({
        chainId: ChainId.BASE,
        contractAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
        method: 'transfer',
        abi: [
          {
            name: 'transfer',
            type: 'function',
            inputs: [
              { name: '_to', type: 'address' },
              { name: '_value', type: 'uint256' },
            ],
            outputs: [{ name: '', type: 'bool' }],
            stateMutability: 'nonpayable',
          },
        ],
        args: [recipient, amountInSmallestUnit.toString()],
      });

      if (result.result === TransactionResult.SUCCESS) {
        setTransactionStatus(
          `✅ Payment successful! Tx: ${result.data.txHash.slice(0, 10)}...`
        );
        alert('Payment successful!');
        setScreen('main');
      } else if (result.result === TransactionResult.FAILED) {
        setTransactionStatus(`❌ Payment failed: ${result.error.message}`);
      } else if (result.result === TransactionResult.CANCELLED) {
        setTransactionStatus('❌ Payment was cancelled');
      }
    } catch (error) {
      setTransactionStatus(
        `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsTransacting(false);
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

  if (!isWebViewDetected) {
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

  if (screen === 'paymentInterface') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <PaymentInterface
          businessName={paymentBusinessName}
          recipientAddress={paymentRecipientAddress}
          balance={balance}
          onPay={handlePay}
          onCancel={() => setScreen('main')}
        />
      </main>
    );
  }

  if (screen === 'businessForm') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <BusinessForm onSubmit={handleBusinessSubmit} initialData={businessData} />
      </main>
    );
  }

  if (screen === 'businessOpen') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        {wallet && <BusinessOpen wallet={wallet} balance={balance} onEdit={() => setScreenState('businessForm')} />}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto flex flex-col justify-center items-center h-full">
        {/* Header */}
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
                onClick={() => setScreen('businessOpen')}
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
                setScreen('paymentInterface');
              }}
              className="w-full h-24 text-lg"
              variant="outline"
            >
              <Landmark className="mr-2 h-6 w-6" /> Go to Payment
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
    </main>
  );
}
