import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
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
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (pdfDoc && open) {
      // Get the raw blob and create a new one with explicit MIME type
      const arrayBuffer = pdfDoc.output("arraybuffer");
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);

      return () => {
        URL.revokeObjectURL(url);
        setPdfUrl(null);
      };
    } else {
      setPdfUrl(null);
    }
  }, [pdfDoc, open]);

  const handleDownload = () => {
    if (pdfDoc) {
      pdfDoc.save(filename);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-foreground">{title}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button onClick={handleDownload} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden bg-muted/30">
          {pdfUrl ? (
            <object
              data={`${pdfUrl}#toolbar=1&view=FitH`}
              type="application/pdf"
              className="w-full h-full"
            >
              <embed 
                src={pdfUrl} 
                type="application/pdf" 
                className="w-full h-full" 
              />
              <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
                <p className="text-muted-foreground">
                  Votre navigateur ne supporte pas l'affichage PDF intégré.
                </p>
                <Button onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger le PDF
                </Button>
              </div>
            </object>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Chargement...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
