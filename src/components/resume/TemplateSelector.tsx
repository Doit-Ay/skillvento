import React from 'react';
import { Check } from 'lucide-react';

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateChange: (template: string) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateChange
}) => {
  const templates = [
    {
      id: 'modern',
      name: 'Modern',
      description: 'Clean and contemporary design with bold headers',
      preview: 'bg-gradient-to-br from-blue-50 to-blue-100'
    },
    {
      id: 'classic',
      name: 'Classic',
      description: 'Traditional layout with professional styling',
      preview: 'bg-gradient-to-br from-gray-50 to-gray-100'
    },
    {
      id: 'creative',
      name: 'Creative',
      description: 'Unique design with creative elements',
      preview: 'bg-gradient-to-br from-purple-50 to-pink-100'
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Simple and clean with lots of white space',
      preview: 'bg-white border-2 border-gray-200'
    },
    {
      id: 'timeline',
      name: 'Timeline',
      description: 'Chronological layout with timeline design',
      preview: 'bg-gradient-to-br from-green-50 to-green-100'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Choose Template</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => onTemplateChange(template.id)}
            className={`relative cursor-pointer rounded-lg border-2 p-4 hover:shadow-md transition-all duration-200 ${
              selectedTemplate === template.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {selectedTemplate === template.id && (
              <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                <Check className="h-3 w-3" />
              </div>
            )}
            
            <div className={`w-full h-24 rounded ${template.preview} mb-3 flex items-center justify-center`}>
              <div className="text-xs text-gray-500">Preview</div>
            </div>
            
            <h4 className="font-medium text-gray-900 mb-1">{template.name}</h4>
            <p className="text-sm text-gray-600">{template.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;