import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { InventoryItem, VehicleInfo } from "../types/inventory";

interface InventoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: InventoryItem | null;
  isEditing: boolean;
}

const InventoryForm: React.FC<InventoryFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing
}) => {
  const [formData, setFormData] = useState({
    product_name: "",
    product_code: "",
    quantity: 0,
    status: "in_stock" as "in_stock" | "out_of_stock" | "discontinued",
    purchase_price: 0,
    sell_price: 0,
    shipment_code: "",
    vehicle: {
      brand: "",
      model: "",
      chassis_no: "",
      year: new Date().getFullYear()
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData && isEditing) {
      setFormData({
        product_name: initialData.product_name,
        product_code: initialData.product_code,
        quantity: initialData.quantity,
        status: initialData.status,
        purchase_price: initialData.purchase_price,
        sell_price: initialData.sell_price,
        shipment_code: initialData.shipment_code,
        vehicle: { ...initialData.vehicle }
      });
    } else {

      setFormData({
        product_name: "",
        product_code: "",
        quantity: 0,
        status: "in_stock",
        purchase_price: 0,
        sell_price: 0,
        shipment_code: "",
        vehicle: {
          brand: "",
          model: "",
          chassis_no: "",
          year: new Date().getFullYear()
        }
      });
    }
  }, [initialData, isEditing, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleChange = (field: keyof VehicleInfo, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      vehicle: {
        ...prev.vehicle,
        [field]: value
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1e293b] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#334155]">
          <h2 className="text-xl font-semibold text-white">
            {isEditing ? "Edit Inventory Item" : "Add New Inventory Item"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white mb-3">Product Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.product_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, product_name: e.target.value }))}
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Product Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.product_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, product_code: e.target.value }))}
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Status *
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="in_stock">In Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="discontinued">Discontinued</option>
                </select>
              </div>
            </div>

            {/* Pricing & Vehicle Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white mb-3">Pricing & Vehicle</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Purchase Price *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.purchase_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchase_price: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Sell Price *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.sell_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, sell_price: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Shipment Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.shipment_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, shipment_code: e.target.value }))}
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Vehicle Information */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Brand *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.vehicle.brand}
                    onChange={(e) => handleVehicleChange('brand', e.target.value)}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Model *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.vehicle.model}
                    onChange={(e) => handleVehicleChange('model', e.target.value)}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Chassis No *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.vehicle.chassis_no}
                    onChange={(e) => handleVehicleChange('chassis_no', e.target.value)}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Year *
                  </label>
                  <input
                    type="number"
                    required
                    min="1900"
                    max="2100"
                    value={formData.vehicle.year}
                    onChange={(e) => handleVehicleChange('year', parseInt(e.target.value) || new Date().getFullYear())}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#334155]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Saving..." : (isEditing ? "Update Item" : "Create Item")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryForm;