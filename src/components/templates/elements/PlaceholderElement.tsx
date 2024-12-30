import React, { useState, useRef, useEffect, useCallback } from 'react';

interface PlaceholderElementProps {
  id: string;
  content: string;
  position: { x: number; y: number };
  style?: Record<string, string>;
  onUpdate: (id: string, updates: { content?: string; position?: { x: number; y: number }; style?: Record<string, string> }) => void;
  onDelete: (id: string) => void;
}

export function PlaceholderElement({ id, content, position, style = {}, onUpdate, onDelete }: PlaceholderElementProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [elementPosition, setElementPosition] = useState(position);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setElementPosition(position);
  }, [position]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === elementRef.current || (e.target as HTMLElement).classList.contains('placeholder-content')) {
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
    }
  }, [isDragging, dragStart, id, onUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={elementRef}
      style={{
        position: 'absolute',
        left: `${elementPosition.x}px`,
        top: `${elementPosition.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        padding: '8px',
        border: '1px solid #e2e8f0',
        borderRadius: '4px',
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        userSelect: 'none',
        zIndex: isDragging ? 1000 : 1,
        ...style,
      }}
      className="group"
      onMouseDown={handleMouseDown}
    >
      {isEditing ? (
        <input
          type="text"
          value={content.replace(/[{}]/g, '')}
          onChange={(e) => {
            const newValue = e.target.value.replace(/[^a-zA-Z0-9_.]/g, '');
            onUpdate(id, { content: `{{${newValue}}}` });
          }}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setIsEditing(false);
            }
          }}
          autoFocus
          className="bg-gray-100 border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="recipient.name"
        />
      ) : (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="placeholder-content bg-indigo-50 text-indigo-700 px-3 py-1 rounded cursor-text select-none"
        >
          {content || '{{recipient.name}}'}
        </div>
      )}
      
      <div className="absolute -top-8 right-0 hidden group-hover:flex gap-2 bg-white rounded-md shadow-sm p-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="p-1 text-gray-500 hover:text-gray-700"
          title="Edit"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
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
    </div>
  );
}
