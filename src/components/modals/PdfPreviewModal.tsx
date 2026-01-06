import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { toast } from "sonner";

interface PdfPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfDoc: jsPDF | null;
  filename: string;
  title: string;
}

export function PdfPreviewModal({ open, onOpenChange, pdfDoc, filename, title }: PdfPreviewModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!pdfDoc || !open) {
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }

    const blob = pdfDoc.output("blob");
    const url = URL.createObjectURL(blob);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [pdfDoc, open]);

  const handleDownload = () => {
    if (!pdfDoc) return;
    pdfDoc.save(filename);
    onOpenChange(false);
  };

  const handleOpenInNewTab = () => {
    if (!pdfDoc) return;

    // Create a dedicated URL for the new tab so it stays valid even if the modal closes.
    const blob = pdfDoc.output("blob");
    const url = URL.createObjectURL(blob);

    const newWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (!newWindow) {
      URL.revokeObjectURL(url);
      toast.error("Pop-up bloqué", {
        description: "Autorisez les pop-ups pour ouvrir le PDF dans un nouvel onglet.",
      });
      return;
    }

    // Give the browser time to load the PDF before revoking.
    window.setTimeout(() => URL.revokeObjectURL(url), 2 * 60 * 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="text-foreground">{title}</DialogTitle>
          <DialogDescription>Prévisualisation du document PDF</DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 bg-muted/20">
          {previewUrl ? (
            <iframe
              title={title}
              src={previewUrl}
              className="h-full w-full"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full grid place-items-center">
              <p className="text-sm text-muted-foreground">Chargement du PDF…</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground truncate">{filename}</p>

          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
            <Button variant="outline" onClick={handleOpenInNewTab}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Ouvrir dans un onglet
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
