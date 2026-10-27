import React, { useState } from 'react';
import { X, Plus, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SavedAddress, AddressFormData, AddressModalMode } from '../../types/address';
import { SavedAddressCard } from './addresses/SavedAddressCard';
import { AddressFormModal } from './addresses/AddressFormModal';
import { DeleteAddressDialog } from './addresses/DeleteAddressDialog';

interface AddressesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddressesModal: React.FC<AddressesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, updateUserProfile, showToast } = useApp();

  const [addresses, setAddresses] = useState<SavedAddress[]>([
    {
      id: 'addr-1',
      recipientName: user.name || 'Matti Virtanen',
      phone: user.phone || '+358 40 123 4567',
      type: 'home',
      title: 'Home (Central Helsinki)',
      street: user.address ? user.address.replace(' (Default)', '').split(',')[0] || 'Mannerheimintie 14 B' : 'Mannerheimintie 14 B',
      additionalDetails: 'Apt 4',
      postalCode: '00100',
      city: 'Helsinki',
      countryCode: 'FI',
      isDefault: true,
    },
    {
      id: 'addr-2',
      recipientName: user.name || 'Matti Virtanen',
      phone: user.phone || '+358 40 123 4567',
      type: 'work',
      title: 'Design Studio / Office',
      street: 'Pohjoisesplanadi 33',
      additionalDetails: '3rd floor, suite 12',
      postalCode: '00100',
      city: 'Helsinki',
      countryCode: 'FI',
      isDefault: false,
    },
    {
      id: 'addr-3',
      recipientName: user.name || 'Matti Virtanen',
      phone: user.phone || '+358 40 123 4567',
      type: 'locker',
      title: 'Posti SmartPost Locker #42',
      street: 'Kamppi Shopping Centre, Urho Kekkosen katu 1',
      additionalDetails: 'Level K1 (Next to K-Supermarket)',
      postalCode: '00100',
      city: 'Helsinki',
      countryCode: 'FI',
      isDefault: false,
    },
  ]);

  // Separate Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<AddressModalMode>('add');
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTargetAddress, setDeleteTargetAddress] = useState<SavedAddress | null>(null);

  if (!isOpen) return null;

  const handleSetDefault = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
    const target = addresses.find((a) => a.id === id);
    if (target) {
      const fullAddressStr = `${target.street}, ${target.postalCode} ${target.city} (Default)`;
      updateUserProfile({ address: fullAddressStr });
      showToast(`Default delivery address set to ${target.title || target.street}`);
    }
  };

  const handleOpenAddModal = () => {
    setFormMode('add');
    setEditingAddress(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (addr: SavedAddress) => {
    setFormMode('edit');
    setEditingAddress(addr);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteDialog = (addr: SavedAddress) => {
    if (addresses.length <= 1) {
      showToast('You must keep at least one saved delivery address', 'info');
      return;
    }
    setDeleteTargetAddress(addr);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = (id: string) => {
    const target = addresses.find((a) => a.id === id);
    const wasDefault = target?.isDefault;

    setAddresses((prev) => {
      const remaining = prev.filter((a) => a.id !== id);
      if (wasDefault && remaining.length > 0) {
        remaining[0].isDefault = true;
        const newDefault = remaining[0];
        const fullAddressStr = `${newDefault.street}, ${newDefault.postalCode} ${newDefault.city} (Default)`;
        updateUserProfile({ address: fullAddressStr });
      }
      return remaining;
    });

    showToast('Address removed from saved delivery destinations', 'info');
  };

  const handleSaveAddress = (formData: AddressFormData, editId?: string) => {
    if (formMode === 'edit' && editId) {
      setAddresses((prev) => {
        let updated = prev.map((item) => {
          if (item.id === editId) {
            return {
              ...item,
              recipientName: formData.recipientName,
              type: formData.type,
              title: formData.title || item.title,
              street: formData.street,
              additionalDetails: formData.additionalDetails,
              postalCode: formData.postalCode,
              city: formData.city,
              countryCode: formData.countryCode,
              phone: formData.phone,
              isDefault: formData.isDefault,
            };
          }
          if (formData.isDefault) {
            return { ...item, isDefault: false };
          }
          return item;
        });

        // Ensure at least one is default
        if (!updated.some((a) => a.isDefault) && updated.length > 0) {
          updated[0].isDefault = true;
        }

        const currentDefault = updated.find((a) => a.isDefault);
        if (currentDefault) {
          const fullAddressStr = `${currentDefault.street}, ${currentDefault.postalCode} ${currentDefault.city} (Default)`;
          updateUserProfile({ address: fullAddressStr });
        }

        return updated;
      });

      showToast('Address updated successfully', 'success');
    } else {
      // Add Mode
      const newId = `addr-${Date.now()}`;
      const newAddress: SavedAddress = {
        id: newId,
        recipientName: formData.recipientName,
        type: formData.type,
        title: formData.title || (formData.type === 'home' ? 'Home' : formData.type === 'work' ? 'Workplace' : 'Posti Locker'),
        street: formData.street,
        additionalDetails: formData.additionalDetails,
        postalCode: formData.postalCode,
        city: formData.city,
        countryCode: formData.countryCode,
        phone: formData.phone,
        isDefault: Boolean(formData.isDefault) || addresses.length === 0,
      };

      setAddresses((prev) => {
        let updated = [...prev];
        if (newAddress.isDefault) {
          updated = updated.map((a) => ({ ...a, isDefault: false }));
        }
        updated.push(newAddress);

        if (newAddress.isDefault) {
          const fullAddressStr = `${newAddress.street}, ${newAddress.postalCode} ${newAddress.city} (Default)`;
          updateUserProfile({ address: fullAddressStr });
        }
        return updated;
      });

      showToast(`Added ${newAddress.title} to saved delivery locations`, 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#0E1D14]/70 backdrop-blur-sm animate-in fade-in duration-200"
      />

      {/* Main Addresses Modal Card */}
      <div className="relative w-full max-w-sm sm:max-w-md bg-[#FBF9F5] rounded-3xl p-6 shadow-2xl border border-[#E8E2D4] z-10 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-3 pb-3 border-b border-[#EBE6DC]">
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
            className="w-8 h-8 rounded-full bg-[#EFECE2] flex items-center justify-center text-[#405445] hover:bg-[#E2DDD0] hover:text-[#183324] transition-all shadow-soft-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#5D6F61] mb-3.5">
          Carbon-neutral delivery via Posti Eco. Select your default drop point or manage delivery locations.
        </p>

        {/* Saved Addresses List (Zero inline form expansion clutter!) */}
        <div className="space-y-3 overflow-y-auto pr-1 flex-1 no-scrollbar">
          {addresses.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#7A8E80]">
              <MapPin className="w-8 h-8 mx-auto text-[#A5B5A9] mb-2 stroke-[1.5]" />
              <p className="font-semibold text-[#183324]">No saved addresses</p>
              <p className="text-[11px] text-[#718274] mt-0.5">Add a delivery destination below.</p>
            </div>
          ) : (
            addresses.map((addr) => (
              <SavedAddressCard
                key={addr.id}
                address={addr}
                onSetDefault={handleSetDefault}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteDialog}
                disableDelete={addresses.length <= 1}
              />
            ))
          )}

          {/* Trigger button that opens the DEDICATED SEPARATE CARD MODAL */}
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-[#DED7C9] hover:border-[#183324] hover:bg-[#FAF8F3] text-[#183324] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all mt-2 active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Address</span>
          </button>
        </div>

        {/* Footer */}
        <div className="pt-3.5 border-t border-[#EAE4D7] mt-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-[#183324] hover:bg-[#254632] active:scale-98 text-[#FAF8F3] text-xs font-semibold rounded-xl transition-all shadow-soft-sm"
          >
            Done
          </button>
        </div>
      </div>

      {/* DEDICATED SEPARATE CARD MODAL FOR ADD & EDIT */}
      <AddressFormModal
        isOpen={isFormModalOpen}
        mode={formMode}
        initialAddress={editingAddress}
        onSave={handleSaveAddress}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingAddress(null);
        }}
      />

      {/* DEDICATED DELETE CONFIRMATION DIALOG */}
      <DeleteAddressDialog
        isOpen={isDeleteDialogOpen}
        address={deleteTargetAddress}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeleteTargetAddress(null);
        }}
      />
    </div>
  );
};
