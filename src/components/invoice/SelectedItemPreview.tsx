import React from 'react';
import { AlertCircle } from 'lucide-react';

interface SelectedItemPreviewProps {
  itemName: string;
  unitPrice: number;
  stockWarning: string | null;
  onClearSelection: () => void;
}

export const SelectedItemPreview: React.FC<SelectedItemPreviewProps> = ({
  itemName,
  unitPrice,
  stockWarning,
  onClearSelection,
}) => {
  return (
    <div className="bg-[#0f172a] border border-[#334155] rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-white">Selected Item Details</h4>
        <button
          onClick={onClearSelection}
          className="text-red-400 hover:text-red-300 text-sm transition"
        >
          Clear Selection
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <div className="text-sm text-gray-400 mb-1">Item Name</div>
          <div className="font-medium text-white">{itemName}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400 mb-1">Unit Price</div>
          <div className="font-medium text-green-400">LKR {unitPrice.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400 mb-1">Status</div>
          <div className="font-medium text-blue-400">Ready to Add</div>
        </div>
      </div>
      
      {stockWarning && (
        <div className="mt-3 p-2 bg-yellow-900/30 border border-yellow-700 rounded flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <span className="text-yellow-300 text-sm">{stockWarning}</span>
        </div>
      )}
    </div>
  );
};