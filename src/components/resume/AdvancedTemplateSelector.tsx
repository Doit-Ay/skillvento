import React from 'react';
import { Check, Crown, Sparkles } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
  isPremium?: boolean;
  category: string;
}

interface AdvancedTemplateSelectorProps {
  selectedTemplate: string;
  onTemplateChange: (template: string) => void;
}

const AdvancedTemplateSelector: React.FC<AdvancedTemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateChange
}) => {
  const templates: Template[] = [
    {
      id: 'modern',
      name: 'Modern Professional',
      description: 'Clean design with color accents and modern typography',
      preview: 'bg-gradient-to-br from-blue-50 to-blue-100',
      category: 'Professional'
    },
    {
      id: 'classic',
      name: 'Classic Executive',
      description: 'Traditional layout perfect for corporate roles',
      preview: 'bg-gradient-to-br from-gray-50 to-gray-100',
      category: 'Professional'
    },
    {
      id: 'creative',
      name: 'Creative Designer',
      description: 'Bold and artistic design for creative professionals',
      preview: 'bg-gradient-to-br from-purple-50 to-pink-100',
      category: 'Creative',
      isPremium: true
    },
    {
      id: 'minimal',
      name: 'Minimal Clean',
      description: 'Simple and elegant with lots of white space',
      preview: 'bg-white border-2 border-gray-200',
      category: 'Minimal'
    },
    {
      id: 'tech',
      name: 'Tech Developer',
      description: 'Perfect for software developers and engineers',
      preview: 'bg-gradient-to-br from-green-50 to-green-100',
      category: 'Tech',
      isPremium: true
    },
    {
      id: 'executive',
      name: 'Senior Executive',
      description: 'Sophisticated design for C-level positions',
      preview: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
      category: 'Executive',
      isPremium: true
    }
  ];

  const categories = [...new Set(templates.map(t => t.category))];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Choose Your Template</h3>
        <p className="text-gray-600 text-sm">Select a template that matches your industry and style</p>
      </div>

      {categories.map(category => (
        <div key={category}>
          <h4 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">
            {category}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates
              .filter(template => template.category === category)
              .map((template) => (
                <div
                  key={template.id}
                  onClick={() => onTemplateChange(template.id)}
                  className={`relative cursor-pointer rounded-xl border-2 p-4 hover:shadow-md transition-all duration-200 ${
                    selectedTemplate === template.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Premium Badge */}
                  {template.isPremium && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <Crown className="h-3 w-3 mr-1" />
                      Pro
                    </div>
                  )}

                  {/* Selection Indicator */}
                  {selectedTemplate === template.id && (
                    <div className="absolute top-3 right-3 bg-blue-500 text-white rounded-full p-1">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  
                  {/* Template Preview */}
                  <div className={`w-full h-32 rounded-lg mb-4 flex items-center justify-center ${template.preview} relative overflow-hidden`}>
                    {/* Mock content */}
                    <div className="absolute inset-4 space-y-2">
                      <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                      <div className="space-y-1 mt-3">
                        <div className="h-1 bg-gray-200 rounded w-full"></div>
                        <div className="h-1 bg-gray-200 rounded w-4/5"></div>
                        <div className="h-1 bg-gray-200 rounded w-3/5"></div>
                      </div>
                      <div className="flex space-x-1 mt-2">
                        <div className="h-1 bg-blue-300 rounded w-8"></div>
                        <div className="h-1 bg-green-300 rounded w-6"></div>
                        <div className="h-1 bg-purple-300 rounded w-10"></div>
                      </div>
                    </div>
                    
                    {/* Template-specific styling */}
                    {template.id === 'modern' && (
                      <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-r from-blue-500 to-purple-500 opacity-80"></div>
                    )}
                    {template.id === 'creative' && (
                      <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full opacity-60"></div>
                    )}
                    {template.id === 'tech' && (
                      <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 opacity-60" style={{ clipPath: 'polygon(100% 0, 0% 100%, 100% 100%)' }}></div>
                    )}
                  </div>
                  
                  {/* Template Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1 flex items-center">
                      {template.name}
                      {template.isPremium && (
                        <Sparkles className="h-4 w-4 ml-2 text-yellow-500" />
                      )}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{template.description}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}

      {/* Template Features */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
          Template Features
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center text-gray-700">
              <Check className="h-4 w-4 mr-2 text-green-500" />
              Live editing with instant preview
            </div>
            <div className="flex items-center text-gray-700">
              <Check className="h-4 w-4 mr-2 text-green-500" />
              Fully customizable colors and fonts
            </div>
            <div className="flex items-center text-gray-700">
              <Check className="h-4 w-4 mr-2 text-green-500" />
              ATS-friendly formatting
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-gray-700">
              <Check className="h-4 w-4 mr-2 text-green-500" />
              Professional layouts
            </div>
            <div className="flex items-center text-gray-700">
              <Check className="h-4 w-4 mr-2 text-green-500" />
              Multiple export formats
            </div>
            <div className="flex items-center text-gray-700">
              <Check className="h-4 w-4 mr-2 text-green-500" />
              Mobile-responsive design
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedTemplateSelector;