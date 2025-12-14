import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

interface DocumentData {
  type: "invoice" | "quotation";
  number: string;
  clientName?: string;
  clientEmail?: string;
  clientCompany?: string;
  issueDate: string;
  dueDate?: string;
  validUntil?: string;
  items: LineItem[];
  notes?: string;
  amount: number;
  companyName?: string;
  companyAddress?: string;
  companySiret?: string;
  companyTva?: string;
  currencySymbol?: string;
  currencyLocale?: string;
}

// Parse items safely - handles both JSON string and array
function parseItems(items: unknown): LineItem[] {
  if (!items) return [];
  
  // If it's a string, try to parse it
  if (typeof items === "string") {
    try {
      const parsed = JSON.parse(items);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  
  // If it's already an array, return it
  if (Array.isArray(items)) {
    return items;
  }
  
  return [];
}

export function generatePDF(data: DocumentData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // Parse items safely
  const items = parseItems(data.items);

  // Currency settings
  const currencySymbol = data.currencySymbol || "€";
  const currencyLocale = data.currencyLocale || "fr-FR";

  const formatCurrency = (amount: number) => {
    const formatted = amount.toLocaleString(currencyLocale);
    if (currencySymbol === "$") {
      return `${currencySymbol}${formatted}`;
    }
    return `${formatted} ${currencySymbol}`;
  };

  // Colors
  const primaryColor: [number, number, number] = [34, 139, 34]; // Green
  const textDark: [number, number, number] = [30, 30, 30];
  const textGray: [number, number, number] = [100, 100, 100];

  // Header bar
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 35, "F");

  // Company name in header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(data.companyName || "GET MONEYA", margin, 22);

  // Document type badge
  const docTypeLabel = data.type === "invoice" ? "FACTURE" : "DEVIS";
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(docTypeLabel, pageWidth - margin - 30, 22);

  let yPos = 50;

  // Document number and dates
  doc.setTextColor(...textDark);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`${data.type === "invoice" ? "Facture" : "Devis"} N° ${data.number}`, margin, yPos);

  yPos += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textGray);
  doc.text(
    `Date d'émission: ${format(new Date(data.issueDate), "d MMMM yyyy", { locale: fr })}`,
    margin,
    yPos
  );

  yPos += 6;
  if (data.type === "invoice" && data.dueDate) {
    doc.text(
      `Date d'échéance: ${format(new Date(data.dueDate), "d MMMM yyyy", { locale: fr })}`,
      margin,
      yPos
    );
  } else if (data.type === "quotation" && data.validUntil) {
    doc.text(
      `Valide jusqu'au: ${format(new Date(data.validUntil), "d MMMM yyyy", { locale: fr })}`,
      margin,
      yPos
    );
  }

  // Company info (right side)
  const companyX = pageWidth - margin - 70;
  yPos = 50;

  if (data.companyName) {
    doc.setTextColor(...textDark);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(data.companyName, companyX, yPos);
    yPos += 5;
  }
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textGray);
  doc.setFontSize(9);

  if (data.companyAddress) {
    const addressLines = data.companyAddress.split(",").map((s) => s.trim());
    addressLines.forEach((line) => {
      doc.text(line, companyX, yPos);
      yPos += 4;
    });
  }
  if (data.companySiret) {
    doc.text(`SIRET: ${data.companySiret}`, companyX, yPos);
    yPos += 4;
  }
  if (data.companyTva) {
    doc.text(`TVA: ${data.companyTva}`, companyX, yPos);
  }

  // Client box
  yPos = 95;
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(margin, yPos - 5, contentWidth / 2 - 10, 35, 3, 3, "F");

  doc.setTextColor(...textDark);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(data.type === "invoice" ? "FACTURÉ À" : "DESTINATAIRE", margin + 5, yPos + 3);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textGray);
  yPos += 10;

  if (data.clientName) {
    doc.setTextColor(...textDark);
    doc.setFontSize(10);
    doc.text(data.clientName, margin + 5, yPos);
    yPos += 5;
    doc.setTextColor(...textGray);
    doc.setFontSize(9);
  } else {
    doc.text("Client non spécifié", margin + 5, yPos);
    yPos += 5;
  }
  if (data.clientCompany) {
    doc.text(data.clientCompany, margin + 5, yPos);
    yPos += 5;
  }
  if (data.clientEmail) {
    doc.text(data.clientEmail, margin + 5, yPos);
  }

  // Items table
  yPos = 145;

  // Build table body - handle empty items
  const tableBody = items.length > 0
    ? items.map((item) => [
        item.description || "",
        (item.quantity || 0).toString(),
        formatCurrency(item.unit_price || 0),
        formatCurrency((item.quantity || 0) * (item.unit_price || 0)),
      ])
    : [["Aucun article", "-", "-", formatCurrency(data.amount)]];

  autoTable(doc, {
    startY: yPos,
    head: [["Description", "Quantité", "Prix unitaire", "Total"]],
    body: tableBody,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 9,
      cellPadding: 6,
      textColor: textDark,
    },
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "left",
    },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: 25, halign: "center" },
      2: { cellWidth: 35, halign: "right" },
      3: { cellWidth: 35, halign: "right" },
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
  });

  // @ts-ignore - autoTable adds this property
  yPos = doc.lastAutoTable.finalY + 15;

  // Totals section
  const totalsX = pageWidth - margin - 80;

  // Subtotal
  doc.setTextColor(...textGray);
  doc.setFontSize(10);
  doc.text("Sous-total HT:", totalsX, yPos);
  doc.setTextColor(...textDark);
  doc.text(formatCurrency(data.amount), pageWidth - margin, yPos, {
    align: "right",
  });

  yPos += 8;

  // TVA line (optional)
  doc.setTextColor(...textGray);
  doc.text("TVA (0%):", totalsX, yPos);
  doc.setTextColor(...textDark);
  doc.text(formatCurrency(0), pageWidth - margin, yPos, { align: "right" });

  yPos += 10;

  // Total line with background
  doc.setFillColor(...primaryColor);
  doc.roundedRect(totalsX - 10, yPos - 6, 90, 14, 2, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL TTC", totalsX, yPos + 3);
  doc.text(formatCurrency(data.amount), pageWidth - margin - 5, yPos + 3, {
    align: "right",
  });

  // Notes section
  if (data.notes) {
    yPos += 25;
    doc.setTextColor(...textDark);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Notes:", margin, yPos);

    yPos += 6;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textGray);
    const splitNotes = doc.splitTextToSize(data.notes, contentWidth);
    doc.text(splitNotes, margin, yPos);
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setTextColor(...textGray);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Document généré le ${format(new Date(), "d MMMM yyyy à HH:mm", { locale: fr })}`,
    pageWidth / 2,
    footerY,
    { align: "center" }
  );

  return doc;
}

export function downloadPDF(data: DocumentData, filename?: string) {
  try {
    const doc = generatePDF(data);
    const name = filename || `${data.type === "invoice" ? "facture" : "devis"}_${data.number}.pdf`;
    doc.save(name);
    return true;
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    return false;
  }
}
