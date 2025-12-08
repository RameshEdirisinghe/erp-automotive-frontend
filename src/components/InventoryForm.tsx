import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { InventoryItem, VehicleInfo } from "../types/inventory";

interface InventoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => Promise<void>;
  initialData?: InventoryItem | null;
  isEditing: boolean;
  viewMode?: boolean;
}

const InventoryForm: React.FC<InventoryFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing,
  viewMode = false
}) => {
  const [formData, setFormData] = useState({
    product_name: "",
    product_code: "",
    quantity: "",
    sold_count: "",
    discount_rate: "",
    status: "in_stock" as "in_stock" | "out_of_stock" | "discontinued",
    purchase_price: "",
    sell_price: "",
    shipment_code: "",
    vehicle: {
      brand: "",
      model: "",
      chassis_no: "",
      year: new Date().getFullYear().toString()
    }
  });

  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        product_name: initialData.product_name,
        product_code: initialData.product_code,
        quantity: initialData.quantity.toString(),
        sold_count: initialData.sold_count.toString(),
        discount_rate: (initialData.discount_rate ?? 0).toString(),
        status: initialData.status,
        purchase_price: initialData.purchase_price.toString(),
        sell_price: initialData.sell_price.toString(),
        shipment_code: initialData.shipment_code,
        vehicle: { ...initialData.vehicle, year: initialData.vehicle.year.toString() }
      });

      if (initialData.updated_at) {
        setUpdatedAt(
          new Date(initialData.updated_at).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short"
          })
        );
      }
    } else {
      setFormData({
        product_name: "",
        product_code: "",
        quantity: "",
        sold_count: "",
        discount_rate: "",
        status: "in_stock",
        purchase_price: "",
        sell_price: "",
        shipment_code: "",
        vehicle: {
          brand: "",
          model: "",
          chassis_no: "",
          year: new Date().getFullYear().toString()
        }
      });
      setUpdatedAt(null);
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (viewMode) {
      onClose();
      return;
    }
    if (!onSubmit) return;
    setLoading(true);
    try {
      const payload = {
        ...formData,
        quantity: parseInt(formData.quantity) || 0,
        sold_count: parseInt(formData.sold_count) || 0,
        discount_rate: parseFloat(formData.discount_rate) || 0,
        purchase_price: parseFloat(formData.purchase_price) || 0,
        sell_price: parseFloat(formData.sell_price) || 0,
        actual_sold_price:
          parseFloat(formData.sell_price || "0") *
          (1 - (parseFloat(formData.discount_rate || "0") / 100)),
        vehicle: {
          ...formData.vehicle,
          year: parseInt(formData.vehicle.year) || new Date().getFullYear()
        }
      };
      await onSubmit(payload);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleChange = (field: keyof VehicleInfo, value: string) => {
    if (viewMode) return;
    setFormData(prev => ({
      ...prev,
      vehicle: {
        ...prev.vehicle,
        [field]: value
      }
    }));
  };

  if (!isOpen) return null;

  const getTitle = () => {
    if (viewMode) return "View Inventory Item Details";
    if (isEditing) return "Edit Inventory Item";
    return "Add New Inventory Item";
  };

  const numberInputClass = (readOnly: boolean) =>
    `w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${readOnly ? "cursor-not-allowed opacity-70" : ""}`;

  const calculateActualSoldPrice = () => {
    const sell = parseFloat(formData.sell_price || "0");
    const discount = parseFloat(formData.discount_rate || "0");
    return (sell * (1 - discount / 100)).toFixed(2);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1e293b] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-[#334155]">
          <h2 className="text-xl font-semibold text-white">{getTitle()}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Product Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={formData.product_name}
                    onChange={(e) =>
                      !viewMode &&
                      setFormData((prev) => ({ ...prev, product_name: e.target.value }))
                    }
                    readOnly={viewMode}
                    className={`w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white ${viewMode ? "cursor-not-allowed opacity-70" : ""
                      }`}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">Product Code</label>
                  <input
                    type="text"
                    value={formData.product_code}
                    onChange={(e) =>
                      !viewMode &&
                      setFormData((prev) => ({ ...prev, product_code: e.target.value }))
                    }
                    readOnly={viewMode}
                    className={`w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white ${viewMode ? "cursor-not-allowed opacity-70" : ""
                      }`}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">In Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) =>
                      !viewMode && setFormData((prev) => ({ ...prev, quantity: e.target.value }))
                    }
                    readOnly={viewMode}
                    className={numberInputClass(viewMode)}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">Sold Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.sold_count}
                    onChange={(e) =>
                      !viewMode &&
                      setFormData((prev) => ({ ...prev, sold_count: e.target.value }))
                    }
                    readOnly={viewMode}
                    className={numberInputClass(viewMode)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Discount Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.discount_rate}
                      onChange={(e) =>
                        !viewMode &&
                        setFormData((prev) => ({ ...prev, discount_rate: e.target.value }))
                      }
                      readOnly={viewMode}
                      className={numberInputClass(viewMode)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        !viewMode &&
                        setFormData((prev) => ({
                          ...prev,
                          status: e.target.value as any,
                        }))
                      }
                      disabled={viewMode}
                      className={numberInputClass(viewMode)}
                    >
                      <option value="in_stock">In Stock</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="discontinued">Discontinued</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing & Vehicle */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Pricing & Vehicle</h3>
              <div className="space-y-4">
                {/* Purchase Price, Sell Price */}
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Purchase Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.purchase_price}
                    onChange={(e) =>
                      !viewMode && setFormData(prev => ({ ...prev, purchase_price: e.target.value }))
                    }
                    readOnly={viewMode}
                    className={numberInputClass(viewMode)}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">Sell Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.sell_price}
                    onChange={(e) =>
                      !viewMode && setFormData(prev => ({ ...prev, sell_price: e.target.value }))
                    }
                    readOnly={viewMode}
                    className={numberInputClass(viewMode)}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">Shipment Code</label>
                  <input
                    type="text"
                    value={formData.shipment_code}
                    onChange={(e) =>
                      !viewMode &&
                      setFormData((prev) => ({ ...prev, shipment_code: e.target.value }))
                    }
                    readOnly={viewMode}
                    className={numberInputClass(viewMode)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Brand</label>
                    <input
                      type="text"
                      value={formData.vehicle.brand}
                      onChange={(e) => handleVehicleChange("brand", e.target.value)}
                      readOnly={viewMode}
                      className={numberInputClass(viewMode)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Model</label>
                    <input
                      type="text"
                      value={formData.vehicle.model}
                      onChange={(e) => handleVehicleChange("model", e.target.value)}
                      readOnly={viewMode}
                      className={numberInputClass(viewMode)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Chassis No</label>
                    <input
                      type="text"
                      value={formData.vehicle.chassis_no}
                      onChange={(e) => handleVehicleChange("chassis_no", e.target.value)}
                      readOnly={viewMode}
                      className={numberInputClass(viewMode)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Year</label>
                    <input
                      type="number"
                      min="1900"
                      max="2100"
                      value={formData.vehicle.year}
                      onChange={(e) => handleVehicleChange("year", e.target.value)}
                      readOnly={viewMode}
                      className={numberInputClass(viewMode)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-[#334155]">
            <p className="text-sm text-gray-400">
              {updatedAt && (
                <>
                  <span className="text-xs text-gray-400">Last Updated At:</span> <br />
                  <span className="text-sm text-white">{updatedAt}</span>
                </>
              )}
            </p>

            <p className="text-sm text-gray-400">
              <span className="text-xs text-gray-400">Actual Sold Price:</span> <br />
              <span className="text-lg font-bold text-green-400">{calculateActualSoldPrice()}</span>
            </p>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                {viewMode ? "Close" : "Cancel"}
              </button>

              {!viewMode && (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Saving..." : isEditing ? "Update Item" : "Create Item"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryForm;
