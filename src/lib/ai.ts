import { GoogleGenerativeAI } from '@google/generative-ai';
import { createWorker } from 'tesseract.js';
import { config } from './config';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(config.gemini.apiKey || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const visionModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// OCR worker initialization
let ocrWorker: Tesseract.Worker | null = null;

async function getOCRWorker() {
  if (!ocrWorker) {
    ocrWorker = await createWorker('eng');
  }
  return ocrWorker;
}

export async function summarizeDocument(file: File, fileType: 'pdf' | 'image'): Promise<string> {
  try {
    let text = '';

    if (fileType === 'image') {
      // For images, use OCR to extract text
      const worker = await getOCRWorker();
      const { data: { text: extractedText } } = await worker.recognize(file);
      text = extractedText;
    } else if (fileType === 'pdf') {
      // For PDFs, use pdf-parse
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await import('pdf-parse');
      const data = await pdf.default(Buffer.from(arrayBuffer));
      text = data.text;
    }

    // Use Gemini to summarize the text
    const prompt = `Please analyze and summarize the following medical document. Focus on key findings, diagnoses, and recommendations:

${text}

Please provide a structured summary in the following format:
1. Key Findings
2. Diagnoses
3. Recommendations
4. Follow-up Actions`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();
    
    return summary || 'Unable to generate summary.';
  } catch (error) {
    console.error('Error summarizing document:', error);
    throw new Error('Failed to analyze document');
  }
}

export async function predictDisease(symptoms: string, parameters: Record<string, string>): Promise<string> {
  try {
    const prompt = `As a medical diagnostic AI, analyze the following symptoms and health parameters to provide potential diagnoses and recommendations. Please consider Indian population health factors.

Symptoms:
${symptoms}

Health Parameters:
${Object.entries(parameters)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n')}

Please provide a structured analysis in the following format:
1. Potential Diagnoses (ordered by likelihood)
2. Risk Factors
3. Immediate Recommendations
4. Lifestyle Modifications
5. Required Tests/Investigations
6. Follow-up Timeline`;

    const result = await model.generateContent(prompt);
    const analysis = result.response.text();
    
    return analysis || 'Unable to generate analysis.';
  } catch (error) {
    console.error('Error predicting disease:', error);
    throw new Error('Failed to analyze symptoms');
  }
}

export async function analyzeImage(imageFile: File): Promise<string> {
  try {
    const imageData = await imageFile.arrayBuffer();
    const prompt = `You are a medical imaging expert. Please analyze this medical image and provide:
1. Type of imaging (X-ray, MRI, CT, etc.)
2. Anatomical region shown
3. Key observations
4. Potential abnormalities
5. Recommendations for further investigation if needed`;

    const result = await visionModel.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: imageFile.type,
          data: Buffer.from(imageData).toString('base64')
        }
      }
    ]);

    const analysis = result.response.text();
    return analysis || 'Unable to analyze image.';
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw new Error('Failed to analyze image');
  }
}

interface HealthParameters {
  blood_pressure: string;
  blood_sugar: string;
  cholesterol: string;
  bmi: string;
  [key: string]: string;
}

export async function generateMedicalReport(
  symptoms: string,
  parameters: HealthParameters,
  visitReason: string
): Promise<string> {
  try {
    const prompt = `As a medical professional, generate a detailed medical report based on the following information:

Visit Reason: ${visitReason}

Patient Symptoms:
${symptoms}

Health Parameters:
- Blood Pressure: ${parameters.blood_pressure}
- Blood Sugar: ${parameters.blood_sugar}
- Cholesterol: ${parameters.cholesterol}
- BMI: ${parameters.bmi}

Please provide a comprehensive medical report in the following format:

MEDICAL ASSESSMENT REPORT
Date: [Current Date]

PRESENTING SYMPTOMS:
[List all symptoms]

VITAL SIGNS & MEASUREMENTS:
[List all health parameters]

CLINICAL ASSESSMENT:
[Detailed analysis based on symptoms and parameters]

POTENTIAL DIAGNOSES:
[List potential conditions in order of likelihood]

RISK FACTORS:
[Identify key risk factors]

RECOMMENDATIONS:
[Treatment and lifestyle recommendations]

FOLLOW-UP PLAN:
[Specific follow-up instructions]

ADDITIONAL NOTES:
[Any other relevant medical observations]`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error generating medical report:', error);
    throw new Error('Failed to generate medical report');
  }
}

export function generatePDF(reportContent: string): void {
  const doc = new jsPDF();
  const hospitalName = "Sahayak Medical AI Report";
  const currentDate = new Date().toLocaleDateString();

  // Header styling
  doc.setFillColor(36, 99, 235);
  doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
  
  doc.setTextColor(255, 255, 255); // White color for header text
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(hospitalName, 105, 25, { align: 'center' });
  
  // Reset text color and add date
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${currentDate}`, 20, 50);

  // Decorative line
  doc.setDrawColor(36, 99, 235);
  doc.setLineWidth(0.5);
  doc.line(20, 55, 190, 55);

  // Process and format content
  let yPosition = 65;
  const pageHeight = doc.internal.pageSize.height;

  // Split content into sections while preserving formatting
  const sections = reportContent.split('\n\n');

  sections.forEach((section) => {
    // Handle section headers
    if (section.includes('**')) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(36, 99, 235); // Blue for headers
      section = section.replace(/\*\*/g, '');
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0); // Reset to black
    }

    // Check for concerning values or alerts
    const lines = section.split('\n');
    lines.forEach(line => {
      // Check for new page
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }

      // Format based on content
      if (line.match(/high|elevated|abnormal|concerning|borderline/i)) {
        doc.setTextColor(220, 53, 69); // Red for concerning values
      } else if (line.match(/low|decreased|deficient/i)) {
        doc.setTextColor(255, 193, 7); // Yellow/Orange for low values
      } else if (line.match(/normal|stable|healthy/i)) {
        doc.setTextColor(40, 167, 69); // Green for normal values
      } else {
        doc.setTextColor(0, 0, 0); // Default black
      }

      // Add bullet points for better readability
      if (line.trim().startsWith('*')) {
        line = '• ' + line.substring(1).trim();
      }

      const wrappedText = doc.splitTextToSize(line, 170);
      doc.text(wrappedText, 20, yPosition);
      yPosition += 7 * wrappedText.length;
    });

    yPosition += 5; // Add spacing between sections
  });

  // Enhanced footer
  const pageCount = doc.internal.pages.length;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(36, 99, 235);
    doc.setLineWidth(0.5);
    doc.line(20, 280, 190, 280);
    
    // Footer text
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128); // Gray color for footer
    doc.setFont('helvetica', 'italic');
    doc.text('Sahayak - AI-Powered Medical Report', 20, 287);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${i} of ${pageCount}`, 180, 287, { align: 'right' });
  }

  doc.save('sahayak_medical_report.pdf');
}