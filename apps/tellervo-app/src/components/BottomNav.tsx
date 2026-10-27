import React from 'react';
import { useApp } from '../context/AppContext';
import { TabType } from '../types';
import { Home, Store, Sparkles, Heart, User } from 'lucide-react';
import { navigateTo, AUTH_ROUTES } from '../routes/authRoutes';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, favorites, t, isAuthenticated } = useApp();

  const navItems: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: t.nav.home, icon: Home },
    { id: 'shop', label: t.nav.shop, icon: Store },
    { id: 'rewards', label: t.nav.rewards, icon: Sparkles },
    { id: 'favorites', label: t.nav.favorites, icon: Heart },
    { id: 'profile', label: t.nav.profile, icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EAE5D9] shadow-soft">
      <div className="max-w-md mx-auto flex items-center justify-around py-2 px-3">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1 relative tap-effect transition-colors duration-150 ${isActive ? 'text-[#162D1F]' : 'text-[#87958B] hover:text-[#4A5D50]'
                }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 ${isActive ? 'stroke-[2.4] scale-105' : 'stroke-[1.8]'
                    }`}
                />
                {item.id === 'favorites' && favorites.length > 0 && (
                  <span className="absolute -top-1 -right-2.5 min-w-[15px] h-[15px] px-1 bg-[#183324] text-[#E5A953] text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                    {favorites.length}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] mt-1 tracking-tight ${isActive ? 'font-semibold text-[#162D1F]' : 'font-medium text-[#87958B]'
                  }`}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 w-5 h-0.5 bg-[#183324] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
