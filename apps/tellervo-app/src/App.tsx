import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { CartDrawer } from './components/CartDrawer';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { SensoryQuizModal } from './components/SensoryQuizModal';
import { MembershipCardModal } from './components/MembershipCardModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { ChatbotDrawer } from './components/ChatbotDrawer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { LanguageModal } from './components/LanguageModal';
import { ToastContainer } from './components/ToastContainer';
import { HomeScreen } from './screens/HomeScreen';
import { ShopScreen } from './screens/ShopScreen';
import { RewardsScreen } from './screens/RewardsScreen';
import { FavoritesScreen } from './screens/FavoritesScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { getCurrentAuthRoute, navigateTo, AUTH_ROUTES } from './routes/authRoutes';
import { SignupPage } from './screens/auth/SignupPage';
import { LoginPage } from './screens/auth/LoginPage';

const MainApp: React.FC = () => {
  const { activeTab, setIsChatbotOpen, isAuthenticated, isLoadingSession } = useApp();

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'shop':
        return <ShopScreen />;
      case 'rewards':
        return <RewardsScreen />;
      case 'favorites':
        return <FavoritesScreen />;
      case 'profile':
        if (!isLoadingSession && !isAuthenticated) {
          navigateTo(AUTH_ROUTES.LOGIN);
          return null;
        }
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#1B2B20] flex flex-col items-center">

      {/* Real Full Mobile Web App (Clean container, no fake phone hardware frames or bezels) */}
      <div className="w-full max-w-md min-h-screen bg-[#FBF9F5] flex flex-col relative shadow-sm border-x border-[#EBE6DC]/70">
        {/* Sticky Mobile Header */}
        <Header />

        {/* Screen Content */}
        <main className="flex-1 w-full">
          {renderActiveScreen()}
        </main>

        {/* Floating Sommelier AI Chatbot Button (Hidden on Shop page) */}
        {activeTab !== 'shop' && (
          <div className="fixed bottom-20 right-4 sm:right-[calc(50%-208px+16px)] z-30">
            <button
              onClick={() => setIsChatbotOpen(true)}
              aria-label="Chat with Tellervo Botanical Sommelier"
              className="group relative flex items-center gap-2 pl-2 pr-3.5 py-2 rounded-full bg-[#183324] text-white shadow-float border border-[#2F523A] hover:bg-[#224430] active:scale-95 transition-all"
            >
              {/* Logo Avatar */}
              <div className="w-8 h-8 rounded-full bg-white p-0.5 overflow-hidden flex items-center justify-center shadow-xs">
                <img src="/tellervo-logo.png" alt="Tellervo AI" className="w-full h-full object-contain" />
              </div>

              <div className="text-left">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold text-white leading-none">Sommelier</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E5A953] animate-pulse" />
                </div>
                <span className="text-[9px] text-[#A6C4B0] leading-none block mt-0.5">Ask Botanical AI</span>
              </div>
            </button>
          </div>
        )}

        {/* Fixed Mobile Bottom Navigation */}
        <BottomNav />
      </div>

      {/* Interactive Drawers & Overlays */}
      <CartDrawer />
      <NotificationsDrawer />
      <SensoryQuizModal />
      <MembershipCardModal />
      <OrderTrackingModal />
      <ChatbotDrawer />
      <ProductDetailModal />
      <LanguageModal />
    </div>
  );
};

const AppRouter: React.FC = () => {
  const [authRoute, setAuthRoute] = React.useState<'signup' | 'login' | null>(() => getCurrentAuthRoute());
  const { isAuthenticated, isLoadingSession, activeTab } = useApp();

  React.useEffect(() => {
    const handleLocationChange = () => {
      setAuthRoute(getCurrentAuthRoute());
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Protected route guard: Profile requires authentication
  React.useEffect(() => {
    if (!isLoadingSession && !isAuthenticated && activeTab === 'profile') {
      navigateTo(AUTH_ROUTES.LOGIN);
    }
  }, [activeTab, isAuthenticated, isLoadingSession]);

  // When successfully authenticated, direct from /login or /signup to home
  React.useEffect(() => {
    if (!isLoadingSession && isAuthenticated) {
      if (authRoute === 'login' || authRoute === 'signup') {
        navigateTo(AUTH_ROUTES.HOME);
      }
    }
  }, [authRoute, isAuthenticated, isLoadingSession]);

  if (authRoute === 'signup') {
    return <SignupPage />;
  }

  if (authRoute === 'login') {
    return <LoginPage />;
  }

  return <MainApp />;
};

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
      <ToastContainer />
    </AppProvider>
  );
}
