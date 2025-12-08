import React from "react";
import type { InvoiceData } from "../types/invoice";
import PatrolMastersLogo from "../assets/Patrol_Masters_Logo.png"; 

interface InvoiceCanvasProps {
  invoiceData: InvoiceData;
}

const InvoiceCanvas: React.FC<InvoiceCanvasProps> = ({ invoiceData }) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return "DD/MM/YYYY";
    }
  };

  // Calculate tax 
  const calculateTax = () => {
    return invoiceData.subTotal * 0.18;
  };

  const taxAmount = calculateTax();
  const totalAmount = invoiceData.subTotal + taxAmount;

  return (
    <div 
      className="bg-white text-gray-800 mx-auto font-sans relative"
      style={{ 
        width: '210mm',
        minHeight: '297mm',
        padding: '15mm',
        fontSize: '12px',
        lineHeight: '1.4',
        boxSizing: 'border-box',
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact'
      }}
    >
      {/* Logo */}
      <div className="absolute top-4 left-4">
        <img 
          src={PatrolMastersLogo} 
          alt="Patrol Masters Automotive Logo"
          style={{
            height: '60px',
            width: 'auto',
            maxWidth: '150px'
          }}
        />
      </div>

      {/* Header Section */}
      <div className="text-center mb-8 pt-8">
        <h1 className="text-3xl font-bold mb-2 tracking-wider" style={{ fontSize: '28px' }}>
          PATROL MASTERS AUTOMOTIVE
        </h1>
        <div className="text-sm mb-4" style={{ fontSize: '11px' }}>
          <p>123 Anywhere St., Any City</p>
          <p>hello@realtygreatsite.com | +123-456-7890</p>
        </div>
      </div>

      {/* Invoice Header with Details */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="font-bold text-lg mb-1" style={{ fontSize: '16px' }}>
            {invoiceData.customer.name || "Name Surname"}
          </h2>
          <div className="text-sm space-y-0.5" style={{ fontSize: '11px' }}>
            <p>{formatDate(invoiceData.issueDate)}</p>
            <p>123 Anywhere St., Any City</p>
            <p>hello@realtygreatsite.com</p>
            <p>+123-456-7890</p>
          </div>
        </div>
        
        <div className="text-right">
          <h1 className="text-2xl font-bold mb-2" style={{ fontSize: '24px' }}>
            INVOICE #{invoiceData.invoiceId || "0000000"}
          </h1>
        </div>
      </div>

      {/* Divider Line */}
      <div className="border-t border-black my-4"></div>

      {/* Items Table Header */}
      <div className="mb-2">
        <div className="grid grid-cols-4 gap-4 font-bold text-sm mb-2" style={{ fontSize: '11px' }}>
          <div className="col-span-2">
            <h3 className="uppercase">DESCRIPTION</h3>
          </div>
          <div className="text-center">
            <h3 className="uppercase">PRICE</h3>
          </div>
          <div className="text-center">
            <h3 className="uppercase">QTY</h3>
          </div>
          
        </div>
        
        {/* Divider Line */}
        <div className="border-t border-black"></div>
      </div>

      {/* Items List */}
      <div className="mb-4">
        {invoiceData.items.length > 0 ? (
          invoiceData.items.map((item, index) => (
            <div key={item.id} className="mb-2">
              <div className="grid grid-cols-4 gap-4 py-1 text-sm" style={{ fontSize: '11px' }}>
                <div className="col-span-2">
                  <div className="font-medium">{item.itemName || `Item ${index + 1}`}</div>
                  {item.description && (
                    <div className="text-gray-600 text-xs mt-0.5">{item.description}</div>
                  )}
                </div>
                <div className="text-center">
                  ${item.unitPrice.toFixed(2)}
                </div>
                <div className="text-center">
                  {item.quantity}
                </div>
                <div className="text-center">
                  ${item.total.toFixed(2)}
                </div>
              </div>
              {index < invoiceData.items.length - 1 && (
                <div className="border-t border-gray-300 my-1"></div>
              )}
            </div>
          ))
        ) : (
          
          <div className="py-8 text-center text-gray-500 text-sm">
            No items added to invoice
          </div>
        )}
      </div>

      {/* Divider Line */}
      <div className="border-t border-black my-4"></div>

      {/* Payment Details Section */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-8">
          {/* Left Column - Payment Data */}
          <div>
            <h3 className="font-bold uppercase text-sm mb-2" style={{ fontSize: '11px' }}>
              PAYMENT DATA:
            </h3>
            <div className="text-sm space-y-1" style={{ fontSize: '11px' }}>
              <p>ACCOUNT#: 12356587965497</p>
              <p>NAME: YOUR NAME</p>
              <p>PAYMENT METHOD: {invoiceData.paymentMethod}</p>
            </div>
          </div>
          
          {/* Right Column - Totals */}
          <div>
            <div className="text-sm space-y-2" style={{ fontSize: '11px' }}>
              <div className="flex justify-between">
                <span className="font-bold">SUBTOTAL:</span>
                <span>${invoiceData.subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">TAX:</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base" style={{ fontSize: '13px' }}>
                <span>TOTAL:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider Line */}
      <div className="border-t border-black my-4"></div>

      {/* Terms and Conditions Section */}
      <div className="mb-6">
        <h3 className="font-bold uppercase text-sm mb-2" style={{ fontSize: '11px' }}>
          TERMS AND CONDITIONS
        </h3>
        <ul className="text-sm space-y-1 list-none pl-0" style={{ fontSize: '11px' }}>
          <li>• Warranty covers only manufacturer defects.</li>
          <li>• Damages due to misuse, power fluctuations, or accidents are not covered.</li>
          <li>• Repairs due to such causes will be charged.</li>
          <li>• Physical damage or corrosion voids the warranty.</li>
          <li>• Goods once sold are non-returnable.</li>
          <li>• Overdue payments are subject to bank interest rates.</li>
        </ul>
      </div>

      {/* Divider Line */}
      <div className="border-t border-black my-4"></div>

      {/* Footer Section */}
      <div className="text-center">
        <div className="mb-4">
          <div className="flex justify-between text-sm" style={{ fontSize: '11px' }}>
            <div className="text-left">
              <p className="font-bold">Date</p>
              <p>{formatDate(new Date().toISOString().split('T')[0])}</p>
            </div>
            <div className="text-center">
              <p className="font-bold">Authorized Signature</p>
              <div style={{ height: '40px', marginTop: '10px' }}></div>
            </div>
            <div className="text-right">
              <p>+123-456-7890</p>
              <p>hello@realtygreatsite.com</p>
              <p>www.realtygreatsite.com</p>
            </div>
          </div>
        </div>
        
        <div className="text-xs mt-8" style={{ fontSize: '10px' }}>
          <p>123 Anywhere St., Any City, ST 12345</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCanvas;