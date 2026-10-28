import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, ShoppingBag } from 'lucide-react';
import { navigateTo, AUTH_ROUTES } from '../routes/authRoutes';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    user,
    setIsNotificationsOpen,
    setIsCartOpen,
    setIsLanguageModalOpen,
    language,
    t,
    cartCount,
    isAuthenticated,
  } = useApp();

  const getSubTitle = () => {
    switch (activeTab) {
      case 'home':
        return t.header.home;
      case 'shop':
        return t.header.shop;
      case 'rewards':
        return t.header.rewards;
      case 'favorites':
        return t.header.favorites;
      case 'profile':
        return t.header.profile;
      default:
        return t.header.home;
    }
  };

  const getFlag = () => {
    switch (language) {
      case 'fi':
        return '🇫🇮';
      case 'es':
        return '🇪🇸';
      case 'en':
      default:
        return '🇬🇧';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F5]/95 backdrop-blur-md px-4 py-3 transition-all w-full border-b border-[#EAE5D9]/60">
      <div className="w-full flex items-center justify-between">
        {/* Brand Logo & Section exactly as in screenshot */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          {/* Official Tellervo Logo */}
          <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
            <img
              src="/tellervo-logo.png"
              alt="Tellervo Drinks Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex flex-col">
            <span className="font-editorial text-[22px] leading-tight font-medium tracking-tight text-[#183324]">
              Tellervo
            </span>
            <span className="text-[11px] font-bold tracking-[0.16em] text-[#A67C37] uppercase -mt-0.5">
              {getSubTitle()}
            </span>
          </div>
        </div>

        

        {/* Action Controls: Language Pill, Cart, Bell & Avatar */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Language Selector Pill */}
          <button
            onClick={() => setIsLanguageModalOpen(true)}
            aria-label="Switch language"
            title={`${t.header.switchLanguage} (${language.toUpperCase()})`}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#EAE5D9]/80 hover:bg-[#EAE5D9] text-[#183324] text-xs font-semibold tracking-wider transition-all border border-[#183324]/10 active:scale-95 shadow-xs"
          >
            <span className="text-xs leading-none">{getFlag()}</span>
            <span className="uppercase text-[10px] font-mono font-bold text-[#183324]">{language}</span>
          </button>

          {/* Add to Cart / Forest Box Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="Open Forest Box Cart"
            title="Open Forest Box Cart"
            className="relative w-8 h-8 flex items-center justify-center text-[#1C3324] hover:text-[#2E4F39] active:scale-95 transition-all"
          >
            <ShoppingBag className="w-5 h-5 stroke-[2]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#183324] text-[#E5A953] text-[9px] font-bold flex items-center justify-center leading-none shadow-xs border border-[#FBF9F5]">
                {cartCount}
              </span>
            )}
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            aria-label="View notifications"
            className="relative w-8 h-8 flex items-center justify-center text-[#1C3324] hover:text-[#2E4F39] active:scale-95 transition-all"
          >
            <Bell className="w-5 h-5 stroke-[2]" />
            <span className="absolute top-0.5 right-1 w-2.5 h-2.5 rounded-full bg-[#E5A953] ring-2 ring-[#FBF9F5]" />
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={() => setActiveTab('profile')}
            aria-label="Open profile"
            className="w-8 h-8 rounded-full overflow-hidden shadow-xs hover:opacity-90 active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
