import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  ShieldCheck,
  ShoppingBag,
  MapPin,
  CreditCard,
  ArrowRight,
  Smartphone,
  Building,
  CheckCircle2,
  Check,
  Plus,
  AlertCircle,
  Home,
  Building2,
  Package,
  Bell
} from 'lucide-react';
import { navigateTo, AUTH_ROUTES } from '../routes/authRoutes';
import { addressService, stockService, orderService } from '@tellervo/supabase';
import { DummyPaymentModal } from '../components/checkout/DummyPaymentModal';
import { SavedAddress, AddressFormData } from '../types/address';
import { AddressFormModal } from '../components/profile/addresses/AddressFormModal';

const getAddressStorageKey = (userId?: string) => `tellervo_addresses_${userId || 'guest'}`;

const loadCachedAddresses = (userId?: string): SavedAddress[] => {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(getAddressStorageKey(userId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
};

const saveCachedAddresses = (userId: string | undefined, list: SavedAddress[]) => {
  if (!userId) return;
  try {
    localStorage.setItem(getAddressStorageKey(userId), JSON.stringify(list));
  } catch {
    // ignore
  }
};

export const CheckoutScreen: React.FC = () => {
  const {
    cart,
    cartTotal,
    cartCount,
    user,
    authUser,
    updateUserProfile,
    clearCart,
    showToast,
    triggerConfetti,
    addOrder,
    toggleRestockNotification,
    isRestockNotified
  } = useApp();

  const currentUserId = authUser?.id || user.handle || 'patron';

  // Addresses State for Phase 6 Address Gate
  const [addresses, setAddresses] = useState<SavedAddress[]>(() =>
    loadCachedAddresses(currentUserId)
  );

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(() => {
    const cached = loadCachedAddresses(currentUserId);
    const def = cached.find((a) => a.isDefault);
    return def ? def.id : cached[0]?.id || null;
  });

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAddressListExpanded, setIsAddressListExpanded] = useState(false);

  // Sync remote addresses on mount and user change
  useEffect(() => {
    let isMounted = true;
    const activeUserId = authUser?.id || user.handle || 'patron';

    async function fetchRemoteAddresses() {
      if (!authUser?.id) return;
      const { data, error } = await addressService.fetchAddresses(authUser.id);
      if (isMounted && !error && data && data.length > 0) {
        const mapped: SavedAddress[] = data.map((rec) => ({
          id: rec.id,
          recipientName: rec.recipient_name,
          phone: rec.phone || undefined,
          type: rec.type,
          title:
            rec.title ||
            (rec.type === 'home' ? 'Home' : rec.type === 'work' ? 'Work' : 'Delivery Destination'),
          street: rec.street,
          additionalDetails: rec.additional_details || undefined,
          postalCode: rec.postal_code,
          city: rec.city,
          countryCode: rec.country_code,
          isDefault: rec.is_default,
        }));
        setAddresses(mapped);
        saveCachedAddresses(activeUserId, mapped);
        setSelectedAddressId((prev) => {
          if (prev && mapped.some((a) => a.id === prev)) return prev;
          const def = mapped.find((a) => a.isDefault);
          return def ? def.id : mapped[0].id;
        });
      }
    }

    fetchRemoteAddresses();

    return () => {
      isMounted = false;
    };
  }, [authUser?.id, user.handle]);

  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) || addresses[0] || null;
  const hasValidAddress = Boolean(selectedAddress);

  const [selectedPaymentType, setSelectedPaymentType] = useState<'apple-pay' | 'card' | 'bank'>('apple-pay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [isDummyPaymentModalOpen, setIsDummyPaymentModalOpen] = useState(false);
  const [confirmedOrderDetails, setConfirmedOrderDetails] = useState<{
    orderNumber: string;
    paymentId: string;
    totalAmount: number;
    status: string;
    destinationAddress: string;
  } | null>(null);
  const [processingStatusText, setProcessingStatusText] = useState('Verifying with Boreal Lab...');
  const [stockHaltError, setStockHaltError] = useState<{
    productId: string;
    productName: string;
    availableStock: number;
    requestedQuantity: number;
    message: string;
  } | null>(null);

  const freeShippingThreshold = 35.0;
  const isFreeShipping = cartTotal >= freeShippingThreshold;
  const shippingFee = isFreeShipping ? 0 : 3.5;
  const finalTotal = cartTotal + shippingFee;

  const handleSaveAddress = async (formData: AddressFormData) => {
    const isFirstAddress = addresses.length === 0;
    const willBeDefault = isFirstAddress || Boolean(formData.isDefault);

    const tempId = `addr-${Date.now()}`;
    const newAddress: SavedAddress = {
      id: tempId,
      recipientName: formData.recipientName,
      type: formData.type,
      title:
        formData.title ||
        (formData.type === 'home'
          ? 'Home'
          : formData.type === 'work'
          ? 'Workplace'
          : 'Posti Locker'),
      street: formData.street,
      additionalDetails: formData.additionalDetails,
      postalCode: formData.postalCode,
      city: formData.city,
      countryCode: formData.countryCode,
      phone: formData.phone,
      isDefault: willBeDefault,
    };

    let updated = [...addresses];
    if (willBeDefault) {
      updated = updated.map((a) => ({ ...a, isDefault: false }));
    }
    updated.push(newAddress);

    setAddresses(updated);
    setSelectedAddressId(tempId);
    saveCachedAddresses(currentUserId, updated);

    if (willBeDefault) {
      const fullAddressStr = `${newAddress.street}, ${newAddress.postalCode} ${newAddress.city} (Default)`;
      updateUserProfile({ address: fullAddressStr });
    }

    showToast(`Added ${newAddress.title} as delivery destination`, 'success');

    if (authUser?.id) {
      const { data: created, error } = await addressService.createAddress(
        {
          recipient_name: formData.recipientName,
          phone: formData.phone,
          type: formData.type,
          title: formData.title,
          street: formData.street,
          additional_details: formData.additionalDetails,
          postal_code: formData.postalCode,
          city: formData.city,
          country_code: formData.countryCode,
          is_default: willBeDefault,
        },
        authUser.id
      );

      if (created && !error) {
        setAddresses((prev) => {
          const synced = prev.map((a) => (a.id === tempId ? { ...a, id: created.id } : a));
          saveCachedAddresses(currentUserId, synced);
          return synced;
        });
        setSelectedAddressId(created.id);
      }
    }
  };

  /**
   * Order Purchase Flow:
   * 1. User clicks Pay / Buy Now
   * 2. Backend checks user account status and real-time database stock
   * 3. Reserve stock atomically ("Ek bottle sirf ek order ko mil sakti hai")
   * 4. Stock available -> Proceed to payment & order confirmation
   *    Stock unavailable -> Halt payment and show "Notify Me"
   */
  const handleProceedPayment = async () => {
    if (authUser?.status === 'deactive') {
      showToast('Your account has been deactivated. Please contact Help & Support for assistance.', 'info');
      navigateTo(AUTH_ROUTES.LOGIN);
      return;
    }
    if (cart.length === 0) {
      showToast('Your cart is empty. Please add botanical blends first.', 'info');
      return;
    }

    // Address Gate Validation
    if (!hasValidAddress) {
      showToast('Please add a delivery destination before placing your order.', 'info');
      setIsAddressModalOpen(true);
      return;
    }

    setStockHaltError(null);
    setIsProcessing(true);
    setProcessingStatusText('Checking real-time database stock...');

    try {
      // Step 2: Backend checks available stock from real-time database
      const cartItemsPayload = cart.map(c => ({
        productId: c.product.id,
        quantity: c.quantity,
        name: c.product.name,
      }));

      const stockCheck = await stockService.checkCartStock(cartItemsPayload);

      if (!stockCheck.allAvailable) {
        // Step 4 Branch B: Stock unavailable -> Payment roko; Notify Me dikhao.
        setIsProcessing(false);
        const failed = stockCheck.unavailableItems[0];
        setStockHaltError({
          productId: failed.productId,
          productName: failed.name,
          availableStock: failed.availableStock,
          requestedQuantity: failed.requestedQuantity,
          message: failed.message,
        });
        showToast(`Stock unavailable for ${failed.name}. Payment halted.`, 'info');
        return;
      }

      // Step 3: Reserve stock atomically ("Ek bottle sirf ek order ko mil sakti hai")
      setProcessingStatusText('Atomically reserving stock in cellar...');
      const reservation = await stockService.reserveCartStock(cartItemsPayload);

      if (!reservation.success) {
        // Step 4 Branch B: Stock unavailable -> Payment roko; Notify Me dikhao.
        setIsProcessing(false);
        const failed = reservation.failedItem || {
          productId: cart[0]?.product.id || '',
          productName: cart[0]?.product.name || 'Provision',
          availableStock: 0,
          requestedQuantity: 1,
          message: 'Insufficient stock available to complete this order.',
        };
        setStockHaltError(failed);
        showToast(`Payment halted! ${failed.message}`, 'info');
        return;
      }

      // Step 4 Branch A: Stock verified -> Open interactive Dummy Payment Simulator
      setIsProcessing(false);
      setIsDummyPaymentModalOpen(true);
    } catch (err) {
      console.error('[CheckoutScreen] Order flow exception:', err);
      setIsProcessing(false);
      setIsDummyPaymentModalOpen(true);
    }
  };

  const handleAcceptPayment = async (paymentId: string) => {
    setIsProcessing(true);
    setProcessingStatusText('Atomically confirming order with Supabase...');

    try {
      const destinationSnapshot = selectedAddress
        ? {
            recipient_name: selectedAddress.recipientName,
            phone: selectedAddress.phone || user.phone || null,
            street: selectedAddress.street,
            additional_details: selectedAddress.additionalDetails || null,
            postal_code: selectedAddress.postalCode,
            city: selectedAddress.city,
            country_code: selectedAddress.countryCode || 'FI',
            type: selectedAddress.type || 'home',
          }
        : {
            recipient_name: user.name || 'Tellervo Patron',
            phone: user.phone || null,
            street: user.address || 'Mannerheimintie 14 B',
            additional_details: null,
            postal_code: '00100',
            city: 'Helsinki',
            country_code: 'FI',
            type: 'home',
          };

      const destinationAddress = selectedAddress
        ? `${selectedAddress.street}, ${selectedAddress.city} ${selectedAddress.postalCode || ''}, ${selectedAddress.countryCode || 'FI'}`
        : user.address || 'Helsinki, Finland';

      const orderPayload = {
        customer_name: user.name || 'Tellervo Patron',
        customer_email: authUser?.email || '',
        customer_phone: selectedAddress?.phone || user.phone || null,
        delivery_address: destinationSnapshot,
        subtotal: cartTotal,
        discount_total: 0,
        shipping_total: shippingFee,
      };

      const itemsPayload = cart.map(c => ({
        product_id: c.product.id,
        product_name: c.product.name,
        volume: c.product.size || '',
        sku: c.product.sku || '',
        unit_price: c.product.discountPrice ?? c.product.price,
        quantity: c.quantity,
        product_image_url: c.product.imageUrl || (c.product.images ? c.product.images[0] : ''),
      }));

      const { data, error } = await orderService.submitOrderWithSimulation(
        orderPayload,
        itemsPayload,
        'accept',
        paymentId
      );

      if (error || !data) {
        showToast(error?.message || 'Failed to submit order to Supabase.', 'info');
        return;
      }

      // Verify payment status is confirmed 'paid'
      if (data.payment_status !== 'paid') {
        showToast('Payment verification failed. Please try again.', 'info');
        return;
      }

      const newOrder = {
        id: data.order_id,
        orderNumber: data.order_number,
        date: new Date(data.created_at || Date.now()).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        total: data.grand_total,
        status: 'Processing',
        statusType: 'in-transit' as const,
        courier: 'Posti Eco Subarctic Chilled',
        summary: `${cart.length} provision${cart.length > 1 ? 's' : ''}: ${cart.map(c => `${c.product.name} (${c.quantity})`).join(', ')}`,
        trackingId: data.payment_id,
        recipientName: user.name || 'Tellervo Patron',
        address: destinationAddress,
        paymentMethod: 'Dummy Simulator (Accepted)',
        items: cart.map(c => ({
          name: c.product.name,
          qty: c.quantity,
          price: c.product.discountPrice ?? c.product.price,
        })),
      };

      addOrder(newOrder);
      setConfirmedOrderDetails({
        orderNumber: data.order_number,
        paymentId: data.payment_id,
        totalAmount: data.grand_total,
        status: 'Processing',
        destinationAddress: destinationAddress,
      });

      setIsDummyPaymentModalOpen(false);
      setIsOrderPlaced(true);
      triggerConfetti();
      showToast('Order confirmed! Supabase record created in Processing status.', 'success');
      clearCart();
    } catch (err) {
      console.error('[CheckoutScreen] Order accept error:', err);
      showToast('Order submission error. Please try again.', 'info');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeclinePayment = async (paymentId: string) => {
    setIsProcessing(true);
    setProcessingStatusText('Recording declined payment in Supabase...');

    try {
      const destinationSnapshot = selectedAddress
        ? {
            recipient_name: selectedAddress.recipientName,
            phone: selectedAddress.phone || user.phone || null,
            street: selectedAddress.street,
            additional_details: selectedAddress.additionalDetails || null,
            postal_code: selectedAddress.postalCode,
            city: selectedAddress.city,
            country_code: selectedAddress.countryCode || 'FI',
            type: selectedAddress.type || 'home',
          }
        : {
            recipient_name: user.name || 'Tellervo Patron',
            phone: user.phone || null,
            street: user.address || 'Mannerheimintie 14 B',
            additional_details: null,
            postal_code: '00100',
            city: 'Helsinki',
            country_code: 'FI',
            type: 'home',
          };

      const destinationAddress = selectedAddress
        ? `${selectedAddress.street}, ${selectedAddress.city} ${selectedAddress.postalCode || ''}, ${selectedAddress.countryCode || 'FI'}`
        : user.address || 'Helsinki, Finland';

      const orderPayload = {
        customer_name: user.name || 'Tellervo Patron',
        customer_email: authUser?.email || '',
        customer_phone: selectedAddress?.phone || user.phone || null,
        delivery_address: destinationSnapshot,
        subtotal: cartTotal,
        discount_total: 0,
        shipping_total: shippingFee,
      };

      const itemsPayload = cart.map(c => ({
        product_id: c.product.id,
        product_name: c.product.name,
        volume: c.product.size || '',
        sku: c.product.sku || '',
        unit_price: c.product.discountPrice ?? c.product.price,
        quantity: c.quantity,
        product_image_url: c.product.imageUrl || (c.product.images ? c.product.images[0] : ''),
      }));

      const { data, error } = await orderService.submitOrderWithSimulation(
        orderPayload,
        itemsPayload,
        'decline',
        paymentId
      );

      if (error || !data) {
        showToast(error?.message || 'Failed to record declined payment.', 'info');
        return;
      }

      const cancelledOrder = {
        id: data.order_id,
        orderNumber: data.order_number,
        date: new Date(data.created_at || Date.now()).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        total: data.grand_total,
        status: 'Cancelled',
        statusType: 'in-transit' as const,
        courier: 'Posti Eco Subarctic Chilled',
        summary: `${cart.length} provision${cart.length > 1 ? 's' : ''}: ${cart.map(c => `${c.product.name} (${c.quantity})`).join(', ')}`,
        trackingId: data.payment_id,
        recipientName: user.name || 'Tellervo Patron',
        address: destinationAddress,
        paymentMethod: 'Dummy Simulator (Declined)',
        items: cart.map(c => ({
          name: c.product.name,
          qty: c.quantity,
          price: c.product.discountPrice ?? c.product.price,
        })),
      };

      addOrder(cancelledOrder);
      setIsDummyPaymentModalOpen(false);
      showToast(`Payment was declined (${paymentId}). Order ${data.order_number} saved as Cancelled in your history.`, 'info');
    } catch (err) {
      console.error('[CheckoutScreen] Order decline error:', err);
      showToast('Payment decline processing error.', 'info');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isOrderPlaced) {
    return (
      <div className="pb-28 px-4 pt-8 max-w-md mx-auto text-center animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-[#183324] text-[#E5A953] flex items-center justify-center mx-auto mb-4 shadow-md">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h2 className="font-editorial text-2xl font-medium text-[#14261B] mb-2">
          Order Confirmed!
        </h2>
        <p className="text-xs text-[#5C6E61] mb-6 max-w-xs mx-auto leading-relaxed">
          Kiitos! Your cold box has been queued for dispatch with Posti Eco. Tracking details have been sent to your registered device.
        </p>

        <div className="w-full bg-white rounded-3xl p-5 border border-[#E8E2D5] shadow-soft-sm mb-6 text-left space-y-2.5">
          <div className="flex justify-between text-xs text-[#6C7E71]">
            <span>Order Reference</span>
            <span className="font-mono font-bold text-[#1A2E21]">
              {confirmedOrderDetails?.orderNumber || '#TL-84102'}
            </span>
          </div>
          <div className="flex justify-between text-xs text-[#6C7E71]">
            <span>Payment Reference</span>
            <span className="font-mono text-[11px] font-medium text-[#1A2E21]">
              {confirmedOrderDetails?.paymentId || 'PAY-FI-SIMULATED'}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs text-[#6C7E71]">
            <span>Order Status</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF7EC] text-[#9A6218] border border-[#F5E4C4]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Processing (Store Preparing Order)
            </span>
          </div>
          <div className="flex justify-between text-xs text-[#6C7E71]">
            <span>Delivery Destination</span>
            <span className="font-medium text-[#1A2E21] text-right truncate max-w-[200px]">
              {confirmedOrderDetails?.destinationAddress ||
                (selectedAddress ? `${selectedAddress.street}, ${selectedAddress.city}` : user.address || 'Helsinki, Finland')}
            </span>
          </div>
          <div className="pt-2 border-t border-[#F0EBE0] flex justify-between text-sm font-bold text-[#14261B]">
            <span>Total Paid</span>
            <span>€{(confirmedOrderDetails?.totalAmount ?? finalTotal).toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setIsOrderPlaced(false);
              navigateTo('/profile');
            }}
            className="flex-1 py-3.5 bg-[#183324] text-[#FAF8F3] font-semibold text-xs uppercase tracking-wider rounded-2xl hover:bg-[#234431] transition-colors shadow-sm cursor-pointer"
          >
            View in Order History
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOrderPlaced(false);
              navigateTo(AUTH_ROUTES.HOME);
            }}
            className="px-4 py-3.5 bg-white border border-[#E0D9C8] text-[#1B3222] font-semibold text-xs uppercase tracking-wider rounded-2xl hover:bg-[#FAF9F5] transition-colors shadow-xs cursor-pointer"
          >
            Return to Store
          </button>
        </div></div>
    );
  }

  return (
    <div className="pb-28 px-4 pt-3 max-w-md mx-auto space-y-4 animate-in fade-in duration-200">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => navigateTo(AUTH_ROUTES.HOME)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3E5645] hover:text-[#183324] px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-sm border border-[#E4DECFA0] hover:bg-white shadow-soft-sm transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Shopping</span>
        </button>

        <span className="text-[10px] font-bold tracking-widest text-[#937548] uppercase">
          SECURE CHECKOUT
        </span>
      </div>

      {/* Header */}
      <div>
        <h1 className="font-editorial text-2xl sm:text-[28px] font-medium text-[#14261B]">
          Boreal Checkout
        </h1>
        <p className="text-xs text-[#5D6F61] mt-0.5">
          Review your botanical selection and confirm chilled delivery.
        </p>
      </div>

      {/* Cart Summary Card */}
      <div className="bg-white rounded-3xl p-4 border border-[#E8E2D5] shadow-soft-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#F0EBE0]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#183324]" />
            <span className="text-xs font-bold text-[#14261B]">Your Forest Box</span>
          </div>
          <span className="text-xs text-[#78887C]">{cartCount} items</span>
        </div>

        {cart.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#78887C]">
            Your cart is currently empty.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item.product.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-9 h-9 rounded-lg object-cover border border-[#EAE4D8]"
                  />
                  <div className="truncate">
                    <p className="font-semibold text-[#183324] truncate">{item.product.name}</p>
                    <p className="text-[10px] text-[#78887C]">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-bold text-[#14261B] shrink-0">
                  €{(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 border-t border-[#F0EBE0] space-y-1.5 text-xs text-[#637568]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-[#183022]">€{cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Chilled Eco Courier</span>
            <span className="font-semibold text-[#183022]">
              {isFreeShipping ? 'Free' : `€${shippingFee.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between text-sm font-bold text-[#14261B] pt-1 border-t border-[#EAE4D8]">
            <span>Total Due</span>
            <span>€{finalTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Delivery Destination Section (Phase 6: Address-Gated Checkout) */}
      <div className="bg-white rounded-3xl p-4 border border-[#E8E2D5] shadow-soft-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#F0EBE0]">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#183324]" />
            <span className="text-xs font-bold text-[#14261B]">Delivery Destination</span>
          </div>
          {hasValidAddress ? (
            <span className="px-2 py-0.5 rounded-full bg-[#EBF3EE] text-[#1F492E] text-[10px] font-bold uppercase tracking-wider border border-[#D1E3D7] flex items-center gap-1">
              <Check className="w-2.5 h-2.5 stroke-[3]" /> Verified
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold uppercase tracking-wider border border-amber-200 flex items-center gap-1">
              <AlertCircle className="w-2.5 h-2.5" /> Address Required
            </span>
          )}
        </div>

        {!hasValidAddress ? (
          /* Zero Addresses State: Prominent Address Entry Prompt */
          <div className="p-4 rounded-2xl bg-[#F9F7F2] border border-dashed border-[#DCD5C5] text-center space-y-2.5">
            <div className="w-9 h-9 rounded-full bg-[#EFECE2] text-[#405445] flex items-center justify-center mx-auto">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#14261B]">No delivery address found</p>
              <p className="text-[11px] text-[#637568] mt-0.5">
                Add your delivery destination to verify Posti Eco courier routing.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddressModalOpen(true)}
              className="px-4 py-2 bg-[#183324] hover:bg-[#254632] text-[#FAF8F3] text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 shadow-soft-sm transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#E5A953]" />
              <span>Add Delivery Address</span>
            </button>
          </div>
        ) : (
          /* Address Card & Selector */
          <div className="space-y-2.5">
            <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E8E2D5] flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#F2EDE2] flex items-center justify-center shrink-0 mt-0.5 text-[#183324]">
                  {selectedAddress.type === 'home' && <Home className="w-4 h-4" />}
                  {selectedAddress.type === 'work' && <Building2 className="w-4 h-4" />}
                  {selectedAddress.type === 'locker' && <Package className="w-4 h-4" />}
                  {selectedAddress.type === 'other' && <MapPin className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#14261B]">
                      {selectedAddress.title ||
                        (selectedAddress.type === 'home'
                          ? 'Home'
                          : selectedAddress.type === 'work'
                          ? 'Workplace'
                          : 'Posti Locker')}
                    </span>
                    {selectedAddress.isDefault && (
                      <span className="px-1.5 py-0.5 rounded bg-[#EAF3ED] text-[#246138] text-[9px] font-bold uppercase tracking-wider">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#203628] font-medium mt-0.5">
                    {selectedAddress.recipientName}
                    {selectedAddress.phone && (
                      <span className="text-[#6D8072] font-normal ml-1.5">
                        • {selectedAddress.phone}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-[#5D6F61] mt-0.5">
                    {selectedAddress.street}
                    {selectedAddress.additionalDetails && `, ${selectedAddress.additionalDetails}`}
                  </p>
                  <p className="text-[11px] text-[#78887C]">
                    {selectedAddress.postalCode} {selectedAddress.city}, {selectedAddress.countryCode}
                  </p>
                </div>
              </div>

              {/* Change / Switch Button */}
              {addresses.length > 1 && (
                <button
                  type="button"
                  onClick={() => setIsAddressListExpanded((prev) => !prev)}
                  className="text-xs font-semibold text-[#30523C] hover:text-[#183324] underline underline-offset-2 shrink-0 cursor-pointer pt-0.5"
                >
                  {isAddressListExpanded ? 'Done' : 'Change'}
                </button>
              )}
            </div>

            {/* Expanded Address Switcher if multiple addresses exist */}
            {isAddressListExpanded && addresses.length > 1 && (
              <div className="p-2 rounded-2xl bg-white border border-[#E5DFD2] space-y-1.5 animate-in fade-in duration-150">
                <span className="text-[10px] font-bold text-[#7A8E80] uppercase tracking-wider px-2 block pt-1">
                  Select Delivery Destination:
                </span>
                {addresses.map((addr) => {
                  const isSelected = addr.id === selectedAddress.id;
                  return (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => {
                        setSelectedAddressId(addr.id);
                        setIsAddressListExpanded(false);
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#183324] bg-[#F7FAF8] font-semibold text-[#183324]'
                          : 'border-transparent hover:bg-[#FAF9F5] text-[#4A5D4F]'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <span className="font-bold text-[#14261B] block">
                          {addr.title || addr.street}
                        </span>
                        <span className="text-[11px] text-[#6E7F72] truncate block">
                          {addr.street}, {addr.postalCode} {addr.city}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-[#183324] text-white flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Quick Add Address button for authenticated patron */}
            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(true)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3B5442] hover:text-[#183324] transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add another address</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Method Selector Section */}
      <div className="bg-white rounded-3xl p-4 border border-[#E8E2D5] shadow-soft-sm space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-[#F0EBE0]">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#183324]" />
            <span className="text-xs font-bold text-[#14261B]">Payment Method</span>
          </div>
          <span className="text-[10px] text-[#A67C37] font-bold uppercase tracking-wider bg-[#FAF0DE] px-2 py-0.5 rounded-full border border-[#F3DFC1]">
            Ready for Integration
          </span>
        </div>

        {/* Payment Options Grid */}
        <div className="space-y-2">
          {/* Apple Pay */}
          <button
            type="button"
            onClick={() => setSelectedPaymentType('apple-pay')}
            className={`w-full p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              selectedPaymentType === 'apple-pay'
                ? 'border-[#183324] bg-[#F7FAF8] shadow-xs'
                : 'border-[#EAE5D9] hover:bg-[#FAF9F5]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#183324] text-white flex items-center justify-center">
                <Smartphone className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#183324] block">Apple Pay</span>
                <span className="text-[10px] text-[#78887C]">One-touch biometric payment</span>
              </div>
            </div>
            {selectedPaymentType === 'apple-pay' && (
              <div className="w-4 h-4 rounded-full bg-[#183324] text-white flex items-center justify-center">
                <Check className="w-2.5 h-2.5" />
              </div>
            )}
          </button>

          {/* Visa / Mastercard */}
          <button
            type="button"
            onClick={() => setSelectedPaymentType('card')}
            className={`w-full p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              selectedPaymentType === 'card'
                ? 'border-[#183324] bg-[#F7FAF8] shadow-xs'
                : 'border-[#EAE5D9] hover:bg-[#FAF9F5]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#2D4E39] text-white flex items-center justify-center">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#183324] block">Credit / Debit Card</span>
                <span className="text-[10px] text-[#78887C]">Visa, Mastercard (Stripe Ready)</span>
              </div>
            </div>
            {selectedPaymentType === 'card' && (
              <div className="w-4 h-4 rounded-full bg-[#183324] text-white flex items-center justify-center">
                <Check className="w-2.5 h-2.5" />
              </div>
            )}
          </button>

          {/* Verkkopankki / Paytrail */}
          <button
            type="button"
            onClick={() => setSelectedPaymentType('bank')}
            className={`w-full p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              selectedPaymentType === 'bank'
                ? 'border-[#183324] bg-[#F7FAF8] shadow-xs'
                : 'border-[#EAE5D9] hover:bg-[#FAF9F5]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#3D5244] text-white flex items-center justify-center">
                <Building className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#183324] block">
                  Finnish Online Banking (Verkkopankki)
                </span>
                <span className="text-[10px] text-[#78887C]">OP, Nordea, Danske (Paytrail Ready)</span>
              </div>
            </div>
            {selectedPaymentType === 'bank' && (
              <div className="w-4 h-4 rounded-full bg-[#183324] text-white flex items-center justify-center">
                <Check className="w-2.5 h-2.5" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Payment Halted Stock Alert Banner ("Payment roko; Notify Me dikhao") */}
      {stockHaltError && (
        <div className="bg-[#FFF5F5] border-2 border-[#E8B4B4] rounded-3xl p-4 shadow-sm animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-[#8B2525] font-bold text-sm mb-1.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-[#C53D43]" />
            <span>Payment Halted — Stock Unavailable</span>
          </div>
          <p className="text-xs text-[#6A3232] leading-relaxed mb-3">
            {stockHaltError.message} To ensure fair cellar allocation, payment has been stopped.
          </p>
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#F3D5D5]">
            <span className="text-[11px] text-[#7A4B4B] font-medium truncate">
              Notify when {stockHaltError.productName} is back:
            </span>
            <button
              type="button"
              onClick={() => toggleRestockNotification(stockHaltError.productId, stockHaltError.productName)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                isRestockNotified(stockHaltError.productId)
                  ? 'bg-[#EBF4EE] text-[#1B462C] border border-[#C5DEC9]'
                  : 'bg-[#8B2525] text-white hover:bg-[#721E1E]'
              }`}
            >
              <Bell className={`w-3.5 h-3.5 ${isRestockNotified(stockHaltError.productId) ? 'fill-[#245D36]' : ''}`} />
              <span>{isRestockNotified(stockHaltError.productId) ? 'Notification Active' : 'Notify Me'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Payment Action Button (Address Gated) */}
      <div className="space-y-1.5">
        <button
          type="button"
          disabled={cart.length === 0 || !hasValidAddress || isProcessing}
          onClick={handleProceedPayment}
          className="w-full py-4 bg-[#183324] text-[#FAF8F3] rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#224430] active:scale-[0.98] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{processingStatusText}</span>
            </span>
          ) : (
            <>
              <CreditCard className="w-4 h-4 text-[#E5A953]" />
              <span>Pay €{finalTotal.toFixed(2)} • Complete Order</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {!hasValidAddress && cart.length > 0 && (
          <p className="text-[11px] text-amber-800 text-center flex items-center justify-center gap-1 pt-0.5">
            <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
            <span>Please add a delivery address to complete your order.</span>
          </p>
        )}
      </div>

      {/* Trust & Guarantee */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#7C8E80] pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-[#3E6F4E]" />
        <span>100% Wild Nordic Foraging • Zero Carbon Delivery</span>
      </div>

      {/* Address Form Modal mounted for in-checkout addition */}
      <AddressFormModal
        isOpen={isAddressModalOpen}
        mode="add"
        isFirstAddress={addresses.length === 0}
        onSave={handleSaveAddress}
        onClose={() => setIsAddressModalOpen(false)}
      />

      {/* Dummy Payment Simulation Modal for QA */}
      {isDummyPaymentModalOpen && (
        <DummyPaymentModal
          isOpen={isDummyPaymentModalOpen}
          onClose={() => setIsDummyPaymentModalOpen(false)}
          amount={finalTotal}
          currency="EUR"
          onAccept={handleAcceptPayment}
          onDecline={handleDeclinePayment}
          isProcessing={isProcessing}
          processingMessage={processingStatusText}
        />
      )}
    </div>
  );
};
