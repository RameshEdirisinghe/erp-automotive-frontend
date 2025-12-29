import React from 'react';
import { Trash2 } from 'lucide-react';
import type { QuotationItem } from '../../types/quotation';
import type { InventoryItem } from '../../types/inventory';

interface QuotationItemsListProps {
  items: QuotationItem[];
  inventoryItems: InventoryItem[];
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onRemoveItem: (id: string) => void;
}

export const QuotationItemsList: React.FC<QuotationItemsListProps> = ({
  items,
  inventoryItems,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  if (items.length === 0) {
    return null;
  }

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
                        value={item.quantity}
                        onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                        className="w-full bg-[#1e293b] border border-[#334155] rounded px-2 py-1 text-white mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label={`Quantity for ${item.itemName || 'item'}`}
                      />
                    </div>
                    <div className="text-gray-400">
                      <div className="mb-1">Unit Price</div>
                      <div className="text-white font-medium">LKR {item.unitPrice.toFixed(2)}</div>
                    </div>
                    <div className="text-gray-400">
                      <div className="mb-1">Total</div>
                      <div className="text-green-400 font-semibold">LKR {item.total.toFixed(2)}</div>
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
