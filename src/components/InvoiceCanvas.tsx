import React from "react";
import type { InvoiceData } from "../types/invoice";
import InvoiceTemplate from "../assets/Business invoice Template.jpg";

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
      return dateString.split('T')[0] || "02/05/2025";
    }
  };

  // Calculate tax 
  const calculateTax = () => {
    return invoiceData.subTotal * 0.18;
  };

  const taxAmount = calculateTax();
  const totalAmount = invoiceData.subTotal + taxAmount;

  const getRowColor = (index: number) => {
    return index % 2 === 0 ? '#f5f5f5' : '#ffffff';
  };

  // Company VAT number 
  const companyVatNumber = "VAT123456789";

  return (
    <div className="relative" style={{ width: '210mm', height: '297mm' }}>
      {/* Background Template Image */}
      <img 
        src={InvoiceTemplate} 
        alt="Invoice Template Background"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1
        }}
      />

      {/* Invoice Content Overlay */}
      <div 
        className="relative z-10"
        style={{
          padding: '15mm',
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          color: '#000000',
          fontSize: '12px',
          lineHeight: '1.4',
          fontFamily: 'Arial, sans-serif'
        }}
      >
 
        {/* Customer Name */}
        <div 
          style={{
            position: 'absolute',
            top: '54mm',
            left: '15mm',
            fontSize: '15px',
            fontWeight: 'bold',
            color: '#000000'
          }}
        >
          {invoiceData.customer.name || "Name Surname"}
        </div>

        {/* Customer Details */}
        <div 
          style={{
            position: 'absolute',
            top: '60mm',
            left: '15mm',
            fontSize: '11px',
            color: '#494949ff',
            lineHeight: '1.5'
          }}
        >
          <div>{formatDate(invoiceData.issueDate)}</div>
          <div>{invoiceData.customer.address || "123 Anywhere St., Any City"}</div>
          <div>{invoiceData.customer.email || "hello@realtygreatsite.com"}</div>
          <div>{invoiceData.customer.phone || "+123-456-7890"}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2mm', marginBottom: '1mm' }}>
              <span style={{ fontWeight: '500' }}>VAT Number:</span>
              <span>{invoiceData.customer.vat_number || "N/A"}</span>
            </div>
        </div>


        {/* Invoice Number */}
        <div 
          style={{
            position: 'absolute',
            top: '65mm',
            right: '15mm',
            fontSize: '13px',
            color: '#000000',
            textAlign: 'right'
          }}
        >
          #{invoiceData.invoiceId || "0000000"}
        </div>

        {/* Company VAT Number */}
        <div 
          style={{
            position: 'absolute',
            top: '69mm',
            right: '15mm',
            fontSize: '11px',
            color: '#494949ff',
            textAlign: 'right',
            marginTop: '2mm'
          }}
        >
          VAT: {companyVatNumber}
        </div>



        <div 
          style={{
            position: 'absolute',
            top: '83mm',
            left: '15mm',
            right: '15mm',
            height: '1px',
            backgroundColor: '#000000',
            borderTop: '1px solid #000000'
          }}
        />

        {/* Table Header */}
        <div 
          style={{
            position: 'absolute',
            top: '88mm',
            left: '15mm',
            right: '15mm',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#ffffff',
            display: 'grid',
            gridTemplateColumns: '60% 13% 13% 14%',
            backgroundColor: '#2e2d2dff',
            padding: '3mm 2mm',
            alignItems: 'center'
          }}
        >
          <div style={{ 
            paddingLeft: '2mm', 
            display: 'flex', 
            alignItems: 'center',
            height: '100%'
          }}>
            DESCRIPTION
          </div>
          <div style={{ 
            textAlign: 'center', 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%'
          }}>
            PRICE
          </div>
          <div style={{ 
            textAlign: 'center', 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%'
          }}>
            QTY
          </div>
          <div style={{ 
            textAlign: 'center', 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%'
          }}>
            TOTAL
          </div>
        </div>

        {/* Items List */}
        <div 
          style={{
            position: 'absolute',
            top: '96mm',
            left: '15mm',
            right: '15mm',
            maxHeight: '70mm',
            overflow: 'hidden'
          }}
        >
          {invoiceData.items.length > 0 ? (
            invoiceData.items.map((item, index) => (
              <div 
                key={item.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60% 13% 13% 14%',
                  backgroundColor: getRowColor(index),
                  padding: '3mm 2mm',
                  fontSize: '11px',
                  color: '#000000',
                  borderBottom: index < invoiceData.items.length - 1 ? '1px solid #e0e0e0' : 'none',
                  minHeight: '10mm',
                  alignItems: 'center'
                }}
              >
                <div style={{ 
                  paddingLeft: '2mm', 
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  height: '100%'
                }}>
                  {item.itemName || `ITEM NAME / DESCRIPTION`}
                </div>
                <div style={{ 
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%'
                }}>
                  LKR {item.unitPrice.toFixed(2)}
                </div>
                <div style={{ 
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%'
                }}>
                  {item.quantity}
                </div>
                <div style={{ 
                  textAlign: 'center', 
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%'
                }}>
                  LKR {item.total.toFixed(2)}
                </div>
              </div>
            ))
          ) : (
            
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: '60% 13% 13% 14%',
                backgroundColor: '#f5f5f5',
                padding: '3mm 2mm',
                fontSize: '11px',
                color: '#000000',
                fontStyle: 'italic',
                minHeight: '10mm',
                alignItems: 'center'
              }}
            >
              <div style={{ 
                paddingLeft: '2mm',
                display: 'flex',
                alignItems: 'center',
                height: '100%'
              }}>
                No items added
              </div>
              <div style={{ 
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%'
              }}>
                -
              </div>
              <div style={{ 
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%'
              }}>
                -
              </div>
              <div style={{ 
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%'
              }}>
                -
              </div>
            </div>
          )}
        </div>

        {/* Payment Details Section */}
        <div 
          style={{
            position: 'absolute',
            top: '175mm',
            left: '15mm',
            right: '15mm',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20mm',
            fontSize: '12px',
            color: '#000000'
          }}
        >
          {/* Left Column - Payment Data */}
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '1mm', fontSize: '12px' }}>PAYMENT DATA:</div>
            <div style={{ marginBottom: '1mm' }}>ACCOUNT#: {invoiceData.bankAccount || "12356587965497"}</div>
            <div style={{ marginBottom: '1mm' }}>NAME: {invoiceData.accountName || "YOUR NAME"}</div>
            <div style={{ marginBottom: '1mm' }}>PAYMENT METHOD: {invoiceData.paymentMethod || "DEBIT CARD"}</div>
          </div>
          
          {/* Right Column - Totals */}
          <div style={{ marginTop: '-10mm' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', marginBottom: '2mm', paddingBottom: '1mm' }}>
              <span style={{ fontWeight: 'bold' }}>SUBTOTAL:</span>
              <span style={{ textAlign: 'right', minWidth: '50px' }}>LKR {invoiceData.subTotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', marginBottom: '2mm', paddingBottom: '1mm' }}>
              <span style={{ fontWeight: 'bold' }}>TAX (18%):</span>
              <span style={{ textAlign: 'right', minWidth: '50px' }}>LKR {taxAmount.toFixed(2)}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', marginBottom: '2mm', paddingBottom: '1mm' }}>
              <span style={{ fontWeight: 'bold' }}>DISCOUNT:</span>
              <span style={{ textAlign: 'right', minWidth: '50px' }}>- LKR {invoiceData.discount.toFixed(2)}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', fontWeight: 'bold', fontSize: '14px', marginTop: '3mm' }}>
              <span>TOTAL:</span>
              <span style={{ textAlign: 'right', minWidth: '50px' }}>LKR {totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div 
          style={{
            position: 'absolute',
            top: '201mm',
            left: '15mm',
            right: '15mm',
            height: '1px',
            backgroundColor: '#000000',
            borderTop: '1px solid #000000'
          }}
        />
      
        {/* Terms and Conditions */}
        <div 
          style={{
            position: 'absolute',
            top: '207mm',
            left: '15mm',
            right: '15mm',
            fontSize: '10px',
            color: '#000000',
            lineHeight: '1.3',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20mm'
          }}
        >
          {/* Left Column - Terms and Conditions */}
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '2mm', fontSize: '11px' }}>
              TERMS AND CONDITIONS
            </div>
            <div style={{ marginBottom: '0.5mm' }}>• Warranty covers only manufacturer defects.</div>
            <div style={{ marginBottom: '0.5mm' }}>• Damages due to misuse, power fluctuations, or accidents are not covered.</div>
            <div style={{ marginBottom: '0.5mm' }}>• Repairs due to such causes will be charged.</div>
            <div style={{ marginBottom: '0.5mm' }}>• Physical damage or corrosion voids the warranty.</div>
            <div style={{ marginBottom: '0.5mm' }}>• Goods once sold are non-returnable.</div>
            <div style={{ marginBottom: '0.5mm' }}>• Overdue payments are subject to bank interest rates.</div>
            {invoiceData.notes && (
              <>
                <div style={{ marginTop: '2mm', fontWeight: 'bold' }}>Additional Notes:</div>
                <div style={{ fontStyle: 'italic' }}>{invoiceData.notes}</div>
              </>
            )}
          </div>

          {/* Right Column - Vehicle Details */}
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2mm', marginBottom: '1mm' }}>
              <span style={{ fontWeight: '500' }}>Vehicle Number:</span>
              <span>{invoiceData.customer.vehicle_number || "N/A"}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2mm', marginBottom: '1mm' }}>
              <span style={{ fontWeight: '500' }}>Vehicle Model:</span>
              <span>{invoiceData.customer.vehicle_model || "N/A"}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2mm', marginBottom: '1mm' }}>
              <span style={{ fontWeight: '500' }}>Year of Manufacture:</span>
              <span>{invoiceData.customer.year_of_manufacture || "N/A"}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2mm', marginBottom: '1mm' }}>
              <span style={{ fontWeight: '500' }}>Issue Date:</span>
              <span>{formatDate(invoiceData.issueDate)}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2mm', marginBottom: '1mm' }}>
              <span style={{ fontWeight: '500' }}>Due Date:</span>
              <span>{formatDate(invoiceData.dueDate)}</span>
            </div>
          </div>
        </div>

{/* Date */}
<div 
  style={{
    position: 'absolute',
    top: '253mm', 
    left: '32mm',
    fontSize: '10px',
    color: '#000000',
    fontWeight: 'semibold',
    marginTop: '3mm'
  }}
>
   {formatDate(invoiceData.issueDate)}
</div>
        
      </div>
    </div>
  );
};

export default InvoiceCanvas;