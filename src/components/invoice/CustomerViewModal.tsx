import React from 'react';
import { X, Eye } from 'lucide-react';

interface Customer {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  vatNumber: string;
  address?: {
    street?: string;
    city?: string;
    country?: string;
    zip?: string;
  };
  vehicle_number?: string;
  vehicle_model?: string;
  year_of_manufacture?: number;
  customerCode?: string;
}

interface CustomerViewModalProps {
  customer: Customer;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export const CustomerViewModal: React.FC<CustomerViewModalProps> = ({
  customer,
  isOpen,
  onClose,
  onEdit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f172a] border border-[#334155] rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Customer Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-400">Full Name</div>
              <div className="text-white font-medium">{customer.fullName}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Email</div>
              <div className="text-white font-medium">{customer.email}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-400">Phone</div>
              <div className="text-white font-medium">{customer.phone}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">VAT Number</div>
              <div className="text-white font-medium">{customer.vatNumber}</div>
            </div>
          </div>
          
          {customer.address && (
            <div>
              <div className="text-sm text-gray-400 mb-1">Address</div>
              <div className="text-white">
                {customer.address.street && <div>{customer.address.street}</div>}
                <div>
                  {customer.address.city && `${customer.address.city}, `}
                  {customer.address.country && `${customer.address.country} `}
                  {customer.address.zip && customer.address.zip}
                </div>
              </div>
            </div>
          )}
          
          {(customer.vehicle_number || customer.vehicle_model || customer.year_of_manufacture) && (
            <div>
              <div className="text-sm text-gray-400 mb-1">Vehicle Details</div>
              <div className="text-white">
                {customer.vehicle_number && <div>Number: {customer.vehicle_number}</div>}
                {customer.vehicle_model && <div>Model: {customer.vehicle_model}</div>}
                {customer.year_of_manufacture && <div>Year: {customer.year_of_manufacture}</div>}
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-4 border-t border-[#334155]">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              <Eye className="w-4 h-4" />
              Edit Customer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};