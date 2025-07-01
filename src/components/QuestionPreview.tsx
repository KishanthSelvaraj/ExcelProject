import React from 'react';
import { CheckCircle, Circle, FileText, Download, RotateCcw } from 'lucide-react';
import { QuestionData } from '../types';

interface QuestionPreviewProps {
  questions: QuestionData[];
  onDownloadCSV: () => void;
  onDownloadExcel: () => void;
  onReset: () => void;
}

function safeParseArray(str: string): string[] {
  try {
    const arr = JSON.parse(str);
    if (Array.isArray(arr)) return arr;
    return [];
  } catch {
    return [];
  }
}

export const QuestionPreview: React.FC<QuestionPreviewProps> = ({
  questions,
  onDownloadCSV,
  onDownloadExcel,
  onReset
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="w-6 h-6 text-green-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Parsed Questions ({questions.length})
            </h2>
            <p className="text-sm text-gray-600">
              Questions extracted and formatted for export
            </p>
          </div>
        </div>
        
        <button
          onClick={onReset}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Upload New PDF</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={onDownloadCSV}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          <Download className="w-4 h-4" />
          <span>Download CSV</span>
        </button>
        
        <button
          onClick={onDownloadExcel}
          className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          <Download className="w-4 h-4" />
          <span>Download Excel</span>
        </button>
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <h3 className="font-medium text-gray-900">Question Preview</h3>
          <p className="text-sm text-gray-600 mt-1">
            First few questions from your PDF (showing up to 5)
          </p>
        </div>
        
        <div className="divide-y divide-gray-100">
          {questions.slice(0, 5).map((question, index) => {
            const options = safeParseArray(question.options);
            const answerArr = safeParseArray(question.answer);
            const answer = answerArr[0] || '';
            return (
              <div key={index} className="p-6 space-y-4">
                <div>
                  <div className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 text-sm font-medium rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                    <p className="text-gray-900 font-medium leading-relaxed">
                      {question.question_name}
                    </p>
                  </div>
                </div>
                
                <div className="ml-8 space-y-2">
                  {options.map((option: string, optIndex: number) => {
                    const isCorrect = answer === option;
                    return (
                      <div key={optIndex} className="flex items-center space-x-2">
                        {isCorrect ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-300" />
                        )}
                        <span className={`text-sm ${isCorrect ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                          {String.fromCharCode(65 + optIndex)}. {option}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          
          {questions.length > 5 && (
            <div className="p-4 text-center text-gray-500 text-sm bg-gray-50 rounded-b-xl">
              ... and {questions.length - 5} more questions
            </div>
          )}
        </div>
      </div>

      {/* Format Preview */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-medium text-gray-900 mb-3">Export Format Preview</h3>
        <div className="bg-white rounded-lg p-4 font-mono text-xs overflow-x-auto">
          <div className="text-gray-600 mb-2">CSV Headers:</div>
          <div className="text-blue-600">
            section_name, question_type, weightage, tags, question_name, options, answer
          </div>
          {questions.length > 0 && (
            <>
              <div className="text-gray-600 mt-4 mb-2">Sample Row:</div>
              <div className="text-green-600 break-all">
                1, 1, , Basis, "{questions[0].question_name.substring(0, 50)}...", "{questions[0].options}", "{questions[0].answer}"
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};