import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { REWARDS_CATALOG, SEED_ACTIVITIES } from '../data/mockData';
import { 
  Trees, 
  QrCode, 
  Sparkles, 
  Scan, 
  Sprout, 
  Users, 
  Ticket, 
  Flame, 
  RotateCw, 
  MessageSquare, 
  Truck, 
  Lock, 
  Compass, 
  ArrowRight, 
  Check, 
  ShoppingBag,
  Gift
} from 'lucide-react';

export const RewardsScreen: React.FC = () => {
  const { 
    user, 
    addSeeds, 
    redeemReward, 
    setIsMembershipCardOpen, 
    showToast,
    t
  } = useApp();

  const [referralCopied, setReferralCopied] = useState(false);
  const [activeModal, setActiveModal] = useState<'scan' | 'earn' | 'referrals' | 'vouchers' | null>(null);

  const handleCopyReferral = () => {
    setReferralCopied(true);
    showToast('Copied referral link: tellervo.fi/invite/FREJA-680', 'success');
    setTimeout(() => setReferralCopied(false), 2500);
  };

  return (
    <div className="pb-28 px-4 pt-3 w-full space-y-5 animate-in fade-in duration-200">
      {/* Top Taiga Patron Member Card */}
      <div className="bg-[#193222] text-white rounded-3xl p-5 shadow-soft border border-[#274732] relative overflow-hidden">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#E5A953] uppercase block mb-0.5">
              {t.rewards.clubTitle}
            </span>
            <h2 className="font-editorial text-2xl font-medium text-white">
              {user.name}
            </h2>
          </div>
          <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-[11px] font-semibold text-[#D4E8DC] flex items-center gap-1">
            <Trees className="w-3.5 h-3.5 text-[#E5A953]" />
            <span>{t.rewards.patronBadge}</span>
          </span>
        </div>

        {/* Balance & QR Card Button */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="font-editorial text-[38px] leading-none font-medium text-white">
              {user.seeds} <span className="text-xl font-normal text-[#D4E7DC]">{t.rewards.seeds}</span>
            </div>
            <p className="text-xs text-[#9BBBA4] mt-1">
              {t.rewards.harvestBalance} • {t.rewards.levelOf}
            </p>
          </div>

          <button
            onClick={() => setIsMembershipCardOpen(true)}
            className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-[#FAF8F3] transition-all active:scale-95 shadow-sm"
          >
            <QrCode className="w-6 h-6 text-[#E5A953]" />
            <span className="text-[9px] font-bold tracking-wider mt-0.5">{t.rewards.card}</span>
          </button>
        </div>

        {/* Next Tier Progress */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center justify-between text-xs text-[#B2CEBC]">
            <span className="flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#E5A953]" />
              <span>{t.rewards.nextTier}</span>
            </span>
            <span className="text-[#E5A953] font-bold">{user.seedsNeeded} {t.rewards.seedsLeft}</span>
          </div>
          <div className="w-full h-1.5 bg-[#2B4B36] rounded-full overflow-hidden">
            <div className="h-full bg-[#E5A953] rounded-full w-[68%]" />
          </div>
        </div>

        {/* Perks footer */}
        <div className="pt-2 border-t border-white/10 flex items-center gap-2 text-[11px] text-[#A6C4B0]">
          <Lock className="w-3 h-3 text-[#E5A953]" />
          <span>{t.rewards.earlyAccess}</span>
        </div>
      </div>

      {/* 4 Quick Action Buttons */}
      <div className="grid grid-cols-4 gap-2.5">
        <button
          onClick={() => setActiveModal('scan')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#E8E2D4] shadow-soft-sm hover:border-[#D5CBB8] active:scale-95 transition-all text-[#1B3223]"
        >
          <div className="w-10 h-10 rounded-full bg-[#F4F1E8] flex items-center justify-center mb-1 text-[#223E2C]">
            <Scan className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium tracking-tight">{t.rewards.nordicScan}</span>
        </button>

        <button
          onClick={() => setActiveModal('earn')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#E8E2D4] shadow-soft-sm hover:border-[#D5CBB8] active:scale-95 transition-all text-[#1B3223]"
        >
          <div className="w-10 h-10 rounded-full bg-[#F4F1E8] flex items-center justify-center mb-1 text-[#223E2C]">
            <Sprout className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium tracking-tight">{t.rewards.earnSeeds}</span>
        </button>

        <button
          onClick={() => setActiveModal('referrals')}
          className="relative flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#E8E2D4] shadow-soft-sm hover:border-[#D5CBB8] active:scale-95 transition-all text-[#1B3223]"
        >
          <span className="absolute -top-1.5 right-2 px-1.5 py-0.2 rounded-full bg-[#E5A953] text-[#12281C] text-[9px] font-bold">
            +150
          </span>
          <div className="w-10 h-10 rounded-full bg-[#F4F1E8] flex items-center justify-center mb-1 text-[#223E2C]">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium tracking-tight">{t.rewards.referrals}</span>
        </button>

        <button
          onClick={() => setActiveModal('vouchers')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#E8E2D4] shadow-soft-sm hover:border-[#D5CBB8] active:scale-95 transition-all text-[#1B3223]"
        >
          <div className="w-10 h-10 rounded-full bg-[#F4F1E8] flex items-center justify-center mb-1 text-[#223E2C]">
            <Ticket className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium tracking-tight">{t.rewards.vouchers}</span>
        </button>
      </div>

      {/* Available Rewards Section */}
      <div>
        <div className="flex items-baseline justify-between mb-1">
          <h3 className="font-editorial text-xl font-medium text-[#14261B]">{t.rewards.availableRewards}</h3>
          <button 
            onClick={() => showToast('Full botanical reward catalog updated for October', 'info')}
            className="text-xs font-semibold text-[#8C7443] hover:underline"
          >
            Catalog
          </button>
        </div>
        <p className="text-xs text-[#637568] mb-3">{t.rewards.availableSub}</p>

        {/* Horizontal Reward Cards */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {REWARDS_CATALOG.map(reward => (
            <div
              key={reward.id}
              className="w-56 shrink-0 bg-white rounded-3xl p-3 border border-[#E8E2D5] shadow-soft-sm flex flex-col justify-between"
            >
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] mb-2.5">
                <img
                  src={reward.imageUrl}
                  alt={reward.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 right-2 px-2.5 py-1 bg-[#183324] text-[#E5A953] text-[10px] font-bold rounded-lg shadow">
                  {reward.seedsCost} SEEDS
                </span>
              </div>

              <div className="flex-1 mb-2">
                <h4 className="font-editorial text-sm font-semibold text-[#183122] leading-tight">
                  {reward.title}
                </h4>
                <p className="text-[11px] text-[#718274] mt-1 leading-relaxed">
                  {reward.description}
                </p>
              </div>

              <button
                onClick={() => redeemReward(reward)}
                className="w-full py-2 bg-[#183324] text-[#FAF8F3] text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#234330] transition-colors"
              >
                <Check className="w-3.5 h-3.5 text-[#E5A953]" />
                <span>Redeem Now</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Gather More Seeds Section */}
      <div>
        <h3 className="font-editorial text-xl font-medium text-[#14261B] mb-0.5">
          Gather More Seeds
        </h3>
        <p className="text-xs text-[#637568] mb-3">
          Simple seasonal actions to nurture your forest tally
        </p>

        <div className="space-y-2.5">
          {/* Action 1 */}
          <div className="p-3.5 bg-white rounded-2xl border border-[#E8E2D5] shadow-soft-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FDF1E2] text-[#D8862F] flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#162D1F]">Forest Streak: Day 5 of 7</div>
                <div className="text-[11px] text-[#6F8174]">Log botanical drinks this week</div>
              </div>
            </div>
            <button
              onClick={() => addSeeds(50, 'Forest Streak: Day 5 of 7')}
              className="px-3 py-1.5 bg-[#F8EADA] text-[#A66624] text-xs font-bold rounded-full hover:bg-[#F2DEC7] transition-colors"
            >
              +50 Seeds
            </button>
          </div>

          {/* Action 2 */}
          <div className="p-3.5 bg-white rounded-2xl border border-[#E8E2D5] shadow-soft-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8F3EB] text-[#29633D] flex items-center justify-center shrink-0">
                <RotateCw className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#162D1F]">Return Recycled Cans</div>
                <div className="text-[11px] text-[#6F8174]">Scan QR at deposit station or market</div>
              </div>
            </div>
            <button
              onClick={() => addSeeds(10, 'Recycled Can Return')}
              className="px-3 py-1.5 bg-[#D5EADB] text-[#1E5431] text-xs font-bold rounded-full hover:bg-[#C5E2CD] transition-colors"
            >
              +10/can
            </button>
          </div>

          {/* Action 3 */}
          <div className="p-3.5 bg-white rounded-2xl border border-[#E8E2D5] shadow-soft-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E6EFE9] text-[#1B3B26] flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#162D1F]">Rate Arctic Cloudberry Soda</div>
                <div className="text-[11px] text-[#6F8174]">Tasted yesterday on order #T-4409</div>
              </div>
            </div>
            <button
              onClick={() => addSeeds(25, 'Rating Cloudberry Soda')}
              className="px-3 py-1.5 bg-[#183324] text-[#E5A953] text-xs font-bold rounded-full hover:bg-[#234330] transition-colors"
            >
              +25 Seeds
            </button>
          </div>
        </div>
      </div>

      {/* Taiga Patron Privileges Section */}
      <div className="bg-[#FAF7F0] rounded-3xl p-5 border border-[#E9E1CF] shadow-soft-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#E5A953] text-[#162D1F] flex items-center justify-center">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <h3 className="font-editorial text-lg font-medium text-[#14261B]">
            Taiga Patron Privileges
          </h3>
        </div>

        <div className="space-y-3 text-xs text-[#5C6E61]">
          <div className="flex items-start gap-3">
            <Truck className="w-4 h-4 text-[#D49B4E] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-[#183122]">Free Carbon-Neutral Express Shipping</div>
              <div className="text-[#6C7E71] text-[11px] leading-relaxed">
                Automatic on all cases dispatched throughout Finland and the Baltics.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Lock className="w-4 h-4 text-[#D49B4E] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-[#183122]">Secret Seasonal Forest Drops</div>
              <div className="text-[#6C7E71] text-[11px] leading-relaxed">
                48-hour headstart access before small-batch seasonal releases go public.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Gift className="w-4 h-4 text-[#D49B4E] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-[#183122]">Harvest Festival Invites</div>
              <div className="text-[#6C7E71] text-[11px] leading-relaxed">
                Complimentary pass to the annual Autumn Solstice Foraging Gathering.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Seed Activity */}
      <div>
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="font-editorial text-xl font-medium text-[#14261B]">
            Recent Seed Activity
          </h3>
          <span className="text-xs font-medium text-[#7C8D80]">October 2026</span>
        </div>

        <div className="space-y-2.5">
          {SEED_ACTIVITIES.map(act => (
            <div
              key={act.id}
              className="p-3.5 bg-white rounded-2xl border border-[#EAE4D7] shadow-soft-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    act.amount > 0
                      ? 'bg-[#EAF3ED] text-[#22442E]'
                      : 'bg-[#F5F2EB] text-[#78897C]'
                  }`}
                >
                  {act.iconType === 'cart' && <ShoppingBag className="w-4 h-4" />}
                  {act.iconType === 'referral' && <Users className="w-4 h-4" />}
                  {act.iconType === 'voucher' && <Ticket className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#183122]">{act.title}</div>
                  <div className="text-[11px] text-[#768779]">{act.subtitle}</div>
                </div>
              </div>

              <span
                className={`text-sm font-bold ${
                  act.amount > 0 ? 'text-[#285735]' : 'text-[#87978B]'
                }`}
              >
                {act.amount > 0 ? `+${act.amount}` : act.amount}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Referrals / Scan / Earn / Vouchers */}
      {activeModal === 'referrals' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setActiveModal(null)} className="fixed inset-0 bg-[#0E1D14]/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-[#FBF9F5] rounded-3xl p-6 shadow-2xl border border-[#E8E2D4] z-10 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-[#183324] text-[#E5A953] flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-editorial text-2xl font-medium text-[#14261B] mb-1">
              Invite a Forest Companion
            </h3>
            <p className="text-xs text-[#5D6F61] mb-5">
              Give €10 to a friend. You get +150 Seeds as soon as they complete their first wild harvest order.
            </p>
            <div className="bg-white rounded-2xl p-3 border border-[#E6E0D2] flex items-center justify-between mb-4">
              <span className="font-mono text-xs font-bold text-[#183122] tracking-wider">
                FREJA-TAIGA-26
              </span>
              <button
                onClick={handleCopyReferral}
                className="px-3 py-1 bg-[#183324] text-white text-xs font-semibold rounded-lg hover:bg-[#254632]"
              >
                {referralCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 text-xs text-[#6F8174] font-semibold hover:underline"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {activeModal === 'scan' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setActiveModal(null)} className="fixed inset-0 bg-[#0E1D14]/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-[#FBF9F5] rounded-3xl p-6 shadow-2xl border border-[#E8E2D4] z-10 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-[#183324] text-[#E5A953] flex items-center justify-center mx-auto mb-3">
              <Scan className="w-6 h-6" />
            </div>
            <h3 className="font-editorial text-2xl font-medium text-[#14261B] mb-1">
              Nordic Can Deposit Scanner
            </h3>
            <p className="text-xs text-[#5D6F61] mb-5">
              Point your camera at any Tellervo can or bottle recycling receipt QR code to instantly deposit +10 seeds per can.
            </p>
            <div className="w-full h-36 bg-[#EBE7DC] rounded-2xl border-2 border-dashed border-[#B8B1A0] flex flex-col items-center justify-center text-[#748679] mb-4">
              <Scan className="w-8 h-8 opacity-50 animate-pulse mb-1" />
              <span className="text-[11px]">Align barcode inside frame</span>
            </div>
            <button
              onClick={() => {
                addSeeds(20, '2 Cans Deposited');
                setActiveModal(null);
              }}
              className="w-full py-3 bg-[#183324] text-[#FAF8F3] text-xs font-semibold rounded-xl hover:bg-[#234330]"
            >
              Simulate Deposit Scan (+20 Seeds)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
