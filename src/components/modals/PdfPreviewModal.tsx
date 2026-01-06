import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, FileText, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";

interface PdfPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfDoc: jsPDF | null;
  filename: string;
  title: string;
}

export function PdfPreviewModal({ open, onOpenChange, pdfDoc, filename, title }: PdfPreviewModalProps) {
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (pdfDoc && open) {
      // Use data URL instead of blob URL for better compatibility
      const dataUrl = pdfDoc.output("datauristring");
      setPdfDataUrl(dataUrl);

      return () => {
        setPdfDataUrl(null);
      };
    } else {
      setPdfDataUrl(null);
    }
  }, [pdfDoc, open]);

  const handleDownload = () => {
    if (pdfDoc) {
      pdfDoc.save(filename);
      onOpenChange(false);
    }
  };

  const handleOpenInNewTab = () => {
    if (pdfDataUrl) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>${title}</title></head>
            <body style="margin:0;padding:0;overflow:hidden;">
              <iframe src="${pdfDataUrl}" style="width:100%;height:100%;border:none;"></iframe>
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-foreground">{title}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="p-6 flex flex-col items-center gap-6">
          <div className="w-24 h-32 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
            <FileText className="h-12 w-12 text-primary" />
          </div>
          
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">PDF prêt</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {filename}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
            <Button onClick={handleDownload} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
            <Button variant="outline" onClick={handleOpenInNewTab} className="flex-1">
              Ouvrir dans un onglet
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
