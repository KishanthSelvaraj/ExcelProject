// @ts-ignore: No type definitions for 'file-saver'
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export interface Question {
  section_name: number;
  question_type: number;
  weightage: string;
  question_name: string;
  options: string;
  answer: string;
}

const cleanText = (text: string): string => {
  // Only remove non-ASCII and trim, but keep case as is
  return text.replace(/[^\x00-\x7F]+/g, '').replace(/'/g, '').trim();
};

const extractQuestionData = (text: string): Question[] => {
  // Split by new line and number-dot (e.g., \n1. or \n2.)
  const rawQuestions = text.split(/\n\d+\./);
  const results: Question[] = [];

  for (let block of rawQuestions) {
    const lines = block.split('\n').map(line => line.trim()).filter(Boolean);
    if (lines.length < 2) continue;

    // Find the index where options start (first line that matches option pattern)
    let optionStartIdx = lines.findIndex(line => /^([@©●◉○O])\s*(.+)/.test(line));
    if (optionStartIdx === -1) continue;

    // Join all lines before the first option as the question text
    const questionTextRaw = lines.slice(0, optionStartIdx).join(' ');
    const questionText = cleanText(questionTextRaw.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim());
    const options: string[] = [];
    let answer = '';

    for (const line of lines.slice(optionStartIdx)) {
      // Match radio indicators: ◉, ○, ●, O, @, etc.
      const match = line.match(/^([@©●◉○O])\s*(.+)/);
      if (match) {
        const opt = cleanText(match[2].replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim());
        options.push(opt);
        // Filled symbols indicate the answer
        if (match[1] === '●' || match[1] === '◉' || match[1] === '@' || match[1] === 'O') {
          answer = opt;
        }
      }
    }

    if (questionText && options.length > 0) {
      results.push({
        section_name: 1,
        question_type: 1,
        weightage: '',
        question_name: questionText,
        options: `[${options.join(',')}]`, // No quotes, just comma separated
        answer: answer // Just the plain answer string
      });
    }
  }

  return results;
};

export const parseFileWithOCR = async (file: File): Promise<Question[]> => {
  // Check file type
  if (file.type.startsWith('image/')) {
    // Image file: use Tesseract directly
    const imageUrl = URL.createObjectURL(file);
    const { data: { text } } = await Tesseract.recognize(imageUrl, 'eng');
    URL.revokeObjectURL(imageUrl);
    return extractQuestionData(text);
  } else if (file.type === 'application/pdf') {
    // PDF file: use existing PDF+OCR logic
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context, viewport }).promise;

      const { data: { text } } = await Tesseract.recognize(canvas, 'eng');
      fullText += text + '\n';
    }
    return extractQuestionData(fullText);
  } else {
    throw new Error('Unsupported file type. Please upload a PDF or image file.');
  }
};

export const exportToExcel = (data: Question[], fileName = 'questions.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, fileName);
};

// Add this function for Google Vision API OCR
export async function extractTextWithGoogleVision(imageFile: File): Promise<string> {
  const apiKey = 'YOUR_GOOGLE_CLOUD_VISION_API_KEY'; // Replace with your actual API key
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      if (!reader.result) {
        reject(new Error('Failed to read image file.'));
        return;
      }
      const base64Image = (reader.result as string).split(',')[1];
      const body = {
        requests: [
          {
            image: { content: base64Image },
            features: [{ type: 'TEXT_DETECTION' }]
          }
        ]
      };
      try {
        const response = await fetch(
          `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
          {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' }
          }
        );
        const data = await response.json();
        const text = data.responses[0]?.fullTextAnnotation?.text || '';
        resolve(text);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });
}
