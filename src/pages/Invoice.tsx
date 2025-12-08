import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { User, FileText, Download, Printer, Plus, Save, Menu, X } from "lucide-react";
import InvoiceForm from "../components/InvoiceForm";
import InvoiceCanvas from "../components/InvoiceCanvas";
import type { InvoiceData, InvoiceItem, InvoiceCustomer } from "../types/invoice";
import { PaymentStatus, PaymentMethod } from "../types/invoice";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Invoice: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [activePanel, setActivePanel] = useState<'form' | 'preview'>('form');
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.7);
  const containerRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceId: "",
    customer: {
      name: "",
      email: "",
      phone: "",
      address: "",
      vat_number: "",
      vehicle_number: "",
      vehicle_model: "",
      year_of_manufacture: undefined,
    },
    items: [],
    subTotal: 0,
    discount: 0,
    totalAmount: 0,
    paymentStatus: PaymentStatus.PENDING,
    paymentMethod: PaymentMethod.CASH,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: "",
  });

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobileView(width < 1024); 
      if (width < 1024) {
        setActivePanel('form');
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  
  useEffect(() => {
    const calculateInitialScale = () => {
      if (rightPanelRef.current && !isMobileView) {
        const panelWidth = rightPanelRef.current.clientWidth;
        const panelHeight = rightPanelRef.current.clientHeight;
        const a4Width = 210 * 3.78;
        const a4Height = 297 * 3.78;
        
        const availableWidth = panelWidth - (isMobileView ? 24 : 48);
        const availableHeight = panelHeight - (isMobileView ? 100 : 120);
        
        const widthScale = availableWidth / a4Width;
        const heightScale = availableHeight / a4Height;
        
        const calculatedScale = Math.min(widthScale, heightScale);
        setScale(Math.max(calculatedScale, isMobileView ? 0.2 : 0.3));
      }
    };

    calculateInitialScale();
    const resizeObserver = new ResizeObserver(calculateInitialScale);
    if (rightPanelRef.current) {
      resizeObserver.observe(rightPanelRef.current);
    }
    
    return () => resizeObserver.disconnect();
  }, [isMobileView]);

  // Generate invoice ID
  useEffect(() => {
    const generateNextInvoiceId = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const invoiceId = `INV-${year}${month}${day}-${randomNum}`;
      
      setInvoiceData(prev => ({ ...prev, invoiceId }));
    };

    generateNextInvoiceId();
  }, []);

  const handleAddItem = (item: Omit<InvoiceItem, 'id' | 'total'>) => {
    const total = item.quantity * item.unitPrice;
    const newItem: InvoiceItem = {
      ...item,
      id: Date.now().toString(),
      total
    };

    const newItems = [...invoiceData.items, newItem];
    const subTotal = newItems.reduce((sum, item) => sum + item.total, 0);
    const totalAmount = subTotal - (invoiceData.discount || 0);

    setInvoiceData(prev => ({
      ...prev,
      items: newItems,
      subTotal,
      totalAmount: totalAmount > 0 ? totalAmount : 0
    }));
  };

  const handleRemoveItem = (id: string) => {
    const newItems = invoiceData.items.filter(item => item.id !== id);
    const subTotal = newItems.reduce((sum, item) => sum + item.total, 0);
    const totalAmount = subTotal - (invoiceData.discount || 0);

    setInvoiceData(prev => ({
      ...prev,
      items: newItems,
      subTotal,
      totalAmount: totalAmount > 0 ? totalAmount : 0
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
    const totalAmount = subTotal - (invoiceData.discount || 0);

    setInvoiceData(prev => ({
      ...prev,
      items: newItems,
      subTotal,
      totalAmount: totalAmount > 0 ? totalAmount : 0
    }));
  };

  const handleFieldChange = (field: keyof InvoiceData, value: any) => {
    setInvoiceData(prev => {
      const updated = { ...prev, [field]: value };
      
      if (field === 'discount') {
        const totalAmount = prev.subTotal - (value || 0);
        return { ...updated, totalAmount: totalAmount > 0 ? totalAmount : 0 };
      }
      
      return updated;
    });
  };

  const handleCustomerChange = (field: keyof InvoiceCustomer, value: string | number) => {
    setInvoiceData(prev => ({
      ...prev,
      customer: {
        ...prev.customer,
        [field]: value
      }
    }));
  };

  const handleSaveInvoice = () => {
    if (!invoiceData.customer.name || !invoiceData.customer.email || !invoiceData.customer.phone) {
      alert("Please fill in all required customer fields");
      return;
    }

    if (invoiceData.items.length === 0) {
      alert("Please add at least one item to the invoice");
      return;
    }

    alert('Invoice saved successfully (frontend only)!');
    console.log('Invoice data to save:', invoiceData);
  };

  const downloadPDF = async () => {
    if (!invoiceRef.current) return;

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
        windowWidth: 794,
        windowHeight: 1123
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pageHeight = 297;
      const yOffset = (pageHeight - imgHeight) / 2;

      pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, imgHeight);
      pdf.save(`invoice-${invoiceData.invoiceId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handlePrint = () => {
    if (!invoiceRef.current) return;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert("Popup blocked! Please allow popups for this site to print.");
      return;
    }

    const invoiceContent = invoiceRef.current.innerHTML;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoiceData.invoiceId}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', Arial, sans-serif;
              background: white;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            .invoice-container {
              width: 210mm;
              min-height: 297mm;
              margin: 0 auto;
              padding: 15mm;
              background: white;
              font-size: 12px;
              line-height: 1.4;
              position: relative;
            }
            
            @page {
              size: A4;
              margin: 0;
            }
            
            @media print {
              body {
                margin: 0;
                padding: 0;
                width: 210mm;
                height: 297mm;
              }
              
              .invoice-container {
                margin: 0;
                padding: 15mm;
                width: 210mm;
                min-height: 297mm;
                page-break-inside: avoid;
                break-inside: avoid;
              }
            }
            
            img {
              max-width: 100%;
              height: auto;
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            ${invoiceContent}
          </div>
          <script>
            window.onload = function() {
              window.focus();
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 500);
              }, 250);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-white overflow-hidden">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Responsive Header */}
        <div className="h-16 bg-[#1e293b]/80 backdrop-blur-xl border-b border-[#334155] flex items-center justify-between px-4 md:px-6 shadow-lg">
          <div className="flex items-center gap-3">
            {isMobileView && (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-[#0f172a] transition"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
            <FileText className="text-blue-400 w-5 h-5 md:w-6 md:h-6" />
            <h1 className="text-lg md:text-xl font-semibold text-gray-200">Invoice Management</h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden sm:block text-sm text-gray-300 bg-[#0f172a] px-2 md:px-3 py-1 rounded border border-[#334155]">
              Invoice ID: <span className="font-semibold">{invoiceData.invoiceId || 'Loading...'}</span>
            </div>
            <button
              onClick={handleSaveInvoice}
              className="flex items-center gap-1 md:gap-2 bg-green-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg hover:bg-green-700 transition text-sm md:text-base"
            >
              <Save className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Save</span>
            </button>
            <div className="bg-[#0f172a] border border-[#334155] p-1.5 md:p-2 rounded-full cursor-pointer hover:bg-[#1e293b] transition">
              <User className="text-gray-200 w-4 h-4 md:w-5 md:h-5" />
            </div>
          </div>
        </div>

        {isMobileView && (
          <div className="flex border-b border-[#334155] bg-[#1e293b]">
            <button
              onClick={() => setActivePanel('form')}
              className={`flex-1 py-3 text-center font-medium ${activePanel === 'form' ? 'bg-[#0f172a] text-blue-400' : 'text-gray-300 hover:text-white'}`}
            >
              Form
            </button>
            <button
              onClick={() => setActivePanel('preview')}
              className={`flex-1 py-3 text-center font-medium ${activePanel === 'preview' ? 'bg-[#0f172a] text-blue-400' : 'text-gray-300 hover:text-white'}`}
            >
              Preview
            </button>
          </div>
        )}

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Form */}
          <div className={`${isMobileView 
            ? (activePanel === 'form' ? 'w-full' : 'hidden') 
            : 'w-full lg:w-1/2'} p-3 md:p-4 lg:p-6 overflow-y-auto`}
          >
            <InvoiceForm
              invoiceData={invoiceData}
              onFieldChange={handleFieldChange}
              onCustomerChange={handleCustomerChange}
              onAddItem={handleAddItem}
              onRemoveItem={handleRemoveItem}
              onUpdateItem={handleUpdateItem}
            />
          </div>

          {/* Right Panel - Canvas */}
          <div 
            ref={rightPanelRef}
            className={`${isMobileView 
              ? (activePanel === 'preview' ? 'w-full' : 'hidden') 
              : 'hidden lg:flex lg:w-1/2'} bg-gray-50 border-l border-gray-300 flex flex-col overflow-hidden`}
          >
            {/* Header with controls */}
            <div className="bg-white border-b border-gray-300 p-3 md:p-4 flex-shrink-0">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <h2 className="text-base md:text-lg font-semibold text-gray-800">Invoice Preview</h2>
                <div className="flex items-center justify-end sm:justify-start gap-2">
                  <button
                    onClick={downloadPDF}
                    className="flex items-center gap-1 md:gap-2 bg-blue-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg hover:bg-blue-700 transition text-sm md:text-base"
                  >
                    <Download className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">PDF</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1 md:gap-2 bg-green-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg hover:bg-green-700 transition text-sm md:text-base"
                  >
                    <Printer className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Print</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Canvas Container */}
            <div 
              ref={containerRef}
              className="flex-1 overflow-hidden bg-white flex items-center justify-center p-2 md:p-4"
            >
              <div
                ref={invoiceRef}
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: 'center',
                  width: '210mm',
                  minHeight: '297mm',
                  transition: 'transform 0.15s ease-out',
                  boxShadow: isMobileView 
                    ? '0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)'
                    : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  backgroundColor: 'white'
                }}
              >
                <InvoiceCanvas invoiceData={invoiceData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;