import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, User, MapPin, Building, AlertCircle, Home, Building2, Package, Check, ChevronDown } from 'lucide-react';
import type { CountryCode } from 'libphonenumber-js';
import { SavedAddress, AddressFormData, AddressType, AddressModalMode } from '../../../types/address';
import { createAddressSchema, AddressSchemaType } from '../../../schemas/addressSchema';
import { PhoneInputWithCountry } from '../../common/PhoneInputWithCountry';
import { CountrySelectModal } from '../../common/CountrySelectModal';
import { getCountryByCode, CountryConfig } from '../../../config/countries.config';

interface AddressFormModalProps {
  isOpen: boolean;
  mode: AddressModalMode;
  initialAddress?: SavedAddress | null;
  onSave: (data: AddressFormData, id?: string) => void;
  onClose: () => void;
}

export const AddressFormModal: React.FC<AddressFormModalProps> = ({
  isOpen,
  mode,
  initialAddress,
  onSave,
  onClose,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(
    (initialAddress?.countryCode as CountryCode) || 'FI'
  );
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isExiting, setIsExiting] = useState(false);

  const countryConfig = getCountryByCode(selectedCountry);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressSchemaType>({
    resolver: (values, context, options) => {
      return zodResolver(createAddressSchema(selectedCountry))(values, context, options);
    },
    defaultValues: {
      recipientName: '',
      type: 'home',
      title: '',
      street: '',
      additionalDetails: '',
      postalCode: '',
      city: '',
      countryCode: 'FI',
      phone: '',
      isDefault: false,
    },
    mode: 'onTouched',
  });

  const selectedType = watch('type');
  const phoneValue = watch('phone') || '';
  const isDefaultValue = watch('isDefault');

  // Sync form state when modal opens or initialAddress changes
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setIsExiting(false);

      if (mode === 'edit' && initialAddress) {
        setSelectedCountry((initialAddress.countryCode as CountryCode) || 'FI');
        reset({
          recipientName: initialAddress.recipientName,
          type: initialAddress.type,
          title: initialAddress.title,
          street: initialAddress.street,
          additionalDetails: initialAddress.additionalDetails || '',
          postalCode: initialAddress.postalCode,
          city: initialAddress.city,
          countryCode: initialAddress.countryCode || 'FI',
          phone: initialAddress.phone || '',
          isDefault: initialAddress.isDefault,
        });
      } else {
        setSelectedCountry('FI');
        reset({
          recipientName: '',
          type: 'home',
          title: '',
          street: '',
          additionalDetails: '',
          postalCode: '',
          city: '',
          countryCode: 'FI',
          phone: '',
          isDefault: false,
        });
      }
    } else if (isRendered) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setIsRendered(false);
        setIsExiting(false);
      }, 190);
      return () => clearTimeout(timer);
    }
  }, [isOpen, mode, initialAddress, reset, isRendered]);

  const handleSmoothClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 180);
  };

  const onSubmitForm = (data: AddressSchemaType) => {
    const formData: AddressFormData = {
      recipientName: data.recipientName.trim(),
      type: data.type,
      title: data.title?.trim() || undefined,
      street: data.street.trim(),
      additionalDetails: data.additionalDetails?.trim() || undefined,
      postalCode: data.postalCode.trim(),
      city: data.city.trim(),
      countryCode: selectedCountry,
      phone: data.phone?.trim() || undefined,
      isDefault: Boolean(data.isDefault),
    };

    onSave(formData, initialAddress?.id);
    handleSmoothClose();
  };

  const typeOptions: { type: AddressType; label: string; icon: React.ReactNode }[] = [
    { type: 'home', label: 'Home', icon: <Home className="w-3.5 h-3.5" /> },
    { type: 'work', label: 'Work', icon: <Building2 className="w-3.5 h-3.5" /> },
    { type: 'locker', label: 'Posti Locker', icon: <Package className="w-3.5 h-3.5" /> },
    { type: 'other', label: 'Other', icon: <MapPin className="w-3.5 h-3.5" /> },
  ];

  if (!isRendered && !isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E1D14]/70 backdrop-blur-sm transition-all ${
        isExiting ? 'animate-modal-backdrop-exit' : 'animate-modal-backdrop'
      }`}
      onClick={handleSmoothClose}
    >
      <div
        className={`relative w-full max-w-md bg-[#FBF9F5] border border-[#E8E2D4] rounded-3xl p-6 shadow-2xl text-[#14261B] overflow-hidden max-h-[90vh] flex flex-col ${
          isExiting ? 'animate-modal-card-exit' : 'animate-modal-card'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#D8E6DC]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#EFE3CF]/50 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex justify-between items-center pb-3.5 border-b border-[#EBE6DC] relative z-10 shrink-0">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#937548] uppercase block">
              DELIVERY SPECIFICATION
            </span>
            <h3 className="font-editorial text-2xl font-medium text-[#14261B]">
              {mode === 'edit' ? 'Edit Address' : 'Add New Address'}
            </h3>
            <p className="text-xs text-[#5D6F61] mt-0.5">
              Carbon-neutral Posti delivery to doorstep or parcel locker
            </p>
          </div>
          <button
            type="button"
            onClick={handleSmoothClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-[#EFECE2] hover:bg-[#E2DDD0] active:scale-95 text-[#405445] hover:text-[#183324] flex items-center justify-center transition-all shadow-soft-sm shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Container */}
        <form
          onSubmit={handleSubmit(onSubmitForm)}
          noValidate
          className="overflow-y-auto space-y-3.5 pr-1 py-3.5 flex-1 relative z-10 no-scrollbar"
        >
          {/* Location Type Selector */}
          <div>
            <label className="block text-xs font-bold text-[#183122] mb-1.5">
              Location Type
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {typeOptions.map((opt) => {
                const isSelected = selectedType === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setValue('type', opt.type, { shouldDirty: true })}
                    className={`py-2 px-1.5 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      isSelected
                        ? 'bg-[#183324] text-white border-[#183324] shadow-soft-sm'
                        : 'bg-white/80 hover:bg-white text-[#4A5D4F] border-[#E5DFD2]'
                    }`}
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Full Name / Recipient */}
          <div>
            <label htmlFor="address-recipient" className="block text-xs font-bold text-[#183122] mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#5B7161]" />
              <span>Recipient Full Name <span className="text-rose-500">*</span></span>
            </label>
            <input
              id="address-recipient"
              type="text"
              autoComplete="name"
              placeholder="e.g. Matti Virtanen"
              {...register('recipientName')}
              className={`w-full bg-white rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm text-[#14261B] placeholder:text-[#9AA89E] outline-none transition-all ${
                errors.recipientName
                  ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
                  : 'border-[#DED7C9] focus:border-[#183324] focus:ring-2 focus:ring-[#183324]/10'
              }`}
            />
            {errors.recipientName && (
              <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.recipientName.message}</span>
              </p>
            )}
          </div>

          {/* Street Address */}
          <div>
            <label htmlFor="address-street" className="block text-xs font-bold text-[#183122] mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#5B7161]" />
              <span>Street Address <span className="text-rose-500">*</span></span>
            </label>
            <input
              id="address-street"
              type="text"
              autoComplete="street-address"
              placeholder="e.g. Mannerheimintie 14 B"
              {...register('street')}
              className={`w-full bg-white rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm text-[#14261B] placeholder:text-[#9AA89E] outline-none transition-all ${
                errors.street
                  ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
                  : 'border-[#DED7C9] focus:border-[#183324] focus:ring-2 focus:ring-[#183324]/10'
              }`}
            />
            {errors.street && (
              <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.street.message}</span>
              </p>
            )}
          </div>

          {/* Additional details (Optional) */}
          <div>
            <label htmlFor="address-additional" className="block text-xs font-bold text-[#183122] mb-1.5">
              Apartment, Suite, Stairwell <span className="text-[10px] text-[#718274] font-normal">(Optional)</span>
            </label>
            <input
              id="address-additional"
              type="text"
              placeholder="e.g. Apt 4, 3rd floor / Door code 1234"
              {...register('additionalDetails')}
              className="w-full bg-white rounded-xl border border-[#DED7C9] focus:border-[#183324] focus:ring-2 focus:ring-[#183324]/10 px-3.5 py-2.5 text-xs sm:text-sm text-[#14261B] placeholder:text-[#9AA89E] outline-none transition-all"
            />
          </div>

          {/* Postal Code & City Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="address-postal" className="block text-xs font-bold text-[#183122] mb-1.5">
                Postal Code <span className="text-rose-500">*</span>
              </label>
              <input
                id="address-postal"
                type="text"
                autoComplete="postal-code"
                placeholder={selectedCountry === 'FI' ? 'e.g. 00100' : 'Postal code'}
                maxLength={10}
                {...register('postalCode')}
                className={`w-full bg-white rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm text-[#14261B] placeholder:text-[#9AA89E] outline-none transition-all ${
                  errors.postalCode
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
                    : 'border-[#DED7C9] focus:border-[#183324] focus:ring-2 focus:ring-[#183324]/10'
                }`}
              />
              {errors.postalCode && (
                <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.postalCode.message}</span>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="address-city" className="block text-xs font-bold text-[#183122] mb-1.5">
                City <span className="text-rose-500">*</span>
              </label>
              <input
                id="address-city"
                type="text"
                autoComplete="address-level2"
                placeholder="e.g. Helsinki"
                {...register('city')}
                className={`w-full bg-white rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm text-[#14261B] placeholder:text-[#9AA89E] outline-none transition-all ${
                  errors.city
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
                    : 'border-[#DED7C9] focus:border-[#183324] focus:ring-2 focus:ring-[#183324]/10'
                }`}
              />
              {errors.city && (
                <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.city.message}</span>
                </p>
              )}
            </div>
          </div>

          {/* Country Selector */}
          <div>
            <label className="block text-xs font-bold text-[#183122] mb-1.5">
              Country <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setIsCountryModalOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white border border-[#DED7C9] hover:border-[#183324]/40 rounded-xl text-xs sm:text-sm text-[#14261B] transition-all text-left shadow-soft-sm"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#183324] bg-[#F5F2EB] px-1.5 py-0.5 rounded border border-[#E6E0D2]">
                  {countryConfig.code}
                </span>
                <span className="font-medium text-[#14261B]">{countryConfig.name}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-[#7A8E80]" />
            </button>
          </div>

          {/* Phone Number (Posti Courier Alert Notifications) */}
          <div>
            <PhoneInputWithCountry
              id="address-phone"
              name="phone"
              label="Mobile Phone"
              value={phoneValue}
              onChange={(val) => setValue('phone', val, { shouldValidate: true, shouldDirty: true })}
              selectedCountry={selectedCountry}
              onCountryChange={(c: CountryConfig) => {
                setSelectedCountry(c.code);
                setValue('countryCode', c.code);
              }}
              error={errors.phone?.message}
              helperText="Used for Posti courier arrival SMS & parcel locker PIN codes."
            />
          </div>

          {/* Set as Default Delivery Address Toggle */}
          <div className="pt-1">
            <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/80 border border-[#E5DFD2] cursor-pointer hover:bg-white transition-all select-none">
              <input
                type="checkbox"
                checked={isDefaultValue}
                onChange={(e) => setValue('isDefault', e.target.checked, { shouldDirty: true })}
                className="w-4 h-4 rounded text-[#183324] focus:ring-[#183324] accent-[#183324] cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-[#14261B] block">
                  Set as default delivery address
                </span>
                <span className="text-[11px] text-[#718274]">
                  Use this location automatically for future seasonal drop shipments.
                </span>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-[#183324] hover:bg-[#234531] text-[#FAF8F3] text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60 shadow-sm"
            >
              <Check className="w-3.5 h-3.5 text-[#E5A953]" />
              <span>{mode === 'edit' ? 'Save Changes' : 'Save Address'}</span>
            </button>
            <button
              type="button"
              onClick={handleSmoothClose}
              className="px-4 py-3 bg-[#EFECE2] hover:bg-[#E5E0D3] text-[#293E30] text-xs font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Nested Country Select Modal */}
        <CountrySelectModal
          isOpen={isCountryModalOpen}
          selectedCountry={selectedCountry}
          onSelect={(c) => {
            setSelectedCountry(c.code);
            setValue('countryCode', c.code);
          }}
          onClose={() => setIsCountryModalOpen(false)}
        />
      </div>
    </div>
  );
};
