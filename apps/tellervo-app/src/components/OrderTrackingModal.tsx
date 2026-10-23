import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Truck, CheckCircle2, Clock, MapPin, ShieldCheck } from 'lucide-react';

export const OrderTrackingModal: React.FC = () => {
  const { selectedOrderForTracking, setSelectedOrderForTracking } = useApp();

  if (!selectedOrderForTracking) return null;

  const order = selectedOrderForTracking;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={() => setSelectedOrderForTracking(null)}
        className="fixed inset-0 bg-[#0E1D14]/70 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-sm bg-[#FBF9F5] rounded-3xl p-6 shadow-2xl border border-[#E8E2D4] z-10 animate-in zoom-in-95 duration-200">
        <button
          onClick={() => setSelectedOrderForTracking(null)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#EFECE2] flex items-center justify-center text-[#405445]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold tracking-widest text-[#937548] uppercase">
            LIVE DISPATCH TRACKING
          </span>
        </div>
        <h3 className="font-editorial text-2xl font-medium text-[#14261B] mb-1">
          {order.orderNumber}
        </h3>
        <p className="text-xs text-[#5D6F61] mb-4">
          Carbon-neutral courier dispatch via {order.courier}
        </p>

        {/* Live Status Badge */}
        <div className="bg-[#EAF3ED] border border-[#CFE3D5] rounded-2xl p-3.5 mb-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#183324] text-[#E5A953] flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#183122]">Out for Delivery • Expected Today</div>
            <div className="text-[11px] text-[#4F735B]">Driver Marko S. is 4 stops away (14:35 - 15:15)</div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4 relative pl-6 border-l-2 border-[#D7E3DA] ml-3 mb-6">
          <div className="relative">
            <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#183324] ring-4 ring-[#EAF3ED] flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-[#E5A953] rounded-full" />
            </div>
            <div className="text-xs font-bold text-[#14261B]">Loaded into Electric Van</div>
            <div className="text-[11px] text-[#6C7E71]">Helsinki Central Depot • 12:40 Today</div>
          </div>

          <div className="relative">
            <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#3D694E] flex items-center justify-center">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
            <div className="text-xs font-medium text-[#14261B]">Subarctic Cold Pack Sealed</div>
            <div className="text-[11px] text-[#6C7E71]">Oulu Boreal Craft Lab • 06:15 Today</div>
          </div>

          <div className="relative">
            <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#3D694E] flex items-center justify-center">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
            <div className="text-xs font-medium text-[#14261B]">Order Confirmed & Prepared</div>
            <div className="text-[11px] text-[#6C7E71]">Batch #89421 • Oct 13, 19:22</div>
          </div>
        </div>

        {/* Destination */}
        <div className="bg-white rounded-2xl p-3 border border-[#E8E2D4] space-y-2 mb-5">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-[#183324] shrink-0 mt-0.5" />
            <div className="text-xs">
              <div className="font-bold text-[#162B1D]">Delivery Destination</div>
              <div className="text-[#647668]">Mannerheimintie 14 B, 00100 Helsinki, Finland</div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setSelectedOrderForTracking(null)}
          className="w-full py-3 bg-[#183324] text-[#FAF8F3] text-xs font-semibold rounded-xl hover:bg-[#234330]"
        >
          Close Tracking
        </button>
      </div>
    </div>
  );
};
