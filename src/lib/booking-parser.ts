import type { OcrExtractedData } from "@/types";

function normalizeDate(dateStr: string): string | undefined {
  // Try to parse common PH date formats: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
  const parts = dateStr.split(/[\/\-]/);
  if (parts.length !== 3) return undefined;

  let year: string, month: string, day: string;

  if (parts[0].length === 4) {
    // YYYY-MM-DD
    [year, month, day] = parts;
  } else if (parseInt(parts[2]) > 31) {
    // DD/MM/YY or MM/DD/YY
    year = `20${parts[2]}`;
    month = parts[1].padStart(2, "0");
    day = parts[0].padStart(2, "0");
  } else {
    // Assume DD/MM/YYYY
    [day, month, year] = parts;
  }

  const d = new Date(`${year}-${month?.padStart(2, "0")}-${day?.padStart(2, "0")}`);
  if (isNaN(d.getTime())) return undefined;
  return d.toISOString().split("T")[0];
}

export function parseContractText(text: string): OcrExtractedData {
  const data: OcrExtractedData = {};

  const nameMatch = text.match(/(?:guest|name|lessee|tenant)\s*[:\-]\s*([A-Za-z\s\.]+?)(?:\n|,|$)/i);
  if (nameMatch) data.guest_name = nameMatch[1].trim();

  const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g;
  const dates = [...text.matchAll(datePattern)].map((m) => m[1]);
  if (dates[0]) data.check_in = normalizeDate(dates[0]);
  if (dates[1]) data.check_out = normalizeDate(dates[1]);

  const paxMatch = text.match(/(?:pax|guests?|persons?|occupants?)\s*[:\-]?\s*(\d+)/i);
  if (paxMatch) data.pax = parseInt(paxMatch[1]);

  const amountMatch = text.match(
    /(?:total|amount|rate|fee)\s*[:\-]?\s*(?:php|₱|peso)?\s*([\d,]+(?:\.\d{2})?)/i
  );
  if (amountMatch) data.total_amount = parseFloat(amountMatch[1].replace(/,/g, ""));

  const contactMatch = text.match(
    /(?:contact|phone|mobile|cp|cel|tel)\s*[:\-]?\s*([\d\+\-\s\(\)]{10,16})/i
  );
  if (contactMatch) data.guest_contact = contactMatch[1].trim();

  return data;
}
