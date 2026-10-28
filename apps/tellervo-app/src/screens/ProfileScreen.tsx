import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  Trees,
  Bell,
  ShieldCheck,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  RotateCcw,
  Package,
  Truck,
  MapPin,
  X,
  Globe,
  User,
  Gift
} from 'lucide-react';
import { navigateTo, AUTH_ROUTES } from '../routes/authRoutes';
import { QuickAccessGrid } from '../components/profile/QuickAccessGrid';
import { PersonalInformationModal } from '../components/profile/PersonalInformationModal';
import { AddressesModal } from '../components/profile/AddressesModal';
import { PaymentMethodsModal } from '../components/profile/PaymentMethodsModal';
import { SecurityModal } from '../components/profile/SecurityModal';
import { SupportDrawer } from '../components/profile/SupportDrawer';
import { LegalPrivacyModal } from '../components/profile/LegalPrivacyModal';

export const ProfileScreen: React.FC = () => {
  const {
    user,
    orders,
    setSelectedOrderForTracking,
    addToCart,
    products,
    showToast,
    language,
    setIsLanguageModalOpen,
    setIsMembershipCardOpen,
    t,
    logout,
  } = useApp();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      showToast('Logged out of Tellervo session', 'info');
      setIsLogoutDialogOpen(false);
      navigateTo(AUTH_ROUTES.LOGIN);
    } catch {
      showToast('Failed to log out. Please try again.', 'info');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const [notifications, setNotifications] = useState(user.notifications);
  const [activeSubscriptionStatus, setActiveSubscriptionStatus] = useState<'active' | 'skipped' | 'paused'>('active');
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isEditFlavorsOpen, setIsEditFlavorsOpen] = useState(false);
  const [isImpactOpen, setIsImpactOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  // Modular Modals State
  const [isPersonalInfoOpen, setIsPersonalInfoOpen] = useState(false);
  const [isAddressesOpen, setIsAddressesOpen] = useState(false);
  const [isPaymentsOpen, setIsPaymentsOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => {
      const next = { ...prev, [key]: !prev[key] };
      showToast('Notification preference updated');
      return next;
    });
  };

  const handleReorderEverything = () => {
    if (products[3]) addToCart(products[3]);
    if (products[7]) addToCart(products[7]);
    if (!products[3] && !products[7] && products[0]) addToCart(products[0]);
    showToast('Reordered all 8 items from Order #TL-84102');
  };

  const handleScrollToOrders = () => {
    const el = document.getElementById('recent-orders-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Extract authenticated user first name dynamically
  const firstName = user.name ? user.name.split(' ')[0] : 'Patron';

  return (
    <div className="pb-28 px-4 pt-3 w-full space-y-5 animate-in fade-in duration-200">
      {/* Dynamic Account Overview Greeting Banner */}
      <div className="space-y-0.5 pt-1">
        <span className="text-[10px] font-bold tracking-widest text-[#937548] uppercase block">
          ACCOUNT OVERVIEW
        </span>
        <h1 className="font-editorial text-2xl sm:text-[28px] font-medium text-[#14261B] flex items-center gap-2">
          <span>Hello, {firstName}</span>
          <span className="text-xl">👋</span>
        </h1>
        <p className="text-xs text-[#5D6F61]">
          Manage your account and your Tellervo experience.
        </p>
      </div>

      {/* User Header Profile Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#E8E2D5] shadow-soft-sm space-y-4">
        <div className="flex items-center gap-3.5">
          {/* Avatar with badge */}
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#183324] shadow">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#E5A953] rounded-full border-2 border-white flex items-center justify-center">
              <Trees className="w-2.5 h-2.5 text-[#183324]" />
            </div>
          </div>

          {/* User Details */}
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-editorial text-xl font-semibold text-[#14261B]">
                {user.name}
              </h2>
              <CheckCircle2 className="w-4 h-4 text-[#26683B] fill-[#EAF4ED]" />
            </div>
            <p className="text-[11px] text-[#78887C]">Member since {user.memberSince}</p>

            {/* Patron badge pill */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBF3EE] border border-[#D1E3D7] text-[10px] font-bold text-[#1F492E] mt-1">
              <Trees className="w-3 h-3 text-[#2D6640]" />
              <span>{user.tier} • {user.seeds} Seeds</span>
            </div>
          </div>
        </div>

        {/* Wild Restoration Card */}
        <div className="bg-[#EBF3ED] rounded-2xl p-3 border border-[#CFDFD4] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#183324] text-[#E5A953] flex items-center justify-center">
              <Trees className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-bold tracking-wider text-[#2D5A3C] uppercase block">
                WILD RESTORATION
              </span>
              <span className="text-xs font-bold text-[#162D1F]">
                {user.treesPlanted} trees planted this year
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsImpactOpen(true)}
            className="text-xs font-semibold text-[#1F492E] hover:underline px-2 py-1"
          >
            Inspect
          </button>
        </div>
      </div>

      {/* Shopping Activities 2x2 Quick-Access Card Grid */}
      <QuickAccessGrid
        onSelectOrders={handleScrollToOrders}
        onOpenAddresses={() => setIsAddressesOpen(true)}
        onOpenPayments={() => setIsPaymentsOpen(true)}
      />

      {/* Active Subscription Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-editorial text-xl font-medium text-[#14261B]">
            Active Subscription
          </h3>
          <span className="px-2.5 py-0.5 rounded-full bg-[#FAF0DE] text-[#A66723] text-[10px] font-bold tracking-wider uppercase border border-[#F3DFC1]">
            AUTOMATED DROP
          </span>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-[#E8E2D5] shadow-soft-sm space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-[#246138] uppercase flex items-center gap-1.5 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#246138]" />
                {activeSubscriptionStatus === 'active' && 'ACTIVE • 4-WEEK DISPATCH'}
                {activeSubscriptionStatus === 'skipped' && 'SKIPPED FOR NOVEMBER'}
                {activeSubscriptionStatus === 'paused' && 'PAUSED UNTIL SPRING'}
              </span>
              <h4 className="font-editorial text-lg font-semibold text-[#183122]">
                {user.subscription.title}
              </h4>
              <p className="text-[11px] text-[#718274]">
                Next harvest dispatch: {user.subscription.nextDispatchDate}
              </p>
            </div>
            <div className="text-right">
              <span className="font-editorial text-xl font-bold text-[#14261B]">
                €{user.subscription.price.toFixed(2)}
              </span>
              <span className="text-[10px] text-[#869689] block uppercase">
                {user.subscription.cycleText}
              </span>
            </div>
          </div>

          {/* Curated items pill */}
          <div className="bg-[#FAF7F0] rounded-xl p-2.5 border border-[#ECE4D5] flex items-center justify-between text-xs text-[#5D6F61]">
            <span className="flex items-center gap-1.5 truncate">
              <Package className="w-3.5 h-3.5 text-[#183324] shrink-0" />
              <span className="truncate">{user.subscription.curatedItems}</span>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#ECE4D5] text-[#293E30] text-[10px] font-bold shrink-0 ml-2">
              {user.subscription.canCount} Cans
            </span>
          </div>

          {/* Buttons row */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsEditFlavorsOpen(true)}
              className="py-2 px-2 bg-[#183324] text-[#FAF8F3] text-xs font-semibold rounded-xl hover:bg-[#254632] transition-colors truncate"
            >
              Edit Flavors
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSubscriptionStatus(prev => prev === 'skipped' ? 'active' : 'skipped');
                showToast(activeSubscriptionStatus === 'skipped' ? 'Resumed November dispatch' : 'Skipped November dispatch');
              }}
              className="py-2 px-2 bg-[#F5F2EB] text-[#293E30] text-xs font-semibold rounded-xl hover:bg-[#ECE7DC] transition-colors truncate"
            >
              {activeSubscriptionStatus === 'skipped' ? 'Resume Nov' : 'Skip Nov'}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSubscriptionStatus(prev => prev === 'paused' ? 'active' : 'paused');
                showToast(activeSubscriptionStatus === 'paused' ? 'Subscription resumed' : 'Subscription paused');
              }}
              className="py-2 px-2 bg-[#F5F2EB] text-[#293E30] text-xs font-semibold rounded-xl hover:bg-[#ECE7DC] transition-colors truncate"
            >
              {activeSubscriptionStatus === 'paused' ? 'Unpause' : 'Pause'}
            </button>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div id="recent-orders-section">
        <div className="flex items-baseline justify-between mb-2">
          <h3 className="font-editorial text-xl font-medium text-[#14261B]">Recent Orders</h3>
          <button
            type="button"
            onClick={() => showToast('Displaying all past orders', 'info')}
            className="text-xs font-semibold text-[#8C7443] hover:underline"
          >
            Full Archive
          </button>
        </div>

        {orders && orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map((order, idx) => (
              <div key={order.id || idx} className="bg-white rounded-3xl p-4 border border-[#E8E2D5] shadow-soft-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#183122]">
                      {order.orderNumber} • {order.date}
                    </span>
                    <p className="text-[11px] text-[#718274] mt-0.5">
                      {order.summary}
                    </p>
                  </div>
                  <span className="font-editorial text-base font-bold text-[#14261B]">
                    €{order.total.toFixed(2)}
                  </span>
                </div>

                <div className="bg-[#EAF3ED] border border-[#CFE2D4] rounded-xl px-3 py-2 flex items-center justify-between text-xs text-[#20492E]">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Truck className="w-3.5 h-3.5" />
                    <span>{order.status || 'Out for delivery with Posti Eco'}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#D4E8DC] text-[#163821] font-bold text-[10px]">
                    Active
                  </span>
                </div>

                <div className="flex gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setSelectedOrderForTracking(order)}
                    className="flex-1 py-2 bg-[#183324] text-[#FAF8F3] text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#254632] transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#E5A953]" />
                    <span>Track Order</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsReceiptOpen(true)}
                    className="px-4 py-2 bg-[#F5F2EB] text-[#293E30] text-xs font-semibold rounded-xl hover:bg-[#ECE7DC] transition-colors"
                  >
                    Receipt
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 border border-[#E8E2D5] shadow-soft-sm text-center space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-[#F5F2EB] flex items-center justify-center text-lg mx-auto">
              📦
            </div>
            <div className="text-xs font-bold text-[#183122]">No orders placed yet</div>
            <p className="text-[11px] text-[#718274] max-w-xs mx-auto">
              Your dispatched botanical deliveries and subscription dispatches will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Account & Settings Section */}
      <div>
        <h3 className="font-editorial text-xl font-medium text-[#14261B] mb-2">
          {t.profile.settingsPreferences || 'Account & Settings'}
        </h3>

        <div className="bg-white rounded-3xl border border-[#E8E2D5] shadow-soft-sm divide-y divide-[#F0ECE1] overflow-hidden">
          {/* 1. Personal Information */}
          <div
            onClick={() => setIsPersonalInfoOpen(true)}
            className="p-4 flex items-center justify-between hover:bg-[#FAF8F3] cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F5F2EB] flex items-center justify-center text-[#183324]">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#183122]">Personal Information</div>
                <div className="text-[11px] text-[#718274]">Name, email and phone</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8C9C90]" />
          </div>

          {/* 2. Language Selector */}
          <div
            onClick={() => setIsLanguageModalOpen(true)}
            className="p-4 flex items-center justify-between hover:bg-[#FAF8F3] cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#E8F3EB] flex items-center justify-center text-[#183324]">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#183122] flex items-center gap-2">
                  <span>{t.profile.languageOption || 'Language'}</span>
                  <span className="text-[10px] font-mono font-bold uppercase bg-[#183324] text-[#E5A953] px-1.5 py-0.5 rounded">
                    {language}
                  </span>
                </div>
                <div className="text-[11px] text-[#718274]">
                  {language === 'fi' ? '🇫🇮 Suomi' : language === 'es' ? '🇪🇸 Español' : '🇬🇧 English'} • Tap to switch
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-[#1F492E]">
                {language === 'fi' ? 'Muuta' : language === 'es' ? 'Cambiar' : 'Change'}
              </span>
              <ChevronRight className="w-4 h-4 text-[#8C9C90]" />
            </div>
          </div>

          {/* 3. Notifications & Preferences */}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F5F2EB] flex items-center justify-center text-[#2A3F31]">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#183122]">Notifications & Preferences</div>
                <div className="text-[11px] text-[#718274]">Order alerts, offers and communication</div>
              </div>
            </div>

            <div className="space-y-2.5 pt-1 pl-12">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#2A3E31]">{t.profile.seasonalDrops}</span>
                <button
                  type="button"
                  onClick={() => toggleNotification('seasonalDrops')}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    notifications.seasonalDrops ? 'bg-[#183324]' : 'bg-[#D6CFC2]'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      notifications.seasonalDrops ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#2A3E31]">{t.profile.restockAlerts}</span>
                <button
                  type="button"
                  onClick={() => toggleNotification('restockAlerts')}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    notifications.restockAlerts ? 'bg-[#183324]' : 'bg-[#D6CFC2]'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      notifications.restockAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#2A3E31]">{t.profile.orderUpdates}</span>
                <button
                  type="button"
                  onClick={() => toggleNotification('orderUpdates')}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    notifications.orderUpdates ? 'bg-[#183324]' : 'bg-[#D6CFC2]'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      notifications.orderUpdates ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* 4. Login & Security */}
          <div
            onClick={() => setIsSecurityOpen(true)}
            className="p-4 flex items-center justify-between hover:bg-[#FAF8F3] cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F5F2EB] flex items-center justify-center text-[#2A3F31]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#183122]">Login & Security</div>
                <div className="text-[11px] text-[#718274]">Password and account security</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8C9C90]" />
          </div>

          {/* 5. Rewards & Membership */}
          <div
            onClick={() => setIsMembershipCardOpen(true)}
            className="p-4 flex items-center justify-between hover:bg-[#FAF8F3] cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#E8F3EB] flex items-center justify-center text-[#183324]">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#183122]">Rewards & Membership</div>
                <div className="text-[11px] text-[#718274]">{user.tier} • {user.seeds} Seeds available</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8C9C90]" />
          </div>

          {/* 6. Help & Support */}
          <div
            onClick={() => setIsSupportOpen(true)}
            className="p-4 flex items-center justify-between hover:bg-[#FAF8F3] cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F5F2EB] flex items-center justify-center text-[#2A3F31]">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#183122]">Help & Support</div>
                <div className="text-[11px] text-[#718274]">FAQs, contact support and order issues</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8C9C90]" />
          </div>

          {/* 7. Legal & Privacy */}
          <div
            onClick={() => setIsLegalOpen(true)}
            className="p-4 flex items-center justify-between hover:bg-[#FAF8F3] cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F5F2EB] flex items-center justify-center text-[#2A3F31]">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#183122]">Legal & Privacy</div>
                <div className="text-[11px] text-[#718274]">Terms, harvest policy and GDPR data</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8C9C90]" />
          </div>
        </div>
      </div>

      {/* Log Out Button */}
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="w-full py-3.5 bg-[#F6F3EB] hover:bg-[#ECE6DA] text-[#9E3E3E] rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-[#E5DFD1]"
      >
        <LogOut className="w-4 h-4" />
        <span>Log Out of Tellervo</span>
      </button>

      {/* Brand Footer */}
      <div className="text-center pt-2 pb-4 text-[10px] font-bold tracking-widest text-[#8A7955] uppercase">
        TELLERVO DRINKS V2.4.1 (BOREAL EDITION) • MADE IN FINLAND
      </div>

      {/* Impact Modal */}
      {isImpactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsImpactOpen(false)} className="fixed inset-0 bg-[#0E1D14]/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-[#FBF9F5] rounded-3xl p-6 shadow-2xl border border-[#E8E2D4] z-10 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-[#183324] text-[#E5A953] flex items-center justify-center mx-auto mb-3">
              <Trees className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-bold tracking-widest text-[#937548] uppercase">
              SUSTAINABILITY CERTIFICATE
            </span>
            <h3 className="font-editorial text-2xl font-medium text-[#14261B] mt-1 mb-2">
              18 Taiga Trees Planted
            </h3>
            <p className="text-xs text-[#5D6F61] leading-relaxed mb-4">
              Through your 2026 subscriptions and bottle returns, 18 native Scots Pines and Silver Birches were re-wilded in the Kainuu Conservation Corridor.
            </p>
            <div className="bg-white rounded-2xl p-3 border border-[#E5DFD2] space-y-2 mb-5 text-left text-xs">
              <div className="flex justify-between">
                <span className="text-[#687C6F]">Carbon Offset Equivalent</span>
                <span className="font-bold text-[#183122]">396 kg CO2e</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#687C6F]">GPS Coordinates</span>
                <span className="font-mono text-[11px] text-[#183122]">64.2285° N, 27.7285° E</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsImpactOpen(false)}
              className="w-full py-3 bg-[#183324] text-[#FAF8F3] text-xs font-semibold rounded-xl"
            >
              Close Certificate
            </button>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {isReceiptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsReceiptOpen(false)} className="fixed inset-0 bg-[#0E1D14]/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-[#FBF9F5] rounded-3xl p-6 shadow-2xl border border-[#E8E2D4] z-10 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-editorial text-xl font-medium text-[#14261B]">
                Receipt #TL-89421
              </h3>
              <button
                type="button"
                onClick={() => setIsReceiptOpen(false)}
                className="w-7 h-7 rounded-full bg-[#EAE5D9] flex items-center justify-center text-[#2A3E30]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-[#E5DFD2] space-y-2 text-xs text-[#5D6F61] mb-4">
              <div className="flex justify-between font-bold text-[#183122] border-b pb-2">
                <span>Cloudberry Essence (2x)</span>
                <span>€18.00</span>
              </div>
              <div className="flex justify-between font-bold text-[#183122] border-b pb-2">
                <span>Birch Mist Sparkling 4-Pack (1x)</span>
                <span>€17.50</span>
              </div>
              <div className="flex justify-between text-[#2D6640]">
                <span>Chilled Delivery</span>
                <span>FREE</span>
              </div>
              <div className="flex justify-between text-[#2D6640]">
                <span>Member VAT Included (24%)</span>
                <span>€7.45</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#14261B] border-t pt-2">
                <span>Total Paid (Apple Pay)</span>
                <span>€38.50</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                showToast('Receipt PDF downloaded');
                setIsReceiptOpen(false);
              }}
              className="w-full py-2.5 bg-[#183324] text-white text-xs font-semibold rounded-xl"
            >
              Download PDF Invoice
            </button>
          </div>
        </div>
      )}

      {/* Edit Flavors Modal */}
      {isEditFlavorsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsEditFlavorsOpen(false)} className="fixed inset-0 bg-[#0E1D14]/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-[#FBF9F5] rounded-3xl p-6 shadow-2xl border border-[#E8E2D4] z-10 animate-in zoom-in-95 duration-200">
            <h3 className="font-editorial text-xl font-medium text-[#14261B] mb-2">
              Customize November Drop
            </h3>
            <p className="text-xs text-[#637568] mb-4">
              Select 4 cans to be cold-packed for your next monthly harvest dispatch.
            </p>
            <div className="space-y-2 mb-4">
              {['Arctic Pine Needle Tonic', 'Smoked Lingonberry Spritz', 'Birch Chaga Immunity Shot', 'Cloudberry Sparkling Cordial'].map(flavor => (
                <div key={flavor} className="p-3 bg-white rounded-xl border border-[#E5DFD2] flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#183122]">{flavor}</span>
                  <span className="px-2 py-0.5 rounded bg-[#EAF3ED] text-[#245C37] font-bold text-[10px]">Included (1x)</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                showToast('November flavor box updated!');
                setIsEditFlavorsOpen(false);
              }}
              className="w-full py-3 bg-[#183324] text-white text-xs font-semibold rounded-xl"
            >
              Save Subscription Flavors
            </button>
          </div>
        </div>
      )}

      {/* Interactive Profile Modals */}
      <PersonalInformationModal
        isOpen={isPersonalInfoOpen}
        onClose={() => setIsPersonalInfoOpen(false)}
      />

      <AddressesModal
        isOpen={isAddressesOpen}
        onClose={() => setIsAddressesOpen(false)}
      />

      <PaymentMethodsModal
        isOpen={isPaymentsOpen}
        onClose={() => setIsPaymentsOpen(false)}
      />

      <SecurityModal
        isOpen={isSecurityOpen}
        onClose={() => setIsSecurityOpen(false)}
      />

      <SupportDrawer
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />

      <LegalPrivacyModal
        isOpen={isLegalOpen}
        onClose={() => setIsLegalOpen(false)}
      />

      {/* Logout confirmation dialog */}
      {isLogoutDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsLogoutDialogOpen(false)} className="fixed inset-0 bg-[#0E1D14]/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-xs bg-white rounded-3xl p-5 shadow-2xl border border-[#E8E2D4] z-10 text-center animate-in zoom-in-95 duration-200">
            <h4 className="font-editorial text-lg font-semibold text-[#14261B] mb-1">Log Out?</h4>
            <p className="text-xs text-[#637568] mb-4">You can log back in anytime with your Apple ID or phone.</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex-1 py-2 bg-[#9E3E3E] text-white text-xs font-semibold rounded-xl"
              >
                Log Out
              </button>
              <button
                type="button"
                onClick={() => setIsLogoutDialogOpen(false)}
                className="flex-1 py-2 bg-[#F3EFE6] text-[#293E30] text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
