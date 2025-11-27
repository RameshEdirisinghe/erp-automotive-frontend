import React from "react";
import type { InvoiceData } from "../types/invoice";
import { PaymentMethod, PaymentStatus } from "../types/invoice";

interface InvoiceCanvasProps {
  invoiceData: InvoiceData;
}

const InvoiceCanvas: React.FC<InvoiceCanvasProps> = ({ invoiceData }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const calculateTaxAmount = () => {
    return invoiceData.taxMode === "Tax" ? invoiceData.subTotal * 0.18 : 0;
  };

  const calculateFinalTotal = () => {
    const taxAmount = calculateTaxAmount();
    return invoiceData.subTotal + taxAmount - invoiceData.discount;
  };

  return (
    <div 
      className="bg-white text-gray-800 p-8 shadow-lg mx-auto print:shadow-none print:p-0"
      style={{ 
        width: '210mm', 
        minHeight: '297mm',
        pageBreakInside: 'avoid'
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-8 border-b pb-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">xxxxxxxxx</h2>
          <div className="text-sm text-gray-600">
            <p>No. xx, xxxxxxx,</p>
            <p>xxxxxx</p>
            <p>+xx xxx xxx xxx</p>
            <p>VAT xxxxxxx-xxxx</p>
          </div>
        </div>
        
        {/* Invoice details */}
        <div className="text-right">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{invoiceData.documentType}</h1>
          <div className="text-sm text-gray-600">
            <p><strong>Invoice ID:</strong> {invoiceData.invoiceId}</p>
            <p><strong>Tax Mode:</strong> {invoiceData.taxMode}</p>
          </div>
        </div>
      </div>

      {/* Customer and Invoice Details */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <h3 className="font-semibold mb-1 text-lg">BILL TO:</h3>
          <div className="text-sm p-3">
            <p className="font-medium text-lg">{invoiceData.customer.name}</p>
            <p className="text-gray-600 mt-1">{invoiceData.customer.email}</p>
            <p className="text-gray-600 mt-1">{invoiceData.customer.phone}</p>
            {invoiceData.customer.address && (
              <p className="text-gray-600 mt-1">{invoiceData.customer.address}</p>
            )}
          </div>
        </div>
        
        <div>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="font-semibold">Invoice Date:</span>
              <span>{formatDate(invoiceData.issueDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Due Date:</span>
              <span>{formatDate(invoiceData.dueDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Sales Person:</span>
              <span>{invoiceData.salesPerson || "Probable"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Payment Method:</span>
              <span>{invoiceData.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Payment Status:</span>
              <span className={`font-medium ${
                invoiceData.paymentStatus === PaymentStatus.COMPLETED ? 'text-green-600' :
                invoiceData.paymentStatus === PaymentStatus.REJECTED ? 'text-red-600' :
                'text-yellow-600'
              }`}>
                {invoiceData.paymentStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold">DESCRIPTION</th>
              <th className="border border-gray-300 px-4 py-3 text-center font-semibold">QTY</th>
              <th className="border border-gray-300 px-4 py-3 text-right font-semibold">UNIT PRICE</th>
              <th className="border border-gray-300 px-4 py-3 text-right font-semibold">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.map((item) => (
              <tr key={item.id}>
                <td className="border border-gray-300 px-4 py-3">
                  <div>
                    <p className="font-medium">{item.itemName}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <p className="text-sm text-gray-600">Serial: {item.serialNumber}</p>
                    <p className="text-sm text-gray-600">FQ No: {item.fqNo}</p>
                    {item.additionalDescription && (
                      <p className="text-sm text-gray-600 mt-1">{item.additionalDescription}</p>
                    )}
                  </div>
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center">{item.quantity}</td>
                <td className="border border-gray-300 px-4 py-3 text-right">${item.unitPrice.toFixed(2)}</td>
                <td className="border border-gray-300 px-4 py-3 text-right">${item.total.toFixed(2)}</td>
              </tr>
            ))}
            {invoiceData.items.length === 0 && (
              <tr>
                <td colSpan={4} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                  No items added
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-80">
          <div className="flex justify-between py-2 border-b">
            <span className="font-semibold">Sub Total:</span>
            <span>${invoiceData.subTotal.toFixed(2)}</span>
          </div>
          
          {invoiceData.taxMode === "Tax" && (
            <div className="flex justify-between py-2 border-b">
              <span className="font-semibold">VAT (18%):</span>
              <span>${calculateTaxAmount().toFixed(2)}</span>
            </div>
          )}
          
          {invoiceData.discount > 0 && (
            <div className="flex justify-between py-2 border-b">
              <span className="font-semibold">Discount:</span>
              <span className="text-red-600">-${invoiceData.discount.toFixed(2)}</span>
            </div>
          )}
          
          <div className="flex justify-between py-3 text-lg font-bold border-t-2 border-gray-400">
            <span>Total:</span>
            <span>${calculateFinalTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="mb-8">
        <h3 className="font-semibold mb-2">Terms & Conditions</h3>
        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
          <li>Warranty covers only manufacturer defects.</li>
          <li>Damages due to misuse, power fluctuations, or accidents are not covered.</li>
          <li>Repairs due to such causes will be charged.</li>
          <li>Physical damage and corrosion voids the warranty.</li>
          <li>Good once sold are non-returnable</li>
        </ul>
      </div>

      {/* Bank Details */}
      <div className="mb-8">
        <h3 className="font-semibold mb-2">Bank Details</h3>
        <div className="text-sm text-gray-600">
          <p>Account Name: xxxxxxx</p>
          <p>Bank: xxxxxxx</p>
          <p>Account No: xxxxxxx</p>
          <p>Branch: xxxxxxx</p>
        </div>
      </div>

      {/* Signature */}
      <div className="flex justify-between items-end pt-8">
        <div>
          <p className="font-semibold mb-1">Received</p>
        </div>
        
        <div className="text-right">
          <div className="border-t border-dashed border-gray-400 w-48 mb-2"></div>
          <p className="text-sm text-gray-600">Authorized Signature</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCanvas;