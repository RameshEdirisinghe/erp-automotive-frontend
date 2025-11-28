import React, { useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { User, FileText, Download, Printer } from "lucide-react";
import InvoiceForm from "../components/InvoiceForm";
import InvoiceCanvas from "../components/InvoiceCanvas";
import type { InvoiceData, InvoiceItem, InvoiceCustomer } from "../types/invoice";
import { PaymentStatus, PaymentMethod } from "../types/invoice";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Invoice: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceId: "INV-" + new Date().toISOString().split('T')[0].replace(/-/g, '') + "-0001",
    customer: {
      name: "",
      email: "",
      phone: "",
      address: ""
    },
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    salesPerson: "",
    documentType: "INVOICE",
    taxMode: "Non-Tax",
    items: [],
    subTotal: 0,
    discount: 0,
    totalAmount: 0,
    paymentStatus: PaymentStatus.PENDING,
    paymentMethod: PaymentMethod.CASH,
    issueDate: new Date().toISOString().split('T')[0],
    bankDepositDate: undefined,
    notes: ""
  });

  const handleAddItem = (item: Omit<InvoiceItem, 'id' | 'total' | 'item'>) => {
    const total = item.quantity * item.unitPrice;
    const newItem = {
      ...item,
      id: Date.now().toString(),
      item: Date.now().toString(), 
      total
    };

    const newItems = [...invoiceData.items, newItem];
    const subTotal = newItems.reduce((sum, item) => sum + item.total, 0);
    const totalAmount = invoiceData.taxMode === "Tax" ? subTotal * 1.18 : subTotal;

    setInvoiceData(prev => ({
      ...prev,
      items: newItems,
      subTotal,
      totalAmount
    }));
  };

  const handleRemoveItem = (id: string) => {
    const newItems = invoiceData.items.filter(item => item.id !== id);
    const subTotal = newItems.reduce((sum, item) => sum + item.total, 0);
    const totalAmount = invoiceData.taxMode === "Tax" ? subTotal * 1.18 : subTotal;

    setInvoiceData(prev => ({
      ...prev,
      items: newItems,
      subTotal,
      totalAmount
    }));
  };

  const handleUpdateItem = (id: string, updates: Partial<InvoiceItem>) => {
    const newItems = invoiceData.items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, ...updates };
        if (updates.quantity !== undefined || updates.unitPrice !== undefined) {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    });

    const subTotal = newItems.reduce((sum, item) => sum + item.total, 0);
    const totalAmount = invoiceData.taxMode === "Tax" ? subTotal * 1.18 : subTotal;

    setInvoiceData(prev => ({
      ...prev,
      items: newItems,
      subTotal,
      totalAmount
    }));
  };

  const handleFieldChange = (field: keyof InvoiceData, value: any) => {
    setInvoiceData(prev => {
      const updated = { ...prev, [field]: value };
      
      if (field === 'taxMode') {
        const totalAmount = value === "Tax" ? prev.subTotal * 1.18 : prev.subTotal;
        return { ...updated, totalAmount };
      }
      
      return updated;
    });
  };

  const handleCustomerChange = (field: keyof InvoiceCustomer, value: string) => {
    setInvoiceData(prev => ({
      ...prev,
      customer: {
        ...prev.customer,
        [field]: value
      }
    }));
  };

  const downloadPDF = async () => {
    if (!invoiceRef.current) return;

    const canvas = await html2canvas(invoiceRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
      width: 794, 
      height: 1123,
      windowWidth: 794,
      windowHeight: 1123
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    pdf.save(`invoice-${invoiceData.invoiceId}.pdf`);
  };

  const handlePrint = () => {
    if (!invoiceRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Popup blocked! Please allow popups for this site to print.");
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoiceData.invoiceId}</title>
          <style>
            body { 
              margin: 0; 
              padding: 0; 
              font-family: Arial, sans-serif;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
            @media print {
              @page {
                size: A4;
                margin: 0;
              }
              body { 
                margin: 0; 
                padding: 0;
                width: 210mm;
                height: 297mm;
              }
            }
          </style>
        </head>
        <body>
          ${invoiceRef.current.innerHTML}
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    };
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-white overflow-hidden">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-16 bg-[#1e293b]/80 backdrop-blur-xl border-b border-[#334155] flex items-center justify-between px-6 shadow-lg">
          <div className="flex items-center gap-3">
            <FileText className="text-blue-400 w-6 h-6" />
            <h1 className="text-xl font-semibold text-gray-200">Invoice Management</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-[#0f172a] border border-[#334155] p-2 rounded-full cursor-pointer hover:bg-[#1e293b] transition">
              <User className="text-gray-200 w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Form */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <InvoiceForm
              invoiceData={invoiceData}
              onFieldChange={handleFieldChange}
              onCustomerChange={handleCustomerChange}
              onAddItem={handleAddItem}
              onRemoveItem={handleRemoveItem}
              onUpdateItem={handleUpdateItem}
            />
          </div>

          {/* Canvas */}
          <div className="w-1/2 bg-white p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Invoice Preview</h2>
              <div className="flex gap-2">
                <button
                  onClick={downloadPDF}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
              </div>
            </div>
            
            <div ref={invoiceRef}>
              <InvoiceCanvas invoiceData={invoiceData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;