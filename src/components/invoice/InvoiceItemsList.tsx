import React from 'react';
import { Trash2 } from 'lucide-react';
import type { InvoiceItem } from '../../types/invoice';
import type { InventoryItem } from '../../types/inventory';

interface InvoiceItemsListProps {
  items: InvoiceItem[];
  inventoryItems: InventoryItem[];
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onUpdateUnitPrice?: (id: string, newPrice: number) => void;
  onRemoveItem: (id: string) => void;
}

export const InvoiceItemsList: React.FC<InvoiceItemsListProps> = ({
  items,
  inventoryItems,
  onUpdateQuantity,
  onUpdateUnitPrice,
  onRemoveItem,
}) => {
  const [editingValues, setEditingValues] = React.useState<Record<string, { quantity?: string; unitPrice?: string }>>({});

  if (items.length === 0) {
    return null;
  }

  const handleQuantityChange = (id: string, value: string) => {
    setEditingValues(prev => ({
      ...prev,
      [id]: { ...prev[id], quantity: value }
    }));

    const num = parseInt(value);
    if (!isNaN(num) && num > 0) {
      onUpdateQuantity(id, num);
    }
  };

  const handleQuantityBlur = (id: string, originalValue: number) => {
    const val = editingValues[id]?.quantity;
    if (val === undefined) return;

    let num = parseInt(val);
    if (isNaN(num) || num <= 0) {
      num = originalValue;
    }

    onUpdateQuantity(id, num);
    setEditingValues(prev => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id].quantity;
        if (Object.keys(next[id]).length === 0) delete next[id];
      }
      return next;
    });
  };

  const handleUnitPriceChange = (id: string, value: string) => {
    setEditingValues(prev => ({
      ...prev,
      [id]: { ...prev[id], unitPrice: value }
    }));

    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      onUpdateUnitPrice?.(id, num);
    }
  };

  const handleUnitPriceBlur = (id: string, originalValue: number) => {
    const val = editingValues[id]?.unitPrice;
    if (val === undefined) return;

    let num = parseFloat(val);
    if (isNaN(num) || num < 0) {
      num = originalValue;
    }

    onUpdateUnitPrice?.(id, num);
    setEditingValues(prev => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id].unitPrice;
        if (Object.keys(next[id]).length === 0) delete next[id];
      }
      return next;
    });
  };

  const subTotal = items.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="bg-[#1e293b] rounded-lg p-6 border border-[#334155]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-200">
          Items List ({items.length} {items.length === 1 ? 'item' : 'items'})
        </h3>
        <div className="text-sm text-gray-400">
          Subtotal: <span className="text-green-400 font-semibold">LKR {subTotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const inventoryItem = inventoryItems.find(inv => inv._id === item.item);
          const totalQuantityInCart = items
            .filter(invItem => invItem.item === item.item)
            .reduce((sum, invItem) => sum + invItem.quantity, 0);

          const hasInsufficientStock = inventoryItem && totalQuantityInCart > inventoryItem.quantity;

          return (
            <div key={item.id} className="bg-[#0f172a] p-4 rounded-lg border border-[#334155]">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-200">
                        {item.itemName || inventoryItem?.product_name || `Item ${item.item.substring(0, 8)}...`}
                      </h4>
                      <div className="text-sm text-gray-400">
                        Code: {inventoryItem?.product_code || item.item.substring(0, 12)}...
                      </div>
                      {inventoryItem && (
                        <div className="text-xs text-gray-500 mt-1">
                          Stock: {inventoryItem.quantity || 0} units
                          {hasInsufficientStock && (
                            <span className="text-red-400 ml-2">(Insufficient stock!)</span>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-red-400 hover:text-red-300 ml-4 transition"
                      title="Remove item"
                      aria-label={`Remove ${item.itemName || 'item'}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-gray-400">
                      <div className="mb-1">Quantity</div>
                      <input
                        type="number"
                        min="1"
                        value={editingValues[item.id]?.quantity ?? item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        onBlur={() => handleQuantityBlur(item.id, item.quantity)}
                        className="w-full bg-[#1e293b] border border-[#334155] rounded px-2 py-1 text-white mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label={`Quantity for ${item.itemName || 'item'}`}
                      />
                    </div>
                    <div className="text-gray-400">
                      <div className="mb-1">Unit Price</div>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editingValues[item.id]?.unitPrice ?? item.unitPrice}
                        onChange={(e) => handleUnitPriceChange(item.id, e.target.value)}
                        onBlur={() => handleUnitPriceBlur(item.id, item.unitPrice)}
                        className="w-full bg-[#1e293b] border border-[#334155] rounded px-2 py-1 text-white mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label={`Unit price for ${item.itemName || 'item'}`}
                      />
                    </div>
                    <div className="text-gray-400">
                      <div className="mb-1">Total</div>
                      <div className="text-green-400 font-semibold mt-2">LKR {item.total.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};