import React, { useState } from 'react';
import { X, FileText, Trees, ShieldCheck, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface LegalPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegalPrivacyModal: React.FC<LegalPrivacyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'terms' | 'harvest' | 'gdpr'>('terms');

  if (!isOpen) return null;

  const handleExportData = () => {
    showToast('GDPR archive created: patron-data-export.json downloaded', 'success');
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
              COMPLIANCE & GOVERNANCE
            </span>
            <h3 className="font-editorial text-2xl font-medium text-[#14261B]">
              Legal & Privacy
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

        {/* Tab Switcher */}
        <div className="flex gap-1.5 p-1 bg-[#EFECE2] rounded-2xl mb-3 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`flex-1 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'terms'
                ? 'bg-white text-[#183324] shadow-xs'
                : 'text-[#617467] hover:text-[#183324]'
            }`}
          >
            Terms
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('harvest')}
            className={`flex-1 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'harvest'
                ? 'bg-white text-[#183324] shadow-xs'
                : 'text-[#617467] hover:text-[#183324]'
            }`}
          >
            Harvest Policy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gdpr')}
            className={`flex-1 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'gdpr'
                ? 'bg-white text-[#183324] shadow-xs'
                : 'text-[#617467] hover:text-[#183324]'
            }`}
          >
            GDPR & Data
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 text-xs text-[#5D6F61] leading-relaxed space-y-3">
          {activeTab === 'terms' && (
            <div className="space-y-2.5 bg-white rounded-2xl p-4 border border-[#E8E2D5]">
              <div className="flex items-center gap-1.5 font-bold text-[#183324]">
                <FileText className="w-4 h-4 text-[#A67C37]" />
                <span>Tellervo Drinks Oy • Terms of Sale</span>
              </div>
              <p>
                Tellervo Drinks Oy is registered with the Finnish Trade Register (Y-tunnus 3281902-1) in Helsinki, Finland.
              </p>
              <p>
                <strong>Zero-Proof Certification:</strong> All Tellervo botanical tonics, elixirs, and sparkling spritzes contain strictly 0.0% ABV and are classified as subarctic non-alcoholic beverages under EU regulation 1169/2011.
              </p>
              <p>
                <strong>Subscription Flexibility:</strong> Subscriptions are non-binding. Patrons may skip, pause, or terminate recurring monthly harvest deliveries anytime prior to the dispatch lock-in date.
              </p>
            </div>
          )}

          {activeTab === 'harvest' && (
            <div className="space-y-2.5 bg-white rounded-2xl p-4 border border-[#E8E2D5]">
              <div className="flex items-center gap-1.5 font-bold text-[#183324]">
                <Trees className="w-4 h-4 text-[#26683B]" />
                <span>Nordic Wild Foraging Ethics</span>
              </div>
              <p>
                Harvested under Finland&apos;s constitutional <em>Everyman&apos;s Right (Jokamiehenoikeus)</em> with strict quotas in the Kainuu and Lapland conservation corridors.
              </p>
              <p>
                We never harvest more than 10% of any wild cloudberry, spruce needle, or chaga colony, leaving the boreal ecosystem undisturbed.
              </p>
              <p>
                <strong>Packaging & Pantti:</strong> 100% of our cans and bottles are recyclable via PALPA reverse vending stations across the Nordic nations.
              </p>
            </div>
          )}

          {activeTab === 'gdpr' && (
            <div className="space-y-2.5 bg-white rounded-2xl p-4 border border-[#E8E2D5]">
              <div className="flex items-center gap-1.5 font-bold text-[#183324]">
                <ShieldCheck className="w-4 h-4 text-[#26683B]" />
                <span>EU GDPR & Privacy Rights</span>
              </div>
              <p>
                Under EU Regulation 2016/679 (GDPR), you retain full rights to access, rectify, export, and delete your patron profile records at any time.
              </p>
              <p>
                Your delivery data is shared strictly with certified carbon-neutral shipping partners (Posti Eco) solely for order fulfillment.
              </p>
              <button
                type="button"
                onClick={handleExportData}
                className="w-full py-2 bg-[#F5F2EB] hover:bg-[#ECE6DA] border border-[#E4DDD0] rounded-xl text-xs font-semibold text-[#183324] flex items-center justify-center gap-1.5 transition-colors mt-2"
              >
                <Download className="w-3.5 h-3.5 text-[#E5A953]" />
                <span>Download GDPR Account Export (JSON)</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#EAE4D7] mt-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-[#183324] text-[#FAF8F3] text-xs font-semibold rounded-xl hover:bg-[#254632] transition-colors"
          >
            Close Policy
          </button>
        </div>
      </div>
    </div>
  );
};
