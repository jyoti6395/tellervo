import React, { useState } from 'react';
import { X, Plus, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { addressService } from '@tellervo/supabase';
import { SavedAddress, AddressFormData, AddressModalMode } from '../../types/address';
import { SavedAddressCard } from './addresses/SavedAddressCard';
import { AddressFormModal } from './addresses/AddressFormModal';
import { DeleteAddressDialog } from './addresses/DeleteAddressDialog';

interface AddressesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const getAddressStorageKey = (userId?: string) => `tellervo_addresses_${userId || 'guest'}`;

const loadCachedAddresses = (userId?: string): SavedAddress[] => {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(getAddressStorageKey(userId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
};

const saveCachedAddresses = (userId: string | undefined, list: SavedAddress[]) => {
  if (!userId) return;
  try {
    localStorage.setItem(getAddressStorageKey(userId), JSON.stringify(list));
  } catch {
    // ignore
  }
};

export const AddressesModal: React.FC<AddressesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, authUser, updateUserProfile, showToast } = useApp();
  const currentUserId = authUser?.id || user.handle || 'patron';

  const [addresses, setAddresses] = useState<SavedAddress[]>(() =>
    loadCachedAddresses(currentUserId)
  );
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    const activeUserId = authUser?.id || user.handle || 'patron';
    const cached = loadCachedAddresses(activeUserId);
    if (cached.length > 0) {
      setAddresses(cached);
    }

    async function loadAddresses() {
      if (!authUser?.id) {
        return;
      }
      setIsLoadingAddresses(true);
      const { data, error } = await addressService.fetchAddresses(authUser.id);
      if (isMounted) {
        if (!error && data) {
          const mapped: SavedAddress[] = data.map((rec) => ({
            id: rec.id,
            recipientName: rec.recipient_name,
            phone: rec.phone || undefined,
            type: rec.type,
            title: rec.title || (rec.type === 'home' ? 'Home' : rec.type === 'work' ? 'Work' : 'Delivery Destination'),
            street: rec.street,
            additionalDetails: rec.additional_details || undefined,
            postalCode: rec.postal_code,
            city: rec.city,
            countryCode: rec.country_code,
            isDefault: rec.is_default,
          }));

          if (mapped.length > 0) {
            setAddresses(mapped);
            saveCachedAddresses(authUser.id, mapped);
            const activeDefault = mapped.find((a) => a.isDefault);
            if (activeDefault) {
              const defaultSummary = `${activeDefault.street}, ${activeDefault.postalCode} ${activeDefault.city} (Default)`;
              if (user.address !== defaultSummary) {
                updateUserProfile({ address: defaultSummary });
              }
            }
          } else if (cached.length === 0) {
            setAddresses([]);
          }
        }
        setIsLoadingAddresses(false);
      }
    }

    loadAddresses();

    return () => {
      isMounted = false;
    };
  }, [isOpen, authUser?.id]);

  // Separate Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<AddressModalMode>('add');
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTargetAddress, setDeleteTargetAddress] = useState<SavedAddress | null>(null);

  if (!isOpen) return null;

  const handleSetDefault = async (id: string) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    setAddresses(updated);
    saveCachedAddresses(currentUserId, updated);

    const target = updated.find((a) => a.id === id);
    if (target) {
      const fullAddressStr = `${target.street}, ${target.postalCode} ${target.city} (Default)`;
      updateUserProfile({ address: fullAddressStr });
      showToast(`Default delivery address set to ${target.title || target.street}`);
      if (authUser?.id) {
        await addressService.setDefaultAddress(id, authUser.id);
      }
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

  const handleConfirmDelete = async (id: string) => {
    const target = addresses.find((a) => a.id === id);
    const wasDefault = target?.isDefault;

    const remaining = addresses.filter((a) => a.id !== id);
    if (wasDefault && remaining.length > 0) {
      remaining[0].isDefault = true;
      const newDefault = remaining[0];
      const fullAddressStr = `${newDefault.street}, ${newDefault.postalCode} ${newDefault.city} (Default)`;
      updateUserProfile({ address: fullAddressStr });
      if (authUser?.id) {
        addressService.setDefaultAddress(newDefault.id, authUser.id);
      }
    } else if (remaining.length === 0) {
      updateUserProfile({ address: '' });
    }

    setAddresses(remaining);
    saveCachedAddresses(currentUserId, remaining);

    if (authUser?.id) {
      await addressService.deleteAddress(id, authUser.id);
    }
    showToast('Address removed from saved delivery destinations', 'info');
  };

  const handleSaveAddress = async (formData: AddressFormData, editId?: string) => {
    if (formMode === 'edit' && editId) {
      let updated = addresses.map((item) => {
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

      setAddresses(updated);
      saveCachedAddresses(currentUserId, updated);

      const currentDefault = updated.find((a) => a.isDefault);
      if (currentDefault) {
        const fullAddressStr = `${currentDefault.street}, ${currentDefault.postalCode} ${currentDefault.city} (Default)`;
        updateUserProfile({ address: fullAddressStr });
      }

      showToast('Address updated successfully', 'success');

      if (authUser?.id) {
        await addressService.updateAddress(
          editId,
          {
            recipient_name: formData.recipientName,
            phone: formData.phone,
            type: formData.type,
            title: formData.title,
            street: formData.street,
            additional_details: formData.additionalDetails,
            postal_code: formData.postalCode,
            city: formData.city,
            country_code: formData.countryCode,
            is_default: formData.isDefault,
          },
          authUser.id
        );
      }
    } else {
      // Add Mode
      // Rule: First address automatically becomes default!
      const isFirstAddress = addresses.length === 0;
      const willBeDefault = isFirstAddress || Boolean(formData.isDefault);

      const tempId = `addr-${Date.now()}`;
      const newAddress: SavedAddress = {
        id: tempId,
        recipientName: formData.recipientName,
        type: formData.type,
        title: formData.title || (formData.type === 'home' ? 'Home' : formData.type === 'work' ? 'Workplace' : 'Posti Locker'),
        street: formData.street,
        additionalDetails: formData.additionalDetails,
        postalCode: formData.postalCode,
        city: formData.city,
        countryCode: formData.countryCode,
        phone: formData.phone,
        isDefault: willBeDefault,
      };

      let updated = [...addresses];
      if (willBeDefault) {
        updated = updated.map((a) => ({ ...a, isDefault: false }));
      }
      updated.push(newAddress);

      setAddresses(updated);
      saveCachedAddresses(currentUserId, updated);

      if (willBeDefault) {
        const fullAddressStr = `${newAddress.street}, ${newAddress.postalCode} ${newAddress.city} (Default)`;
        updateUserProfile({ address: fullAddressStr });
      }

      showToast(`Added ${newAddress.title} to saved delivery locations`, 'success');

      if (authUser?.id) {
        const { data: created, error } = await addressService.createAddress(
          {
            recipient_name: formData.recipientName,
            phone: formData.phone,
            type: formData.type,
            title: formData.title,
            street: formData.street,
            additional_details: formData.additionalDetails,
            postal_code: formData.postalCode,
            city: formData.city,
            country_code: formData.countryCode,
            is_default: willBeDefault,
          },
          authUser.id
        );

        if (created && !error) {
          setAddresses((prev) => {
            const synced = prev.map((a) => (a.id === tempId ? { ...a, id: created.id } : a));
            saveCachedAddresses(currentUserId, synced);
            return synced;
          });
        }
      }
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

        {/* Saved Addresses List */}
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
        isFirstAddress={addresses.length === 0}
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
