import React, { useRef, useState } from 'react';
import { FileText, Download, AlertCircle, Printer } from 'lucide-react';
import { Modal, Button, LoadingSpinner } from './common';
import InvoiceCanvas from './InvoiceCanvas';
import html2canvas from 'html2canvas';
import type { InvoiceResponse } from '../types/invoice';

interface InvoiceViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedInvoice: InvoiceResponse | null;
  onDownloadInvoice: (invoice: InvoiceResponse) => Promise<void>;
  isGeneratingPDF: boolean;
}

export const InvoiceViewModal: React.FC<InvoiceViewModalProps> = ({
  isOpen,
  onClose,
  selectedInvoice,
  onDownloadInvoice,
  isGeneratingPDF
}) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string>('');

  const handlePrint = async () => {
    if (!selectedInvoice || !invoiceRef.current) return;

    try {
      setError('');
      
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
      });

      invoiceContainer.style.transform = originalTransform;
      invoiceContainer.style.transformOrigin = originalTransformOrigin;
      invoiceContainer.style.width = originalWidth;
      invoiceContainer.style.height = originalHeight;
      invoiceContainer.style.position = '';
      invoiceContainer.style.left = '';
      invoiceContainer.style.top = '';
      invoiceContainer.style.zIndex = '';

      const imageData = canvas.toDataURL('image/png', 1.0);

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        setError("Popup blocked! Please allow popups for this site to print.");
        return;
      }

      const printHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice ${selectedInvoice.invoiceId}</title>
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
              <img src="${imageData}" alt="Invoice ${selectedInvoice.invoiceId}" class="invoice-image" />
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  setTimeout(function() {
                    window.close();
                  }, 1000);
                }, 500);
              };
              
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

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error printing invoice:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Invoice Preview - ${selectedInvoice?.invoiceId}`}
      icon={<FileText className="w-5 h-5 text-blue-400" />}
      size="xl"
      className="!h-[90vh] flex flex-col"
    >
      <div className="flex-1 flex flex-col gap-4">
        {/* Action Buttons */}
        <div className="flex justify-between items-center gap-3">
          <p className="text-sm text-gray-400">
            Invoice details displayed below
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="md"
              icon={<Printer className="w-4 h-4" />}
              onClick={handlePrint}
              disabled={isGeneratingPDF || !selectedInvoice}
            >
              <span className="hidden sm:inline">Print</span>
              <span className="sm:hidden">Print</span>
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<Download className="w-4 h-4" />}
              onClick={() => selectedInvoice && onDownloadInvoice(selectedInvoice)}
              isLoading={isGeneratingPDF}
              disabled={isGeneratingPDF || !selectedInvoice}
            >
              <span className="hidden sm:inline">Download PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div className="text-sm text-red-400">{error}</div>
          </div>
        )}

        {/* Invoice Preview */}
        {isGeneratingPDF ? (
          <div className="flex-1 flex items-center justify-center bg-[#0f172a] rounded-lg border border-[#334155]">
            <LoadingSpinner size="lg" text="Generating PDF..." />
          </div>
        ) : (
          <div className="flex-1 overflow-auto bg-[#0f172a] rounded-lg border border-[#334155] p-4">
            <div className="bg-white rounded-lg h-full w-full overflow-auto">
              {selectedInvoice && (
                <div
                  ref={invoiceRef}
                  className="w-[210mm] min-h-[297mm] bg-white mx-auto p-8 shadow-lg"
                  style={{
                    boxSizing: 'border-box',
                    transform: 'scale(0.8)',
                    transformOrigin: 'top center'
                  }}
                >
                  <InvoiceCanvas
                    invoiceData={{
                      invoiceId: selectedInvoice.invoiceId,
                      customer: selectedInvoice.customer?._id || "",
                      customerDetails: selectedInvoice.customer,
                      items: selectedInvoice.items.map(item => ({
                        id: item._id || Date.now().toString(),
                        item: item.item?._id || "",
                        itemName: item.item?.product_name || item.item?.itemName || item.item?.description || "Item",
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        total: item.total,
                      })),
                      subTotal: selectedInvoice.subTotal,
                      discount: selectedInvoice.discount,
                      discountPercentage: selectedInvoice.discount > 0 ? (selectedInvoice.discount / selectedInvoice.subTotal) * 100 : 0,
                      totalAmount: selectedInvoice.totalAmount,
                      paymentStatus: selectedInvoice.paymentStatus,
                      paymentMethod: selectedInvoice.paymentMethod,
                      bankDepositDate: selectedInvoice.bankDepositDate,
                      issueDate: selectedInvoice.issueDate,
                      dueDate: selectedInvoice.dueDate,
                      vehicleNumber: selectedInvoice.vehicleNumber,
                      notes: selectedInvoice.notes,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default InvoiceViewModal;