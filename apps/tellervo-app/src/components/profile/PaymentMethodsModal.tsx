import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, Check, Plus, Smartphone, Building } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface PaymentMethodsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StoredPaymentMethod {
  id: string;
  name: string;
  detail: string;
  type: 'wallet' | 'card' | 'bank';
  isDefault: boolean;
  expiry?: string;
}

export const PaymentMethodsModal: React.FC<PaymentMethodsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, updateUserProfile, showToast } = useApp();

  const [methods, setMethods] = useState<StoredPaymentMethod[]>([
    {
      id: 'pay-1',
      name: 'Apple Pay',
      detail: user.paymentMethod.includes('Apple Pay') ? user.paymentMethod : 'Apple Pay •••• 9012',
      type: 'wallet',
      isDefault: true,
      expiry: 'Biometric Token',
    },
    {
      id: 'pay-2',
      name: 'Nordea Visa Debit',
      detail: 'Visa ending in •••• 4421',
      type: 'card',
      isDefault: false,
      expiry: 'Exp 08/28',
    },
    {
      id: 'pay-3',
      name: 'Finnish Online Banking (Verkkopankki)',
      detail: 'OP Financial Group Direct Debit',
      type: 'bank',
      isDefault: false,
    },
  ]);

  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');

  if (!isOpen) return null;

  const handleSetDefault = (id: string) => {
    setMethods(prev =>
      prev.map(m => ({
        ...m,
        isDefault: m.id === id,
      }))
    );
    const target = methods.find(m => m.id === id);
    if (target) {
      updateUserProfile({ paymentMethod: target.detail });
      showToast(`Default payment method updated to ${target.name}`);
    }
  };

  const handleAddNewCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCardNumber.length < 4) {
      showToast('Please enter the last 4 digits of your card', 'info');
      return;
    }

    const last4 = newCardNumber.slice(-4);
    const newMethod: StoredPaymentMethod = {
      id: `pay-${Date.now()}`,
      name: 'Mastercard Debit',
      detail: `Mastercard ending in •••• ${last4}`,
      type: 'card',
      isDefault: false,
      expiry: newCardExpiry || 'Exp 12/28',
    };

    setMethods(prev => [...prev, newMethod]);
    setIsAddingCard(false);
    setNewCardNumber('');
    setNewCardExpiry('');
    showToast('Payment method added and encrypted', 'success');
  };

  const getMethodIcon = (type: StoredPaymentMethod['type']) => {
    switch (type) {
      case 'wallet':
        return <Smartphone className="w-4 h-4 text-[#183324]" />;
      case 'card':
        return <CreditCard className="w-4 h-4 text-[#183324]" />;
      case 'bank':
        return <Building className="w-4 h-4 text-[#183324]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#0E1D14]/70 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-sm bg-[#FBF9F5] rounded-3xl p-6 shadow-2xl border border-[#E8E2D4] z-10 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#937548] uppercase block">
              BILLING & PAYMENTS
            </span>
            <h3 className="font-editorial text-2xl font-medium text-[#14261B]">
              Payment Methods
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#EFECE2] flex items-center justify-center text-[#405445] hover:bg-[#E2DDD0] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#5D6F61] mb-4">
          Select your preferred payment method for auto-refills and seasonal orders.
        </p>

        {/* Methods List */}
        <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
          {methods.map(method => (
            <div
              key={method.id}
              onClick={() => handleSetDefault(method.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                method.isDefault
                  ? 'bg-white border-[#183324] shadow-soft-sm ring-1 ring-[#183324]'
                  : 'bg-white/80 border-[#E5DFD2] hover:border-[#183324]/40 hover:bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#F5F2EB] flex items-center justify-center shrink-0">
                    {getMethodIcon(method.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-[#14261B]">{method.name}</h4>
                      {method.isDefault && (
                        <span className="px-2 py-0.5 rounded-md bg-[#EAF3ED] border border-[#CFE2D4] text-[#246138] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <Check className="w-2.5 h-2.5 stroke-[3]" /> Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#5A6D5E] mt-0.5">{method.detail}</p>
                    {method.expiry && (
                      <p className="text-[11px] text-[#869689]">{method.expiry}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Method Form / Trigger */}
          {isAddingCard ? (
            <form onSubmit={handleAddNewCard} className="bg-white rounded-2xl p-4 border border-[#DED7C9] space-y-3 mt-3">
              <h5 className="text-xs font-bold text-[#183324] uppercase tracking-wider">
                Add New Card (Tokenized)
              </h5>
              <div>
                <input
                  type="text"
                  placeholder="Card Number (e.g. 4532 •••• •••• 9921)"
                  value={newCardNumber}
                  onChange={e => setNewCardNumber(e.target.value)}
                  maxLength={19}
                  className="w-full bg-[#FAF8F3] rounded-xl border border-[#DED7C9] px-3 py-2 text-xs text-[#14261B] focus:outline-none focus:border-[#183324]"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="MM / YY"
                  value={newCardExpiry}
                  onChange={e => setNewCardExpiry(e.target.value)}
                  maxLength={5}
                  className="w-1/2 bg-[#FAF8F3] rounded-xl border border-[#DED7C9] px-3 py-2 text-xs text-[#14261B] focus:outline-none focus:border-[#183324]"
                />
                <input
                  type="password"
                  placeholder="CVC"
                  maxLength={4}
                  className="w-1/2 bg-[#FAF8F3] rounded-xl border border-[#DED7C9] px-3 py-2 text-xs text-[#14261B] focus:outline-none focus:border-[#183324]"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#183324] text-white text-xs font-semibold rounded-xl hover:bg-[#254632]"
                >
                  Save Card
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingCard(false)}
                  className="px-3 py-2 bg-[#F3EFE6] text-[#2A3E31] text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingCard(true)}
              className="w-full py-2.5 rounded-2xl border-2 border-dashed border-[#DED7C9] hover:border-[#183324] text-[#183324] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Payment Card</span>
            </button>
          )}
        </div>

        {/* Security Trust Signal */}
        <div className="p-3 bg-[#EAF3ED] border border-[#CFE2D4] rounded-2xl mt-4 flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#26683B] shrink-0" />
          <p className="text-[10px] text-[#2B5437] leading-relaxed">
            Encrypted with 256-bit bank-grade tokenization. Raw card credentials are never stored.
          </p>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#EAE4D7] mt-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-[#183324] text-[#FAF8F3] text-xs font-semibold rounded-xl hover:bg-[#254632] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
