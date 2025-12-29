import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { User, FileText, Download, Printer, Menu, X, Save } from "lucide-react";
import QuotationForm from "../components/QuotationForm";
import QuotationCanvas from "../components/QuotationCanvas";
import type { 
  QuotationData, 
  QuotationItem
} from "../types/quotation";
import type { InventoryItem as QuotationInventoryItem } from "../types/inventory";
import { PaymentMethod } from "../types/invoice";
import { QuotationStatus } from "../types/quotation";
import { quotationService } from "../services/QuotationService";
import { inventoryService } from "../services/InventoryService";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import CustomAlert from "../components/CustomAlert";
import type { AlertType } from "../components/CustomAlert";
import ErrorBoundary from "../components/ErrorBoundary";

const Quotation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [activePanel, setActivePanel] = useState<'form' | 'preview'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: AlertType; message: string } | null>(null);
  const [inventoryItems, setInventoryItems] = useState<QuotationInventoryItem[]>([]);
  const quotationRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.7);
  const containerRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  const [quotationData, setQuotationData] = useState<QuotationData>({
    quotationId: "",
    customer: "",
    customerDetails: undefined,
    items: [],
    subTotal: 0,
    discount: 0,
    discountPercentage: 0,
    totalAmount: 0,
    paymentMethod: PaymentMethod.CASH,
    status: QuotationStatus.PENDING,
    issueDate: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        const items = await inventoryService.getAll();
        setInventoryItems(items as QuotationInventoryItem[]);
        
        const nextId = await quotationService.getNextId();
        setQuotationData(prev => ({ ...prev, quotationId: nextId }));
        
      } catch (error) {
        console.error('Error loading data:', error);
        setAlert({
          type: 'error',
          message: error instanceof Error ? error.message : 'Failed to load data'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddItem = (item: Omit<QuotationItem, 'id' | 'total'>) => {
    const total = item.quantity * item.unitPrice;
    
    const existingItemIndex = quotationData.items.findIndex(
      existing => existing.item === item.item
    );

    let newItems;
    
    if (existingItemIndex !== -1) {
      newItems = [...quotationData.items];
      const existingItem = newItems[existingItemIndex];
      const updatedItem = {
        ...existingItem,
        quantity: existingItem.quantity + item.quantity,
        total: (existingItem.quantity + item.quantity) * existingItem.unitPrice
      };
      newItems[existingItemIndex] = updatedItem;
    } else {
      // Add new item
      const newItem: QuotationItem = {
        ...item,
        id: Date.now().toString(),
        total
      };
      newItems = [...quotationData.items, newItem];
    }

    const subTotal = newItems.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = subTotal * (quotationData.discountPercentage / 100);
    const totalAmount = subTotal - discountAmount;

    setQuotationData(prev => ({
      ...prev,
      items: newItems,
      subTotal,
      discount: discountAmount,
      totalAmount: totalAmount > 0 ? totalAmount : 0
    }));
  };

  const handleRemoveItem = (id: string) => {
    const newItems = quotationData.items.filter(item => item.id !== id);
    const subTotal = newItems.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = subTotal * (quotationData.discountPercentage / 100);
    const totalAmount = subTotal - discountAmount;

    setQuotationData(prev => ({
      ...prev,
      items: newItems,
      subTotal,
      discount: discountAmount,
      totalAmount: totalAmount > 0 ? totalAmount : 0
    }));
  };

  const handleUpdateItem = (id: string, updates: Partial<QuotationItem>) => {
    const newItems = quotationData.items.map(item => {
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
    const discountAmount = subTotal * (quotationData.discountPercentage / 100);
    const totalAmount = subTotal - discountAmount;

    setQuotationData(prev => ({
      ...prev,
      items: newItems,
      subTotal,
      discount: discountAmount,
      totalAmount: totalAmount > 0 ? totalAmount : 0
    }));
  };

  const handleFieldChange = (field: keyof QuotationData, value: string | number | boolean | Date) => {
    setQuotationData(prev => {
      const updated = { ...prev, [field]: value };
      
      if (field === 'discountPercentage') {
        const discountAmount = prev.subTotal * (Number(value) / 100);
        const totalAmount = prev.subTotal - discountAmount;
        return { 
          ...updated, 
          discount: discountAmount,
          totalAmount: totalAmount > 0 ? totalAmount : 0 
        };
      }
      
      return updated;
    });
  };

  const handleCustomerIdChange = (customerId: string, customerDetails?: any) => {
    setQuotationData(prev => ({
      ...prev,
      customer: customerId,
      customerDetails: customerDetails
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setAlert({
        type: 'info',
        message: 'Saving quotation...'
      });

      // Prepare data for backend
      const backendData = {
        quotationId: quotationData.quotationId,
        customer: quotationData.customer,
        items: quotationData.items.map(item => ({
          item: item.item,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total
        })),
        subTotal: quotationData.subTotal,
        discount: quotationData.discount,
        totalAmount: quotationData.totalAmount,
        paymentMethod: quotationData.paymentMethod,
        issueDate: quotationData.issueDate,
        validUntil: quotationData.validUntil,
        status: quotationData.status,
        notes: quotationData.notes
      };

      const response = await quotationService.create(backendData);
      
      // Update quotationData with the returned _id
      setQuotationData(prev => ({
        ...prev,
        _id: response._id
      }));

      setAlert({
        type: 'success',
        message: 'Quotation saved successfully!'
      });

      return true;
    } catch (error) {
      console.error('Error saving quotation:', error);
      setAlert({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to save quotation'
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const downloadPDF = async () => {
    if (!quotationRef.current) {
      setAlert({
        type: 'error',
        message: "Quotation content not available for PDF generation."
      });
      return;
    }

    // Check if quotation is saved
    if (!quotationData._id) {
      const shouldSave = window.confirm(
        "This quotation has not been saved yet. Do you want to save it now and then download?"
      );
      
      if (shouldSave) {
        const saved = await handleSave();
        if (!saved) {
          return; // Abort if save failed
        }
      } else if (shouldSave === null) {
        return; // User cancelled
      }
      // If shouldSave is false, proceed without saving
    }

    try {
      setIsGeneratingPDF(true);
      setAlert({
        type: 'info',
        message: 'Generating PDF... Please wait.'
      });

      const quotationContainer = quotationRef.current;
      
      const originalTransform = quotationContainer.style.transform;
      const originalTransformOrigin = quotationContainer.style.transformOrigin;
      const originalWidth = quotationContainer.style.width;
      const originalHeight = quotationContainer.style.height;
      
      quotationContainer.style.transform = 'none';
      quotationContainer.style.transformOrigin = 'top left';
      quotationContainer.style.width = '210mm';
      quotationContainer.style.height = '297mm';
      quotationContainer.style.position = 'fixed';
      quotationContainer.style.left = '0';
      quotationContainer.style.top = '0';
      quotationContainer.style.zIndex = '9999';
      
      void quotationContainer.offsetHeight;

      const images = quotationContainer.getElementsByTagName('img');
      const imageLoadPromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      });

      await Promise.all(imageLoadPromises);
      
      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(quotationContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
        onclone: (clonedDoc: Document) => {
          const clonedContainer = clonedDoc.querySelector('[data-quotation-container]');
          if (clonedContainer) {
            (clonedContainer as HTMLElement).style.transform = 'none';
            (clonedContainer as HTMLElement).style.transformOrigin = 'top left';
            (clonedContainer as HTMLElement).style.width = '210mm';
            (clonedContainer as HTMLElement).style.height = '297mm';
          }
        }
      });

      quotationContainer.style.transform = originalTransform;
      quotationContainer.style.transformOrigin = originalTransformOrigin;
      quotationContainer.style.width = originalWidth;
      quotationContainer.style.height = originalHeight;
      quotationContainer.style.position = '';
      quotationContainer.style.left = '';
      quotationContainer.style.top = '';
      quotationContainer.style.zIndex = '';

      // Convert canvas to JPEG image
      const jpegData = canvas.toDataURL('image/jpeg', 1.0);
      
      // Create PDF with A4 dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = 210;
      const pdfHeight = 297;
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      const finalHeight = imgHeight > pdfHeight ? pdfHeight : imgHeight;
      
      const xPos = 0;
      const yPos = 0;

      // Add JPEG image to PDF
      pdf.addImage(jpegData, 'JPEG', xPos, yPos, imgWidth, finalHeight);
      
      // Save the PDF
      pdf.save(`quotation-${quotationData.quotationId}.pdf`);

      setAlert({
        type: 'success',
        message: 'PDF downloaded successfully!'
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      setAlert({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to generate PDF. Please try again.'
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrint = async () => {
    if (!quotationRef.current) return;

    // Check if quotation is saved
    if (!quotationData._id) {
      const shouldSave = window.confirm(
        "This quotation has not been saved yet. Do you want to save it now and then print?"
      );
      
      if (shouldSave) {
        const saved = await handleSave();
        if (!saved) {
          return; // Abort if save failed
        }
      } else if (shouldSave === null) {
        return; // User cancelled
      }
      // If shouldSave is false, proceed without saving
    }

    try {
      setIsGeneratingPDF(true);
      setAlert({
        type: 'info',
        message: 'Preparing print... Please wait.'
      });

      const canvas = await html2canvas(quotationRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
        onclone: (clonedDoc: Document) => {
          const clonedContainer = clonedDoc.querySelector('[data-quotation-container]');
          if (clonedContainer) {
            (clonedContainer as HTMLElement).style.transform = 'none';
            (clonedContainer as HTMLElement).style.transformOrigin = 'top left';
            (clonedContainer as HTMLElement).style.width = '210mm';
            (clonedContainer as HTMLElement).style.height = '297mm';
          }
        }
      });

      // Convert canvas to data URL
      const imageData = canvas.toDataURL('image/png', 1.0);

      // Create print window
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        setAlert({
          type: 'error',
          message: "Popup blocked! Please allow popups for this site to print."
        });
        setIsGeneratingPDF(false);
        return;
      }

      // Create HTML for printing
      const printHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Quotation ${quotationData.quotationId}</title>
            <style>
              @page {
                size: A4 portrait;
                margin: 0;
              }
              
              body {
                margin: 0;
                padding: 0;
                width: 210mm;
                height: 297mm;
              }
              
              .print-container {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              
              .quotation-image {
                width: 210mm;
                height: 297mm;
                object-fit: contain;
              }
              
              @media print {
                body {
                  margin: 0 !important;
                  padding: 0 !important;
                }
                
                .print-container {
                  page-break-inside: avoid;
                  page-break-after: avoid;
                }
                
                .quotation-image {
                  page-break-inside: avoid;
                }
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              <img src="${imageData}" alt="Quotation ${quotationData.quotationId}" class="quotation-image" />
            </div>
            <script>
              // Wait for image to load then print
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  // Close window after print dialog closes
                  setTimeout(function() {
                    window.close();
                  }, 1000);
                }, 500);
              };
              
              // Fallback if window.onload doesn't fire
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 1000);
              }, 2000);
            </script>
          </body>
        </html>
      `;

      // Write to print window
      printWindow.document.open();
      printWindow.document.write(printHtml);
      printWindow.document.close();
      
      // Focus the window
      printWindow.focus();

      setIsGeneratingPDF(false);
      
    } catch (error) {
      console.error('Error preparing print:', error);
      setAlert({
        type: 'error',
        message: 'Failed to prepare print. Please try again.'
      });
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-white overflow-hidden">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Alert */}
        {alert && (
          <CustomAlert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
            duration={3000}
          />
        )}

        {/* Header */}
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
            <h1 className="text-lg md:text-xl font-semibold text-gray-200">Quotation Management</h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden sm:block text-sm text-gray-300 bg-[#0f172a] px-2 md:px-3 py-1 rounded border border-[#334155]">
              Quotation ID: <span className="font-semibold">{quotationData.quotationId || 'Loading...'}</span>
            </div>
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
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <ErrorBoundary>
                <QuotationForm
                  quotationData={quotationData}
                  onFieldChange={handleFieldChange}
                  onCustomerIdChange={handleCustomerIdChange}
                  onAddItem={handleAddItem}
                  onRemoveItem={handleRemoveItem}
                  onUpdateItem={handleUpdateItem}
                  inventoryItems={inventoryItems}
                />
              </ErrorBoundary>
            )}
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
                <h2 className="text-base md:text-lg font-semibold text-gray-800">Quotation Preview</h2>
                <div className="flex items-center justify-end sm:justify-start gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isLoading || isGeneratingPDF || isSaving}
                    className="flex items-center gap-1 md:gap-2 bg-blue-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg hover:bg-blue-700 transition text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Save className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="hidden sm:inline">Save</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={downloadPDF}
                    disabled={isLoading || isGeneratingPDF || isSaving}
                    className="flex items-center gap-1 md:gap-2 bg-blue-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg hover:bg-blue-700 transition text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGeneratingPDF ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Download className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="hidden sm:inline">PDF</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handlePrint}
                    disabled={isLoading || isGeneratingPDF || isSaving}
                    className="flex items-center gap-1 md:gap-2 bg-green-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg hover:bg-green-700 transition text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
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
                ref={quotationRef}
                data-quotation-container="true"
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
                <ErrorBoundary>
                  <QuotationCanvas quotationData={quotationData} />
                </ErrorBoundary>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quotation;