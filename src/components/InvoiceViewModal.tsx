import React, { useRef, useState } from 'react';
import { FileText, Download, AlertCircle } from 'lucide-react';
import { Modal, Button, LoadingSpinner } from './common';
import InvoiceCanvas from './InvoiceCanvas';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { InvoiceResponse } from '../types/invoice';

interface InvoiceViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedInvoice: InvoiceResponse | null;
}

export const InvoiceViewModal: React.FC<InvoiceViewModalProps> = ({
  isOpen,
  onClose,
  selectedInvoice
}) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [error, setError] = useState<string>('');

  const generatePDFFromView = async () => {
    if (!selectedInvoice || !invoiceRef.current) return;

    try {
      setIsGeneratingPDF(true);
      setError('');

      const invoiceContainer = invoiceRef.current;
      const originalWidth = invoiceContainer.style.width;
      const originalHeight = invoiceContainer.style.height;
      const originalBackground = invoiceContainer.style.background;

      // A4 size for PDF generation
      invoiceContainer.style.width = '794px';
      invoiceContainer.style.height = '1123px';
      invoiceContainer.style.background = 'white';
      invoiceContainer.style.padding = '0';
      invoiceContainer.style.margin = '0';

      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(invoiceContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
      });

      invoiceContainer.style.width = originalWidth;
      invoiceContainer.style.height = originalHeight;
      invoiceContainer.style.background = originalBackground;

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save('invoice-' + selectedInvoice.invoiceId + '.pdf');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error generating PDF:', err);
    } finally {
      setIsGeneratingPDF(false);
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
        {/* PDF Download Button */}
        <div className="flex justify-between items-center gap-3">
          <p className="text-sm text-gray-400">
            Invoice details displayed below
          </p>
          <Button
            variant="primary"
            size="md"
            icon={<Download className="w-4 h-4" />}
            onClick={generatePDFFromView}
            isLoading={isGeneratingPDF}
            disabled={isGeneratingPDF}
          >
            <span className="hidden sm:inline">Download PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
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
                        itemName: item.item?.itemName || item.item?.description || "Item",
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
