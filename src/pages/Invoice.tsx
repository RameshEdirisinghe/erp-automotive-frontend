import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { User, FileText, Download, Printer, Menu, X, Save } from "lucide-react";
import InvoiceForm from "../components/InvoiceForm";
import InvoiceCanvas from "../components/InvoiceCanvas";
import type {
  InvoiceData,
  InvoiceItem,
  BackendInvoiceData,
} from "../types/invoice";
import type { InventoryItem as InvoiceInventoryItem } from "../types/inventory";
import { PaymentStatus, PaymentMethod } from "../types/invoice";
import { invoiceService } from "../services/InvoiceService";
import { inventoryService } from "../services/InventoryService";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import CustomAlert from "../components/CustomAlert";
import type { AlertType } from "../components/CustomAlert";
import ErrorBoundary from "../components/ErrorBoundary";

const TAX_RATE = 0.18;
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const PX_PER_MM = 3.78;

const calculateInvoiceTotals = (items: InvoiceItem[], discountPercentage: number) => {
  const subTotal = items.reduce((sum, current) => sum + current.total, 0);
  const discount = subTotal * (discountPercentage / 100);
  const tax = subTotal * TAX_RATE;
  const totalAmount = Math.max(subTotal + tax - discount, 0);

  return {
    subTotal,
    discount,
    totalAmount,
  };
};

const Invoice: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [activePanel, setActivePanel] = useState<'form' | 'preview'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [alert, setAlert] = useState<{ type: AlertType; message: string } | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InvoiceInventoryItem[]>([]);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.7);
  const containerRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceId: "",
    customer: "",
    customerDetails: undefined,
    items: [],
    subTotal: 0,
    discount: 0,
    discountPercentage: 0,
    totalAmount: 0,
    paymentStatus: PaymentStatus.PENDING,
    paymentMethod: PaymentMethod.CASH,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    vehicleNumber: "",
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
      if (!rightPanelRef.current || isMobileView) return;

      const panelWidth = rightPanelRef.current.clientWidth;
      const panelHeight = rightPanelRef.current.clientHeight;

      const a4Width = A4_WIDTH_MM * PX_PER_MM;
      const a4Height = A4_HEIGHT_MM * PX_PER_MM;

      const availableWidth = panelWidth - 48;
      const availableHeight = panelHeight - 120;

      const widthScale = availableWidth / a4Width;
      const heightScale = availableHeight / a4Height;

      const newScale = Math.max(
        Math.min(widthScale, heightScale),
        0.3
      );

      setScale(prev => {
        if (Math.abs(prev - newScale) < 0.01) {
          return prev;
        }
        return newScale;
      });
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
        console.log('[DEBUG] Loading inventory items...');

        const items = await inventoryService.getAll();
        console.log('[DEBUG] Inventory items loaded:', items);
        setInventoryItems(items as InvoiceInventoryItem[]);

        const nextId = await invoiceService.getNextId();
        console.log('[DEBUG] Next invoice ID:', nextId);
        setInvoiceData(prev => ({ ...prev, invoiceId: nextId }));

      } catch (error) {
        console.error('[DEBUG] Error loading data:', error);
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

  const handleAddItem = (item: Omit<InvoiceItem, 'id' | 'total'>) => {
    console.log('[DEBUG] Adding item:', item);
    setInvoiceData(prev => {
      const existingItemIndex = prev.items.findIndex(
        existing => existing.item === item.item
      );

      let updatedItems: InvoiceItem[];

      if (existingItemIndex !== -1) {
        const existingItem = prev.items[existingItemIndex];
        const mergedItem: InvoiceItem = {
          ...existingItem,
          quantity: existingItem.quantity + item.quantity,
          total: (existingItem.quantity + item.quantity) * existingItem.unitPrice,
        };

        updatedItems = prev.items.map((entry, index) =>
          index === existingItemIndex ? mergedItem : entry
        );
      } else {
        const newItem: InvoiceItem = {
          ...item,
          id: Date.now().toString(),
          total: item.quantity * item.unitPrice,
        };
        updatedItems = [...prev.items, newItem];
      }

      const totals = calculateInvoiceTotals(updatedItems, prev.discountPercentage);

      console.log('[DEBUG] Updated items after add:', updatedItems);
      console.log('[DEBUG] Updated totals:', totals);

      return {
        ...prev,
        items: updatedItems,
        ...totals,
      };
    });
  };

  const handleRemoveItem = (id: string) => {
    console.log('[DEBUG] Removing item with id:', id);
    setInvoiceData(prev => {
      const updatedItems = prev.items.filter(item => item.id !== id);
      const totals = calculateInvoiceTotals(updatedItems, prev.discountPercentage);

      return {
        ...prev,
        items: updatedItems,
        ...totals,
      };
    });
  };

  const handleUpdateItem = (id: string, updates: Partial<InvoiceItem>) => {
    console.log('[DEBUG] Updating item:', id, updates);
    setInvoiceData(prev => {
      const updatedItems = prev.items.map(item => {
        if (item.id !== id) {
          return item;
        }

        const quantity = updates.quantity ?? item.quantity;
        const unitPrice = updates.unitPrice ?? item.unitPrice;

        return {
          ...item,
          ...updates,
          quantity,
          unitPrice,
          total: quantity * unitPrice,
        };
      });

      const totals = calculateInvoiceTotals(updatedItems, prev.discountPercentage);

      return {
        ...prev,
        items: updatedItems,
        ...totals,
      };
    });
  };

  const handleFieldChange = (field: keyof InvoiceData, value: string | number | boolean | Date) => {
    console.log('[DEBUG] Field change:', field, value);
    setInvoiceData(prev => {
      if (field === 'discountPercentage') {
        const numericValue = typeof value === 'number' ? value : Number(value);
        const discountPercentage = Number.isNaN(numericValue) ? 0 : numericValue;
        const totals = calculateInvoiceTotals(prev.items, discountPercentage);

        return {
          ...prev,
          discountPercentage,
          ...totals,
        };
      }

      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleCustomerIdChange = (customerId: string, customerDetails?: any) => {
    console.log('[DEBUG] Customer changed:', { customerId, customerDetails });
    setInvoiceData(prev => ({
      ...prev,
      customer: customerId,
      customerDetails: customerDetails
    }));
  };

  // Helper function to validate data
  const validateInvoiceData = (): string[] => {
    const errors: string[] = [];

    console.log('[DEBUG] Validating invoice data:', invoiceData);

    // Check customer
    if (!invoiceData.customer) {
      errors.push('Customer ID is required');
      console.error('[DEBUG] Validation error: No customer ID');
    } else if (typeof invoiceData.customer !== 'string') {
      errors.push('Customer ID must be a string');
      console.error('[DEBUG] Validation error: Customer ID is not a string', invoiceData.customer);
    }

    // Check customer details
    if (!invoiceData.customerDetails) {
      console.warn('[DEBUG] Customer details not found, but continuing...');
    }

    // Check items
    if (invoiceData.items.length === 0) {
      errors.push('At least one item is required');
      console.error('[DEBUG] Validation error: No items');
    } else {
      invoiceData.items.forEach((item, index) => {
        console.log(`[DEBUG] Validating item ${index + 1}:`, item);
        
        if (!item.item) {
          errors.push(`Item ${index + 1}: Missing inventory item ID`);
          console.error(`[DEBUG] Validation error: Item ${index + 1} missing ID`);
        }
        
        if (typeof item.quantity !== 'number' || item.quantity <= 0) {
          errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
          console.error(`[DEBUG] Validation error: Item ${index + 1} invalid quantity`, item.quantity);
        }
        
        if (typeof item.unitPrice !== 'number' || item.unitPrice < 0) {
          errors.push(`Item ${index + 1}: Unit price must be valid`);
          console.error(`[DEBUG] Validation error: Item ${index + 1} invalid unit price`, item.unitPrice);
        }
        
        if (typeof item.total !== 'number' || item.total < 0) {
          errors.push(`Item ${index + 1}: Total must be valid`);
          console.error(`[DEBUG] Validation error: Item ${index + 1} invalid total`, item.total);
        }
      });
    }

    // Check vehicle number
    if (!invoiceData.vehicleNumber || invoiceData.vehicleNumber.trim().length === 0) {
      errors.push('Vehicle number is required');
      console.error('[DEBUG] Validation error: No vehicle number');
    }

    // Check dates
    if (!invoiceData.issueDate) {
      errors.push('Issue date is required');
      console.error('[DEBUG] Validation error: No issue date');
    }
    
    if (!invoiceData.dueDate) {
      errors.push('Due date is required');
      console.error('[DEBUG] Validation error: No due date');
    }

    // Check payment method and status
    if (!invoiceData.paymentMethod) {
      errors.push('Payment method is required');
      console.error('[DEBUG] Validation error: No payment method');
    }
    
    if (!invoiceData.paymentStatus) {
      errors.push('Payment status is required');
      console.error('[DEBUG] Validation error: No payment status');
    }

    return errors;
  };

  // Save invoice to database
  const handleSaveInvoice = async () => {
    console.log('[DEBUG] Save button clicked');
    console.log('[DEBUG] Current invoice data:', invoiceData);

    // Validate data first
    const validationErrors = validateInvoiceData();
    if (validationErrors.length > 0) {
      console.error('[DEBUG] Validation failed with errors:', validationErrors);
      setAlert({
        type: 'error',
        message: `Please fix the following errors:\n• ${validationErrors.join('\n• ')}`
      });
      return;
    }

    try {
      setIsSaving(true);
      setAlert({
        type: 'info',
        message: 'Saving invoice...'
      });

      console.log('[DEBUG] Preparing backend data...');

      // Prepare data for backend with proper formatting
      const backendData: BackendInvoiceData = {
        invoiceId: invoiceData.invoiceId,
        customer: invoiceData.customer,
        items: invoiceData.items.map(item => ({
          item: item.item,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total
        })),
        subTotal: invoiceData.subTotal,
        discount: invoiceData.discount,
        totalAmount: invoiceData.totalAmount,
        paymentStatus: invoiceData.paymentStatus,
        paymentMethod: invoiceData.paymentMethod,
        bankDepositDate: invoiceData.bankDepositDate ? invoiceData.bankDepositDate : undefined,
        issueDate: invoiceData.issueDate,
        dueDate: invoiceData.dueDate,
        vehicleNumber: invoiceData.vehicleNumber,
        notes: invoiceData.notes || ''
      };

      console.log('[DEBUG] Backend data prepared:', backendData);
      console.log('[DEBUG] Data types:', {
        customer: typeof backendData.customer,
        customerValue: backendData.customer,
        itemsCount: backendData.items.length,
        items: backendData.items.map(item => ({
          itemType: typeof item.item,
          itemValue: item.item,
          quantityType: typeof item.quantity,
          unitPriceType: typeof item.unitPrice,
          totalType: typeof item.total
        })),
        issueDateType: typeof backendData.issueDate,
        dueDateType: typeof backendData.dueDate,
        bankDepositDateType: typeof backendData.bankDepositDate
      });

      console.log('[DEBUG] Calling invoiceService.create()...');
      
      // Call the service to save invoice
      const savedInvoice = await invoiceService.create(backendData);
      
      console.log('[DEBUG] Invoice saved successfully:', savedInvoice);
      
      // Update local state with the saved invoice ID
      setInvoiceData(prev => ({
        ...prev,
        _id: savedInvoice._id,
        invoiceId: savedInvoice.invoiceId
      }));

      setAlert({
        type: 'success',
        message: `Invoice saved successfully! Invoice ID: ${savedInvoice.invoiceId}`
      });

      console.log('[DEBUG] Getting next invoice ID for new invoice...');
      
      // Refresh the next invoice ID for next invoice
      const nextId = await invoiceService.getNextId();
      
      // Reset form for next invoice but keep customer if they want to create another
      setInvoiceData(prev => ({ 
        ...prev,
        _id: undefined,
        invoiceId: nextId,
        items: [],
        subTotal: 0,
        discount: 0,
        discountPercentage: 0,
        totalAmount: 0,
        vehicleNumber: "",
        notes: "",
        // Keep customer and customerDetails for convenience
      }));

      console.log('[DEBUG] Form reset for new invoice. Next ID:', nextId);

    } catch (error) {
      console.error('[DEBUG] Error saving invoice:', error);
      
      // Detailed error logging
      if (error instanceof Error) {
        console.error('[DEBUG] Error name:', error.name);
        console.error('[DEBUG] Error message:', error.message);
        console.error('[DEBUG] Error stack:', error.stack);
        
        // Try to extract more information if it's an HTTP error
        if (error.message.includes('400')) {
          console.error('[DEBUG] HTTP 400 Bad Request - Likely validation error');
          console.error('[DEBUG] Please check:');
          console.error('[DEBUG] 1. Customer ID format (should be MongoDB ObjectId)');
          console.error('[DEBUG] 2. Item IDs format (should be MongoDB ObjectId)');
          console.error('[DEBUG] 3. Date formats');
          console.error('[DEBUG] 4. Required fields are not empty');
        }
      }

      // User-friendly error message
      let errorMessage = 'Failed to save invoice. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('400')) {
          errorMessage = 'Validation error: Please check all required fields are filled correctly.';
        } else if (error.message.includes('401') || error.message.includes('403')) {
          errorMessage = 'Authentication error. Please log in again.';
        } else if (error.message.includes('Network Error')) {
          errorMessage = 'Network error. Please check your connection.';
        } else {
          errorMessage = error.message;
        }
      }

      setAlert({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsSaving(false);
      console.log('[DEBUG] Save operation completed');
    }
  };

  const downloadPDF = async () => {
    if (!invoiceRef.current) {
      setAlert({
        type: 'error',
        message: "Invoice content not available for PDF generation."
      });
      return;
    }

    try {
      setIsGeneratingPDF(true);
      setAlert({
        type: 'info',
        message: 'Generating PDF... Please wait.'
      });

      const invoiceContainer = invoiceRef.current;

      const originalTransform = invoiceContainer.style.transform;
      const originalTransformOrigin = invoiceContainer.style.transformOrigin;
      const originalWidth = invoiceContainer.style.width;
      const originalHeight = invoiceContainer.style.height;

      invoiceContainer.style.transform = 'none';
      invoiceContainer.style.transformOrigin = 'top left';
      invoiceContainer.style.width = '210mm';
      invoiceContainer.style.height = '297mm';
      invoiceContainer.style.position = 'fixed';
      invoiceContainer.style.left = '0';
      invoiceContainer.style.top = '0';
      invoiceContainer.style.zIndex = '9999';

      void invoiceContainer.offsetHeight;

      const images = invoiceContainer.getElementsByTagName('img');
      const imageLoadPromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      });

      await Promise.all(imageLoadPromises);

      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(invoiceContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
        onclone: (clonedDoc: Document) => {
          const clonedContainer = clonedDoc.querySelector('[data-invoice-container]');
          if (clonedContainer) {
            (clonedContainer as HTMLElement).style.transform = 'none';
            (clonedContainer as HTMLElement).style.transformOrigin = 'top left';
            (clonedContainer as HTMLElement).style.width = '210mm';
            (clonedContainer as HTMLElement).style.height = '297mm';
          }
        }
      });

      invoiceContainer.style.transform = originalTransform;
      invoiceContainer.style.transformOrigin = originalTransformOrigin;
      invoiceContainer.style.width = originalWidth;
      invoiceContainer.style.height = originalHeight;
      invoiceContainer.style.position = '';
      invoiceContainer.style.left = '';
      invoiceContainer.style.top = '';
      invoiceContainer.style.zIndex = '';

      const jpegData = canvas.toDataURL('image/jpeg', 1.0);

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

      pdf.addImage(jpegData, 'JPEG', xPos, yPos, imgWidth, finalHeight);

      pdf.save(`invoice-${invoiceData.invoiceId}.pdf`);

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
    if (!invoiceRef.current) return;

    try {
      setIsGeneratingPDF(true);
      setAlert({
        type: 'info',
        message: 'Preparing print... Please wait.'
      });

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
        onclone: (clonedDoc: Document) => {
          const clonedContainer = clonedDoc.querySelector('[data-invoice-container]');
          if (clonedContainer) {
            (clonedContainer as HTMLElement).style.transform = 'none';
            (clonedContainer as HTMLElement).style.transformOrigin = 'top left';
            (clonedContainer as HTMLElement).style.width = '210mm';
            (clonedContainer as HTMLElement).style.height = '297mm';
          }
        }
      });

      const imageData = canvas.toDataURL('image/png', 1.0);

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        setAlert({
          type: 'error',
          message: "Popup blocked! Please allow popups for this site to print."
        });
        setIsGeneratingPDF(false);
        return;
      }

      const printHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice ${invoiceData.invoiceId}</title>
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
              
              .invoice-image {
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
                
                .invoice-image {
                  page-break-inside: avoid;
                }
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              <img src="${imageData}" alt="Invoice ${invoiceData.invoiceId}" class="invoice-image" />
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

      printWindow.document.open();
      printWindow.document.write(printHtml);
      printWindow.document.close();

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
        {alert && (
          <CustomAlert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
            duration={3000}
          />
        )}

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
            
            {/* Save Button */}
            <button
              onClick={handleSaveInvoice}
              disabled={isLoading || isSaving || invoiceData.items.length === 0}
              className="flex items-center gap-2 bg-green-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg hover:bg-green-700 transition text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save'}</span>
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
                <InvoiceForm
                  invoiceData={invoiceData}
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

          <div
            ref={rightPanelRef}
            className={`${isMobileView
              ? (activePanel === 'preview' ? 'w-full' : 'hidden')
              : 'hidden lg:flex lg:w-1/2'} bg-gray-50 border-l border-gray-300 flex flex-col overflow-hidden`}
          >
            <div className="bg-white border-b border-gray-300 p-3 md:p-4 flex-shrink-0">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <h2 className="text-base md:text-lg font-semibold text-gray-800">Invoice Preview</h2>
                <div className="flex items-center justify-end sm:justify-start gap-2">
                  <button
                    onClick={downloadPDF}
                    disabled={isLoading || isGeneratingPDF}
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
                    disabled={isLoading || isGeneratingPDF}
                    className="flex items-center gap-1 md:gap-2 bg-green-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg hover:bg-green-700 transition text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Printer className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Print</span>
                  </button>
                </div>
              </div>
            </div>

            <div
              ref={containerRef}
              className="flex-1 overflow-hidden bg-white flex items-center justify-center p-2 md:p-4"
            >
              <div
                ref={invoiceRef}
                data-invoice-container="true"
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
                  <InvoiceCanvas invoiceData={invoiceData} />
                </ErrorBoundary>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;