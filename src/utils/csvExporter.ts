import Papa from 'papaparse';
import { QuestionData } from '../types';

export class CSVExporter {
  static convertToCSVFormat(questions: any[]): QuestionData[] {
    return questions.map((q, index) => ({
      section_name: '1',
      question_type: '1',
      weightage: '',
      tags: 'Basis',
      question_name: q.question,
      options: `[${q.options.join(',')}]`,
      answer: `[${q.answer}]`
    }));
  }

  static downloadCSV(data: QuestionData[], filename: string = 'questions.csv') {
    const csv = Papa.unparse(data, {
      header: true,
      columns: ['section_name', 'question_type', 'weightage', 'tags', 'question_name', 'options', 'answer']
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static downloadExcel(data: QuestionData[], filename: string = 'questions.xlsx') {
    // For Excel format, we'll use CSV with .xlsx extension
    // In a production app, you might want to use a proper Excel library
    const csv = Papa.unparse(data, {
      header: true,
      columns: ['section_name', 'question_type', 'weightage', 'tags', 'question_name', 'options', 'answer']
    });
    
    const blob = new Blob([csv], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}