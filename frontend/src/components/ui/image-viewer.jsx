import * as React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ImageViewer({ src, alt, onClose }) {
  if (!src) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-end mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/10"
            aria-label="Close image viewer"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        <div className="flex-1 overflow-hidden rounded-lg">
          <img
            src={src}
            alt={alt || 'Enlarged view'}
            className="w-full h-full object-contain max-h-[calc(90vh-4rem)]"
          />
        </div>
      </div>
    </div>
  );
}
