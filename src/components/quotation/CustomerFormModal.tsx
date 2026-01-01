import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import type { Customer } from '../../hooks/useCustomerSearch';

interface CustomerFormData {
  fullName: string;
  email: string;
  phone: string;
  vatNumber: string;
  address: {
    street: string;
    city: string;
    country: string;
    zip: string;
  };
  vehicle_number: string;
  vehicle_model: string;
  year_of_manufacture: number | undefined;
}

interface CustomerFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialData?: Customer;
  prefillData?: Partial<CustomerFormData>;
  onClose: () => void;
  onSubmit: (data: CustomerFormData) => Promise<void>;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  mode,
  initialData,
  prefillData,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CustomerFormData>(() => {
    if (initialData) {
      return {
        fullName: initialData.fullName || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        vatNumber: initialData.vatNumber || '',
        address: {
          street: initialData.address?.street || '',
          city: initialData.address?.city || '',
          country: initialData.address?.country || '',
          zip: initialData.address?.zip || '',
        },
        vehicle_number: initialData.vehicle_number || '',
        vehicle_model: initialData.vehicle_model || '',
        year_of_manufacture: initialData.year_of_manufacture,
      };
    }
    
    return {
      fullName: prefillData?.fullName || '',
      email: prefillData?.email || '',
      phone: prefillData?.phone || '',
      vatNumber: prefillData?.vatNumber || '',
      address: {
        street: prefillData?.address?.street || '',
        city: prefillData?.address?.city || '',
        country: prefillData?.address?.country || '',
        zip: prefillData?.address?.zip || '',
      },
      vehicle_number: prefillData?.vehicle_number || '',
      vehicle_model: prefillData?.vehicle_model || '',
      year_of_manufacture: prefillData?.year_of_manufacture,
    };
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.fullName || !formData.email || !formData.phone || !formData.vatNumber) {
      alert('Please fill in all required customer fields (Name, Email, Phone, VAT Number)');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : `Failed to ${mode} customer`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = <K extends keyof CustomerFormData>(
    field: K,
    value: CustomerFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateAddressField = (field: keyof CustomerFormData['address'], value: string) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f172a] border border-[#334155] rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-white flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            {mode === 'edit' ? 'Edit Customer' : 'Create New Customer'}
          </h4>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name*
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                placeholder="Customer Full Name"
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email*
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="customer@email.com"
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone*
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="10-digit phone number"
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                VAT Number*
              </label>
              <input
                type="text"
                value={formData.vatNumber}
                onChange={(e) => updateField('vatNumber', e.target.value)}
                placeholder="VAT Number"
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Address
            </label>
            <input
              type="text"
              value={formData.address.street}
              onChange={(e) => updateAddressField('street', e.target.value)}
              placeholder="Street Address"
              className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <input
                type="text"
                value={formData.address.city}
                onChange={(e) => updateAddressField('city', e.target.value)}
                placeholder="City"
                className="bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={formData.address.country}
                onChange={(e) => updateAddressField('country', e.target.value)}
                placeholder="Country"
                className="bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={formData.address.zip}
                onChange={(e) => updateAddressField('zip', e.target.value)}
                placeholder="ZIP"
                className="bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Vehicle Number
              </label>
              <input
                type="text"
                value={formData.vehicle_number}
                onChange={(e) => updateField('vehicle_number', e.target.value)}
                placeholder="Vehicle Number"
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Vehicle Model
              </label>
              <input
                type="text"
                value={formData.vehicle_model}
                onChange={(e) => updateField('vehicle_model', e.target.value)}
                placeholder="Vehicle Model"
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Year of Manufacture
              </label>
              <input
                type="number"
                value={formData.year_of_manufacture || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                  updateField('year_of_manufacture', value);
                }}
                placeholder="Year"
                min="1900"
                max={new Date().getFullYear() + 1}
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#334155]">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-300 hover:text-white transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50 min-w-[140px]"
            >
              <UserPlus className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update Customer' : 'Create Customer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
