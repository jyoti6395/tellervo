import React from 'react';
import { Home, Building2, Package, MapPin, Check, Pencil, Trash2 } from 'lucide-react';
import { SavedAddress, AddressType } from '../../../types/address';
import { getCountryByCode } from '../../../config/countries.config';

interface SavedAddressCardProps {
  address: SavedAddress;
  onSetDefault: (id: string) => void;
  onEdit: (address: SavedAddress) => void;
  onDelete: (address: SavedAddress) => void;
  disableDelete?: boolean;
}

export const SavedAddressCard: React.FC<SavedAddressCardProps> = ({
  address,
  onSetDefault,
  onEdit,
  onDelete,
  disableDelete = false,
}) => {
  const country = getCountryByCode(address.countryCode);

  const getIcon = (type: AddressType) => {
    switch (type) {
      case 'home':
        return <Home className="w-4 h-4 text-[#183324]" />;
      case 'work':
        return <Building2 className="w-4 h-4 text-[#183324]" />;
      case 'locker':
        return <Package className="w-4 h-4 text-[#183324]" />;
      case 'other':
      default:
        return <MapPin className="w-4 h-4 text-[#183324]" />;
    }
  };

  return (
    <div
      className={`p-4 rounded-2xl border transition-all relative ${
        address.isDefault
          ? 'bg-white border-[#183324] shadow-soft-sm ring-1.5 ring-[#183324]'
          : 'bg-white/80 border-[#E5DFD2] hover:border-[#183324]/40 hover:bg-white shadow-soft-sm'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#F5F2EB] flex items-center justify-center shrink-0">
            {getIcon(address.type)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-[#14261B]">
                {address.title || (address.type === 'home' ? 'Home' : address.type === 'work' ? 'Workplace' : 'Posti Locker')}
              </h4>
              {address.isDefault && (
                <span className="px-2 py-0.5 rounded-md bg-[#EAF3ED] border border-[#CFE2D4] text-[#246138] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Check className="w-2.5 h-2.5 stroke-[3]" /> Default
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-[#183324] mt-0.5">
              {address.recipientName}
              {address.phone && (
                <span className="text-[#718274] font-normal ml-1.5">
                  • {address.phone}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Address Details */}
      <div className="pl-10 text-xs text-[#5A6D5E] space-y-0.5">
        <p className="text-[#14261B]">
          {address.street}
          {address.additionalDetails && (
            <span className="text-[#718274]">, {address.additionalDetails}</span>
          )}
        </p>
        <p className="text-[11px] text-[#718274]">
          {address.postalCode} {address.city}, {country.name}
        </p>
      </div>

      {/* Action Footer Row */}
      <div className="mt-3.5 pt-2.5 border-t border-[#F0EBE1] flex items-center justify-between pl-10">
        <div>
          {!address.isDefault && (
            <button
              type="button"
              onClick={() => onSetDefault(address.id)}
              className="text-[11px] font-semibold text-[#3E5645] hover:text-[#183324] underline underline-offset-2 transition-colors"
            >
              Set as Default
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(address)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#3E5645] hover:text-[#183324] hover:bg-[#F0ECE1] transition-colors"
            title="Edit address"
          >
            <Pencil className="w-3 h-3" />
            <span>Edit</span>
          </button>

          {!address.isDefault && (
            <button
              type="button"
              disabled={disableDelete}
              onClick={() => onDelete(address)}
              className="p-1.5 rounded-lg text-[#88988C] hover:text-[#9E3E3E] hover:bg-[#FBEBEB] transition-colors disabled:opacity-40 disabled:pointer-events-none"
              title="Delete address"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
