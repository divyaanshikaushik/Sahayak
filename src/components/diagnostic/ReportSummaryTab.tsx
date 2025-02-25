import React, { useState, useCallback } from 'react';
import { FileUp, File, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { uploadFile } from '@/lib/storage';
import { summarizeDocument } from '@/lib/ai';
import { supabase } from '@/lib/supabase';

export function ReportSummaryTab() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [summaries, setSummaries] = useState<Array<{ name: string; summary: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(
      file => file.type === 'application/pdf' || file.type.startsWith('image/')
    );
    setFiles(prev => [...prev, ...validFiles]);
    setError(null);
  }, []);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError(null);
    
    try {
      const newSummaries = await Promise.all(
        files.map(async (file) => {
          // Upload file to Supabase Storage
          const fileUrl = await uploadFile(file, 'reports');

          // Generate summary using AI
          const fileType = file.type.includes('pdf') ? 'pdf' : 'image';
          const summary = await summarizeDocument(file, fileType);

          // Save to document_summaries table
          const { error: dbError } = await supabase
            .from('document_summaries')
            .insert([{
              file_url: fileUrl,
              file_type: fileType,
              summary
            }]);

          if (dbError) throw dbError;

          return {
            name: file.name,
            summary
          };
        })
      );

      setSummaries(prev => [...prev, ...newSummaries]);
      setFiles([]);
    } catch (error) {
      console.error('Error processing files:', error);
      setError('Failed to process files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <div className="flex flex-col items-center">
          <FileUp className="h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Upload medical reports (PDF) or images
          </p>
          <input
            type="file"
            onChange={onFileSelect}
            accept=".pdf,image/*"
            multiple
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
          >
            Select Files
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="ml-3 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Selected Files</h3>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <File className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? 'Processing...' : 'Upload and Analyze'}
          </Button>
        </div>
      )}

      {summaries.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Document Summaries</h3>
          {summaries.map((item, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">{item.name}</h4>
              <pre className="whitespace-pre-wrap text-sm text-gray-700">{item.summary}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}