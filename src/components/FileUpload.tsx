import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled: isLoading
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
        transition-all duration-300 ease-in-out
        ${isDragActive && !isDragReject ? 'border-blue-400 bg-blue-50' : ''}
        ${isDragReject ? 'border-red-400 bg-red-50' : ''}
        ${!isDragActive && !isDragReject ? 'border-gray-300 hover:border-blue-400 hover:bg-gray-50' : ''}
        ${isLoading ? 'pointer-events-none opacity-60' : ''}
      `}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center space-y-4">
        {isDragReject ? (
          <AlertCircle className="w-12 h-12 text-red-400" />
        ) : (
          <div className="relative">
            <Upload className={`w-12 h-12 ${isDragActive ? 'text-blue-500' : 'text-gray-400'} transition-colors duration-300`} />
            {isDragActive && (
              <div className="absolute inset-0 animate-ping">
                <Upload className="w-12 h-12 text-blue-400 opacity-75" />
              </div>
            )}
          </div>
        )}
        
        <div className="space-y-2">
          {isDragReject ? (
            <p className="text-red-600 font-medium">Please upload a PDF file only</p>
          ) : isDragActive ? (
            <p className="text-blue-600 font-medium">Drop your PDF here...</p>
          ) : (
            <>
              <p className="text-gray-700 font-medium">
                {isLoading ? 'Processing PDF...' : 'Drop your PDF here or click to browse'}
              </p>
              <p className="text-sm text-gray-500">
                Upload a PDF containing questions with multiple choice options
              </p>
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <FileText className="w-4 h-4" />
          <span>PDF files only</span>
        </div>
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-xl">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-blue-600 font-medium">Parsing PDF...</span>
          </div>
        </div>
      )}
    </div>
  );
};