import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    cartCount,
    triggerConfetti,
    showToast,
    t
  } = useApp();

  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);

  if (!isCartOpen) return null;

  const freeShippingThreshold = 35.0;
  const progressToFreeShipping = Math.min(100, (cartTotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartTotal);

  const applyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'TAIGA10' || promoCode.trim().toUpperCase() === 'AUTUMN') {
      setPromoDiscount(5.0);
      showToast('Applied €5.00 Boreal Harvest voucher!', 'reward');
    } else {
      showToast('Code not recognized. Try TAIGA10', 'info');
    }
  };

  const finalTotal = Math.max(0, cartTotal - promoDiscount);

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setOrderCompleted(true);
      triggerConfetti();
      clearCart();
    }, 1200);
  };

  const handleClose = () => {
    setOrderCompleted(false);
    setIsCartOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-[#0F1E15]/60 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-[#FBF9F5] h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-250">
        {/* Drawer Header */}
        <div className="p-4 bg-white border-b border-[#EBE6DC] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#183324] text-[#E5A953] flex items-center justify-center font-bold text-xs">
              {cartCount}
            </div>
            <div>
              <h2 className="font-editorial text-xl font-medium text-[#14261B]">{t.cart.title}</h2>
              <p className="text-[11px] text-[#78887C] tracking-wide">{t.cart.sub}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-[#F3F0E6] flex items-center justify-center text-[#3D5244] hover:bg-[#EAE5D9] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {orderCompleted ? (
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#183324] text-[#E5A953] flex items-center justify-center mb-4">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="font-editorial text-2xl text-[#14261B] mb-2">Order Confirmed!</h3>
            <p className="text-sm text-[#5C6E61] mb-6 max-w-xs">
              Kiitos! Your cold box will be dispatched with Posti Eco. Tracking details have been sent to your device.
            </p>
            <div className="w-full bg-white rounded-xl p-4 border border-[#E5E0D2] mb-6 text-left">
              <div className="flex justify-between text-xs text-[#6C7E71] mb-1">
                <span>Dispatch Origin</span>
                <span className="font-medium text-[#1A2E21]">Oulu Boreal Lab</span>
              </div>
              <div className="flex justify-between text-xs text-[#6C7E71]">
                <span>Estimated Arrival</span>
                <span className="font-medium text-[#1A2E21]">Tomorrow, 14:00 - 18:00</span>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-full py-3 bg-[#183324] text-[#FAF8F3] font-semibold text-sm rounded-xl hover:bg-[#234431] transition-colors"
            >
              Back to Tellervo
            </button>
          </div>
        ) : (
          <>
            {/* Free Shipping Meter */}
            <div className="p-3 bg-[#EAF2ED] border-b border-[#D8E6DC] text-xs text-[#2A4B36]">
              <div className="flex items-center justify-between mb-1.5 font-medium">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D49B4E]" />
                  {remainingForFreeShipping === 0
                    ? '🎉 Free Subarctic Chilled Delivery unlocked!'
                    : `Add €${remainingForFreeShipping.toFixed(2)} for Free Chilled Delivery`}
                </span>
                <span className="text-[11px] font-bold">{Math.round(progressToFreeShipping)}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#D4E4D8] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2A5237] transition-all duration-300 rounded-full"
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-12 h-12 rounded-full bg-[#EAE5D9] flex items-center justify-center text-[#738577] mb-3">
                    <Trash2 className="w-5 h-5 opacity-40" />
                  </div>
                  <p className="font-editorial text-lg text-[#162B1E]">{t.cart.emptyTitle}</p>
                  <p className="text-xs text-[#7A8C7E] mt-1 mb-4">{t.cart.emptySub}</p>
                  <button
                    onClick={handleClose}
                    className="px-5 py-2 bg-[#183324] text-white rounded-xl text-xs font-semibold"
                  >
                    {t.cart.browseBlends}
                  </button>
                </div>
              ) : (
                cart.map(item => (
                  <div
                    key={item.product.id}
                    className="bg-white rounded-2xl p-3 border border-[#ECE6D9] shadow-soft-sm flex gap-3 items-center"
                  >
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-xl object-cover border border-[#EBE5D8]"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-editorial text-[15px] font-semibold text-[#183022] leading-tight truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-[11px] text-[#7C8D80] truncate">{item.product.size}</p>
                      <div className="text-[13px] font-bold text-[#14261B] mt-0.5">
                        €{(item.product.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                    {/* Quantity controls */}
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="flex items-center gap-1.5 bg-[#F6F3EB] rounded-full p-1 border border-[#E5DFD0]">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, -1)}
                          className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#253D2E] shadow-sm hover:bg-[#FDFBF7]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-[#1A2F22] w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, 1)}
                          className="w-5 h-5 rounded-full bg-[#183324] flex items-center justify-center text-white shadow-sm hover:bg-[#274633]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-[10px] text-[#A65B5B] hover:underline flex items-center gap-0.5"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>
                ))
              )}

              {/* Promo voucher input */}
              {cart.length > 0 && (
                <div className="pt-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo voucher (e.g. TAIGA10)"
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#DED7C8] bg-white text-[#1C3123] placeholder-[#9CA99F] focus:outline-none focus:ring-1 focus:ring-[#183324]"
                    />
                    <button
                      onClick={applyPromo}
                      className="px-3.5 py-2 bg-[#2D4E39] text-[#FAF8F3] text-xs font-semibold rounded-xl hover:bg-[#20392A] transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {promoDiscount > 0 && (
                    <p className="text-[11px] text-[#347648] font-medium mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> €5.00 discount applied!
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Drawer Footer & Checkout */}
            {cart.length > 0 && (
              <div className="p-4 bg-white border-t border-[#ECE5D8] space-y-3">
                <div className="space-y-1.5 text-xs text-[#637568]">
                  <div className="flex justify-between">
                    <span>{t.cart.subtotal}</span>
                    <span className="font-semibold text-[#183022]">€{cartTotal.toFixed(2)}</span>
                  </div>
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-[#357549]">
                      <span>{t.cart.voucherDiscount}</span>
                      <span>-€{promoDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>{t.cart.packaging}</span>
                    <span className="text-[#357549] font-medium">{t.cart.freeBiodegradable}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.cart.courier}</span>
                    <span className="font-semibold text-[#183022]">
                      {remainingForFreeShipping === 0 ? '€0.00' : '€3.50'}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[#EBE5D8] flex justify-between text-base font-bold text-[#14261B]">
                    <span>{t.cart.totalDue}</span>
                    <span>€{(finalTotal + (remainingForFreeShipping === 0 ? 0 : 3.5)).toFixed(2)}</span>
                  </div>
                </div>

                <button
                  disabled={isCheckingOut}
                  onClick={handleCheckout}
                  className="w-full py-3.5 bg-[#183324] text-[#FAF8F3] rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#224430] active:scale-[0.98] transition-all shadow-md"
                >
                  {isCheckingOut ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t.cart.securing}
                    </span>
                  ) : (
                    <>
                      <span>{t.cart.completeCheckout}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#7C8E80]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#3E6F4E]" />
                  <span>{t.cart.guarantee}</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
