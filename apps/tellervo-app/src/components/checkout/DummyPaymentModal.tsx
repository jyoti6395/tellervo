import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, ShieldCheck, Copy, Check, CreditCard, Sparkles } from 'lucide-react';

interface DummyPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  currency?: string;
  onAccept: (paymentId: string) => Promise<void>;
  onDecline: (paymentId: string) => Promise<void>;
  isProcessing: boolean;
  processingMessage?: string;
}

const generateRandomPaymentId = () => {
  const timestampPart = Date.now().toString().slice(-4);
  const randomPart = Math.floor(10 + Math.random() * 90);
  return `PAY-FI-${timestampPart}${randomPart}`;
};

export const DummyPaymentModal: React.FC<DummyPaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  currency = 'EUR',
  onAccept,
  onDecline,
  isProcessing,
  processingMessage = 'Verifying with Supabase...',
}) => {
  const [paymentId, setPaymentId] = useState<string>(generateRandomPaymentId);
  const [copied, setCopied] = useState<boolean>(false);

  // Generate a fresh unique payment ID every time the modal opens
  useEffect(() => {
    if (isOpen) {
      setPaymentId(generateRandomPaymentId());
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyPaymentId = () => {
    if (paymentId) {
      navigator.clipboard?.writeText(paymentId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#FAF8F3] rounded-3xl p-6 shadow-2xl border border-[#E8E2D5] space-y-5 animate-in zoom-in-95 duration-200 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Banner */}
        <div className="flex items-center justify-between pb-2 border-b border-[#EAE4D7]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#5A6E60]">
              Payment Simulator • QA Mode
            </span>
          </div>
          <button
            type="button"
            disabled={isProcessing}
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 border border-[#E0D9CB] flex items-center justify-center text-[#5C6E61] hover:bg-white hover:text-[#183324] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Header Content */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-[#183324] text-[#E5A953] flex items-center justify-center mx-auto shadow-sm">
            <CreditCard className="w-6 h-6" />
          </div>
          <h3 className="font-editorial text-2xl font-medium text-[#14261B]">
            Payment Gateway Simulation
          </h3>
          <p className="text-xs text-[#5C6E61] max-w-xs mx-auto leading-relaxed">
            Choose an outcome below to test real-world order state transitions and Supabase database persistence.
          </p>
        </div>

        {/* Transaction Summary Card */}
        <div className="bg-white rounded-2xl p-4 border border-[#E8E2D5] shadow-soft-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-[#6C7E71]">
            <span>Generated Payment Reference</span>
            <button
              type="button"
              onClick={handleCopyPaymentId}
              className="flex items-center gap-1 font-mono text-[11px] font-bold text-[#183324] bg-[#F5F2EB] px-2 py-1 rounded-lg border border-[#E2DBD0] hover:bg-[#ECE6DC] transition-colors cursor-pointer"
              title="Click to copy payment reference ID"
            >
              <span>{paymentId}</span>
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-[#7C8E81]" />}
            </button>
          </div>

          <div className="pt-2 border-t border-[#F2EDE4] flex items-center justify-between">
            <span className="text-xs font-medium text-[#5C6E61]">Total Amount Due</span>
            <div className="text-right">
              <span className="text-lg font-bold text-[#14261B]">
                €{amount.toFixed(2)}
              </span>
              <span className="text-[11px] text-[#7A8C7E] ml-1 uppercase">{currency}</span>
            </div>
          </div>
        </div>

        {/* Test Mode Note */}
        <div className="flex items-start gap-2 bg-[#F2F7F4] border border-[#D5E6DC] rounded-xl p-3 text-[11px] text-[#3D694E] leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-[#3D694E] shrink-0 mt-0.5" />
          <span>
            <strong>Accepting</strong> creates a persistent order marked <em>In Progress</em> (Processing). 
            <strong> Declining</strong> marks the order <em>Cancelled</em> in your patron history.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          {/* 1. Accept Payment Button */}
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => onAccept(paymentId)}
            className="w-full py-3.5 bg-[#183324] text-[#FAF8F3] rounded-2xl font-semibold text-xs tracking-wide flex items-center justify-center gap-2 hover:bg-[#224430] active:scale-[0.99] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{processingMessage}</span>
              </span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#E5A953]" />
                <span>Accept Payment • Confirm Order</span>
                <Sparkles className="w-3.5 h-3.5 text-[#E5A953] opacity-80" />
              </>
            )}
          </button>

          {/* 2. Decline Payment Button */}
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => onDecline(paymentId)}
            className="w-full py-3 bg-white text-rose-700 rounded-2xl font-semibold text-xs tracking-wide flex items-center justify-center gap-2 border border-rose-200 hover:bg-rose-50/70 hover:border-rose-300 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>Decline Payment • Mark Cancelled</span>
          </button>
        </div>
      </div>
    </div>
  );
};

