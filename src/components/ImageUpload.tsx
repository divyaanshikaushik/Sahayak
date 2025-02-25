import React, { useState } from 'react';
import { Upload } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (base64Image: string) => void;
}

export function ImageUpload({ onImageSelect }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onImageSelect(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full">
      <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center">
          <Upload className="w-12 h-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Click or drag medical image here
          </p>
        </div>
      </div>
      {preview && (
        <div className="mt-4">
          <img
            src={preview}
            alt="Preview"
            className="max-w-full h-auto rounded-lg"
          />
        </div>
      )}
    </div>
  );
}