import React, { useState } from 'react';
import { FileText, Sparkles, AlertCircle } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { QuestionPreview } from './components/QuestionPreview';
import { parseFileWithOCR, exportToExcel, Question } from './utils/pdfParser';
import { CSVExporter } from './utils/csvExporter';
import { QuestionData } from './types';

function toQuestionData(questions: Question[]): QuestionData[] {
  return questions.map(q => ({
    section_name: String(q.section_name),
    question_type: String(q.question_type),
    weightage: q.weightage,
    tags: 'Basis',
    question_name: q.question_name,
    options: q.options,
    answer: q.answer,
  }));
}

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string>('');

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError('');
    try {
      const parsedQuestions = await parseFileWithOCR(file);
      if (parsedQuestions.length === 0) {
        setError('No questions found in the file. Please ensure your file contains properly formatted multiple-choice questions.');
        setQuestions([]);
        return;
      }
      setQuestions(parsedQuestions);
    } catch (err) {
      setError('Failed to parse file. Please ensure the file is not corrupted and contains text content.');
      setQuestions([]);
      console.error('Parsing error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    CSVExporter.downloadCSV(toQuestionData(questions), 'questions.csv');
  };

  const handleDownloadExcel = () => {
    exportToExcel(questions, 'questions.xlsx');
  };

  const handleReset = () => {
    setQuestions([]);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="relative">
              <FileText className="w-8 h-8 text-blue-600" />
              <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">PDF/Image Question Parser</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Upload your PDF or screenshot containing multiple-choice questions and get them formatted 
            as a structured CSV/Excel file ready for import into question banks.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-800 font-medium">Error Processing File</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {questions.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
              
              {/* Instructions */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">How it works:</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-blue-600 font-bold">1</span>
                    </div>
                    <h4 className="font-medium text-gray-900">Upload PDF</h4>
                    <p className="text-sm text-gray-600">
                      Select your PDF containing multiple-choice questions
                    </p>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-green-600 font-bold">2</span>
                    </div>
                    <h4 className="font-medium text-gray-900">Auto Parse</h4>
                    <p className="text-sm text-gray-600">
                      Questions and answers are automatically extracted
                    </p>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-purple-600 font-bold">3</span>
                    </div>
                    <h4 className="font-medium text-gray-900">Download</h4>
                    <p className="text-sm text-gray-600">
                      Get your formatted CSV/Excel file ready for import
                    </p>
                  </div>
                </div>
              </div>

              {/* Format Info */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Output Format:</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Section:</span>
                      <span className="block text-gray-600">Always "1"</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Type:</span>
                      <span className="block text-gray-600">Always "1"</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Tags:</span>
                      <span className="block text-gray-600">Always "Basis"</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Options:</span>
                      <span className="block text-gray-600">[opt1,opt2,...]</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <QuestionPreview
                questions={toQuestionData(questions)}
                onDownloadCSV={handleDownloadCSV}
                onDownloadExcel={handleDownloadExcel}
                onReset={handleReset}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>Support for multiple-choice questions with automatic answer detection</p>
        </div>
      </div>
    </div>
  );
}

export default App;