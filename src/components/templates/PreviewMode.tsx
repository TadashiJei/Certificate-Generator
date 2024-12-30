import React, { useState } from 'react';
import { Button } from '../ui/Button';

interface Element {
  id: string;
  type: 'text' | 'image' | 'shape' | 'placeholder';
  content: string;
  position: { x: number; y: number };
  style?: Record<string, string>;
}

interface TemplateProperties {
  size: {
    width: number;
    height: number;
    unit: 'mm' | 'in' | 'px';
  };
  orientation: 'portrait' | 'landscape';
  background: {
    type: 'color' | 'image';
    value: string;
  };
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
    unit: 'mm' | 'in' | 'px';
  };
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
    unit: 'mm' | 'in' | 'px';
  };
}

interface PreviewModeProps {
  elements: Element[];
  properties: TemplateProperties;
  onClose: () => void;
}

const sampleData = {
  recipient: {
    name: 'John Doe',
    email: 'john@example.com',
    company: 'Acme Corp',
    position: 'Senior Developer',
  },
  issuer: {
    name: 'Jane Smith',
    title: 'CEO',
    signature: '//signature-placeholder.png',
  },
  certificate: {
    title: 'Certificate of Achievement',
    course: 'Advanced Web Development',
    date: new Date().toLocaleDateString(),
    id: 'CERT-123-456-789',
  },
};

export function PreviewMode({ elements, properties, onClose }: PreviewModeProps) {
  const [data, setData] = useState(sampleData);

  const replaceVariables = (content: string) => {
    return content.replace(/\{\{(.*?)\}\}/g, (match, key) => {
      const keys = key.trim().split('.');
      let value = data;
      for (const k of keys) {
        value = value?.[k];
      }
      return value || match;
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-medium">Preview Mode</h2>
          <Button onClick={onClose} variant="secondary">Close Preview</Button>
        </div>
        
        <div className="p-6 grid grid-cols-3 gap-6">
          {/* Preview Canvas */}
          <div className="col-span-2 overflow-auto">
            <div
              className="bg-white border rounded-lg shadow-sm relative mx-auto"
              style={{
                width: `${properties.size.width * 96}px`,
                height: `${properties.size.height * 96}px`,
                margin: '0 auto',
                background: properties.background.type === 'color'
                  ? properties.background.value
                  : `url(${properties.background.value}) center/cover no-repeat`,
                transform: properties.orientation === 'landscape' ? 'rotate(90deg)' : 'none',
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  margin: `${properties.margins.top * 96}px ${properties.margins.right * 96}px ${properties.margins.bottom * 96}px ${properties.margins.left * 96}px`,
                  padding: `${properties.padding.top * 96}px ${properties.padding.right * 96}px ${properties.padding.bottom * 96}px ${properties.padding.left * 96}px`,
                }}
              >
                {elements.map((element) => (
                  <div
                    key={element.id}
                    style={{
                      position: 'absolute',
                      left: `${element.position.x}px`,
                      top: `${element.position.y}px`,
                      ...element.style,
                    }}
                  >
                    {element.type === 'placeholder' 
                      ? replaceVariables(element.content)
                      : element.content}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sample Data Editor */}
          <div className="col-span-1 bg-gray-50 p-4 rounded-lg overflow-y-auto">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Sample Data</h3>
            <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
