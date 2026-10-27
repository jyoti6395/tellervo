import React, { useState } from 'react';
import { X, MapPin, Plus, Check, Home, Building2, Package, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AddressesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SavedAddress {
  id: string;
  type: 'home' | 'work' | 'locker';
  title: string;
  street: string;
  cityPostal: string;
  isDefault: boolean;
}

export const AddressesModal: React.FC<AddressesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, updateUserProfile, showToast } = useApp();

  const [addresses, setAddresses] = useState<SavedAddress[]>([
    {
      id: 'addr-1',
      type: 'home',
      title: 'Home (Central Helsinki)',
      street: user.address ? user.address.replace(' (Default)', '') : 'Mannerheimintie 14 B, apt 4',
      cityPostal: '00100 Helsinki, Finland',
      isDefault: true,
    },
    {
      id: 'addr-2',
      type: 'work',
      title: 'Design Studio / Office',
      street: 'Pohjoisesplanadi 33, 3rd floor',
      cityPostal: '00100 Helsinki, Finland',
      isDefault: false,
    },
    {
      id: 'addr-3',
      type: 'locker',
      title: 'Posti SmartPost Locker #42',
      street: 'Kamppi Shopping Centre, Level K1',
      cityPostal: '00100 Helsinki, Finland',
      isDefault: false,
    },
  ]);

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newType, setNewType] = useState<'home' | 'work' | 'locker'>('home');
  const [newTitle, setNewTitle] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newCityPostal, setNewCityPostal] = useState('00100 Helsinki');

  if (!isOpen) return null;

  const handleSetDefault = (id: string) => {
    setAddresses(prev =>
      prev.map(a => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
    const target = addresses.find(a => a.id === id);
    if (target) {
      const fullAddressStr = `${target.street}, ${target.cityPostal} (Default)`;
      updateUserProfile({ address: fullAddressStr });
      showToast(`Default delivery address set to ${target.title}`);
    }
  };

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet.trim()) {
      showToast('Please enter a street address', 'info');
      return;
    }

    const newAddr: SavedAddress = {
      id: `addr-${Date.now()}`,
      type: newType,
      title: newTitle.trim() || (newType === 'home' ? 'Home' : newType === 'work' ? 'Workplace' : 'Posti Locker'),
      street: newStreet.trim(),
      cityPostal: newCityPostal.trim(),
      isDefault: false,
    };

    setAddresses(prev => [...prev, newAddr]);
    setIsAddingNew(false);
    setNewTitle('');
    setNewStreet('');
    showToast(`Added ${newAddr.title} to saved addresses`, 'success');
  };

  const handleDeleteAddress = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (addresses.length <= 1) {
      showToast('You must keep at least one saved delivery address', 'info');
      return;
    }
    setAddresses(prev => prev.filter(a => a.id !== id));
    showToast('Address removed', 'info');
  };

  const getIcon = (type: SavedAddress['type']) => {
    switch (type) {
      case 'home':
        return <Home className="w-4 h-4 text-[#183324]" />;
      case 'work':
        return <Building2 className="w-4 h-4 text-[#183324]" />;
      case 'locker':
        return <Package className="w-4 h-4 text-[#183324]" />;
    }
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
              DELIVERY DESTINATIONS
            </span>
            <h3 className="font-editorial text-2xl font-medium text-[#14261B]">
              My Addresses
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

        <p className="text-xs text-[#5D6F61] mb-4">
          Cold-box shipments via carbon-neutral Posti Eco. Select your default drop point.
        </p>

        {/* Addresses List */}
        <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
          {addresses.map(addr => (
            <div
              key={addr.id}
              onClick={() => handleSetDefault(addr.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                addr.isDefault
                  ? 'bg-white border-[#183324] shadow-soft-sm ring-1 ring-[#183324]'
                  : 'bg-white/80 border-[#E5DFD2] hover:border-[#183324]/40 hover:bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#F5F2EB] flex items-center justify-center shrink-0">
                    {getIcon(addr.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-[#14261B]">{addr.title}</h4>
                      {addr.isDefault && (
                        <span className="px-2 py-0.5 rounded-md bg-[#EAF3ED] border border-[#CFE2D4] text-[#246138] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <Check className="w-2.5 h-2.5 stroke-[3]" /> Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#5A6D5E] mt-0.5">{addr.street}</p>
                    <p className="text-[11px] text-[#869689]">{addr.cityPostal}</p>
                  </div>
                </div>

                {!addr.isDefault && (
                  <button
                    type="button"
                    onClick={e => handleDeleteAddress(addr.id, e)}
                    className="p-1.5 rounded-lg text-[#88988C] hover:text-[#9E3E3E] hover:bg-[#FBEBEB] transition-colors"
                    title="Remove address"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add New Address Form / Trigger */}
          {isAddingNew ? (
            <form onSubmit={handleAddNewAddress} className="bg-white rounded-2xl p-4 border border-[#DED7C9] space-y-3 mt-3">
              <h5 className="text-xs font-bold text-[#183324] uppercase tracking-wider">
                Add New Delivery Location
              </h5>

              <div className="grid grid-cols-3 gap-1.5">
                {(['home', 'work', 'locker'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setNewType(t)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold capitalize border transition-all ${
                      newType === t
                        ? 'bg-[#183324] text-white border-[#183324]'
                        : 'bg-[#F7F5EE] text-[#4A5D4F] border-[#E8E2D5]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Location label (e.g. Summer Cabin)"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-[#FAF8F3] rounded-xl border border-[#DED7C9] px-3 py-2 text-xs text-[#14261B] focus:outline-none focus:border-[#183324]"
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Street & Apartment (e.g. Aleksanterinkatu 12 B 3)"
                  value={newStreet}
                  onChange={e => setNewStreet(e.target.value)}
                  className="w-full bg-[#FAF8F3] rounded-xl border border-[#DED7C9] px-3 py-2 text-xs text-[#14261B] focus:outline-none focus:border-[#183324]"
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Postal Code & City (e.g. 00170 Helsinki)"
                  value={newCityPostal}
                  onChange={e => setNewCityPostal(e.target.value)}
                  className="w-full bg-[#FAF8F3] rounded-xl border border-[#DED7C9] px-3 py-2 text-xs text-[#14261B] focus:outline-none focus:border-[#183324]"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#183324] text-white text-xs font-semibold rounded-xl hover:bg-[#254632]"
                >
                  Save Address
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-2 bg-[#F3EFE6] text-[#2A3E31] text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingNew(true)}
              className="w-full py-2.5 rounded-2xl border-2 border-dashed border-[#DED7C9] hover:border-[#183324] text-[#183324] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Address</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#EAE4D7] mt-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-[#183324] text-[#FAF8F3] text-xs font-semibold rounded-xl hover:bg-[#254632] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
