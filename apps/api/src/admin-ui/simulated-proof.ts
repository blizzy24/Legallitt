import { PDFDocument, StandardFonts } from 'pdf-lib';

/** An explicitly false delivery artefact, never a receipt or a signature. */
export async function simulatedProof(reference: string, generatedAt: Date): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle('SIMULATED PROOF OF DELIVERY');
  pdf.setSubject('Generated automatically. No delivery occurred.');
  pdf.setCreationDate(generatedAt);
  const page = pdf.addPage([842, 595]);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  page.drawText('SIMULATED PROOF OF DELIVERY', {
    x: 48, y: 440, size: 32, font: bold,
  });
  page.drawText('Generated automatically. No delivery occurred.', {
    x: 48, y: 380, size: 24, font: regular,
  });
  page.drawText(`Case ${reference} · ${generatedAt.toISOString()}`, {
    x: 48, y: 320, size: 18, font: regular,
  });
  return pdf.save();
}
