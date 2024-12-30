import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '../../ui/Button';

interface ImageElementProps {
  id: string;
  content: string;
  position: { x: number; y: number };
  style?: Record<string, string>;
  onUpdate: (id: string, updates: { content?: string; position?: { x: number; y: number }; style?: Record<string, string> }) => void;
  onDelete: (id: string) => void;
}

export function ImageElement({ id, content, position, style = {}, onUpdate, onDelete }: ImageElementProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [elementPosition, setElementPosition] = useState(position);
  const elementRef = useRef<HTMLDivElement>(null);
  const [elementSize, setElementSize] = useState({
    width: parseInt(style.width as string) || 200,
    height: parseInt(style.height as string) || 200
  });

  useEffect(() => {
    setElementPosition(position);
  }, [position]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === elementRef.current || (e.target as HTMLElement).tagName === 'IMG') {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - elementPosition.x,
        y: e.clientY - elementPosition.y
      });
    }
  }, [elementPosition.x, elementPosition.y]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setElementPosition({ x: newX, y: newY });
      onUpdate(id, { position: { x: newX, y: newY } });
    } else if (isResizing && elementRef.current) {
      e.preventDefault();
      const rect = elementRef.current.getBoundingClientRect();
      const newWidth = Math.max(50, e.clientX - rect.left);
      const newHeight = Math.max(50, e.clientY - rect.top);
      setElementSize({ width: newWidth, height: newHeight });
      onUpdate(id, { 
        style: { 
          ...style,
          width: `${newWidth}px`,
          height: `${newHeight}px`
        } 
      });
    }
  }, [isDragging, isResizing, dragStart, id, onUpdate, style]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Create a placeholder immediately for better UX
      const imageUrl = URL.createObjectURL(file);
      onUpdate(id, { content: imageUrl });

      // TODO: Implement actual image upload to storage
      // For now, we'll keep using the blob URL
      // const formData = new FormData();
      // formData.append('image', file);
      // const response = await uploadToStorage(formData);
      // onUpdate(id, { content: response.url });
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  return (
    <div
      ref={elementRef}
      style={{
        position: 'absolute',
        left: `${elementPosition.x}px`,
        top: `${elementPosition.y}px`,
        width: `${elementSize.width}px`,
        height: `${elementSize.height}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        padding: '4px',
        border: '1px solid #e2e8f0',
        borderRadius: '4px',
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        userSelect: 'none',
        zIndex: isDragging ? 1000 : 1,
        ...style,
      }}
      onMouseDown={handleMouseDown}
      className="group"
    >
      {content ? (
        <img
          src={content}
          alt="Template element"
          className="w-full h-full object-contain"
          draggable={false}
          onError={() => {
            console.error('Image failed to load:', content);
            onUpdate(id, { content: '' });
          }}
        />
      ) : (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <label className="cursor-pointer flex flex-col items-center gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <Button variant="secondary" type="button">
              Upload Image
            </Button>
          </label>
        </div>
      )}
      
      <div className="absolute -top-8 right-0 hidden group-hover:flex gap-2 bg-white rounded-md shadow-sm p-1">
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            className="p-1 text-gray-500 hover:text-gray-700"
            title="Replace Image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </button>
        </label>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          className="p-1 text-gray-500 hover:text-red-600"
          title="Delete"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 group-hover:opacity-100"
        onMouseDown={handleResizeStart}
        style={{
          background: 'linear-gradient(135deg, transparent 50%, #718096 50%)',
        }}
      />
    </div>
  );
}
