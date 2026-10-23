import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Bell, Package, Sparkles, Sprout, Check } from 'lucide-react';

export const NotificationsDrawer: React.FC = () => {
  const { isNotificationsOpen, setIsNotificationsOpen } = useApp();

  if (!isNotificationsOpen) return null;

  const notifications = [
    {
      id: 'n1',
      title: 'Order Dispatched with Posti Eco',
      desc: 'Order #TL-89421 is on its electric courier route to Mannerheimintie 14 B.',
      time: '24m ago',
      icon: Package,
      unread: true,
    },
    {
      id: 'n2',
      title: 'Rare Harvest Restocked: Bilberry Nectar',
      desc: 'Small batch of 48 bottles just released from the Oulu Boreal Lab.',
      time: '3h ago',
      icon: Sparkles,
      unread: true,
    },
    {
      id: 'n3',
      title: '+36 Seeds Earned',
      desc: 'Harvest reward credited for your online purchase yesterday.',
      time: '1d ago',
      icon: Sprout,
      unread: false,
    },
    {
      id: 'n4',
      title: 'Weekend 2x Seeds Active',
      desc: 'All adaptogenic cordials and spritzes earn double harvest seeds this weekend.',
      time: '2d ago',
      icon: Sparkles,
      unread: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        onClick={() => setIsNotificationsOpen(false)}
        className="fixed inset-0 bg-[#0F1E15]/60 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md bg-[#FBF9F5] h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-200">
        <div className="p-4 bg-white border-b border-[#EBE6DC] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#183324] text-[#E5A953] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-editorial text-xl font-medium text-[#14261B]">Forest Signals</h2>
              <p className="text-[11px] text-[#7A8A7D]">Live dispatches and harvest alerts</p>
            </div>
          </div>
          <button
            onClick={() => setIsNotificationsOpen(false)}
            className="w-8 h-8 rounded-full bg-[#F3F0E6] flex items-center justify-center text-[#3D5244] hover:bg-[#EAE5D9]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.map(n => {
            const Icon = n.icon;
            return (
              <div
                key={n.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  n.unread
                    ? 'bg-white border-[#E0D8C8] shadow-soft-sm'
                    : 'bg-[#F5F2EB]/60 border-transparent opacity-85'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      n.unread ? 'bg-[#183324] text-[#E5A953]' : 'bg-[#E3DDCF] text-[#55695C]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-[#162D1E] truncate">{n.title}</h4>
                      <span className="text-[10px] text-[#869689] shrink-0">{n.time}</span>
                    </div>
                    <p className="text-xs text-[#5D6F62] mt-0.5 leading-relaxed">{n.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-white border-t border-[#EAE4D7] text-center">
          <button
            onClick={() => setIsNotificationsOpen(false)}
            className="text-xs font-semibold text-[#183324] flex items-center justify-center gap-1.5 mx-auto hover:underline"
          >
            <Check className="w-3.5 h-3.5" /> Mark all as read
          </button>
        </div>
      </div>
    </div>
  );
};
