import React, { useState } from 'react';
import { Check, Palette } from 'lucide-react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);

  const presetColors = [
    '#3B82F6', '#8B5CF6', '#10B981', '#EF4444', '#F59E0B', '#14B8A6',
    '#EC4899', '#6366F1', '#84CC16', '#F97316', '#06B6D4', '#8B5A2B',
    '#1F2937', '#374151', '#4B5563', '#6B7280', '#9CA3AF', '#D1D5DB'
  ];

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors duration-200"
      >
        <div
          className="w-6 h-6 rounded border border-gray-200"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-mono">{color}</span>
        <Palette className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-20 min-w-[200px]">
            <div className="space-y-3">
              {/* Custom Color Input */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Custom Color
                </label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                />
              </div>

              {/* Preset Colors */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Preset Colors
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {presetColors.map((presetColor) => (
                    <button
                      key={presetColor}
                      onClick={() => {
                        onChange(presetColor);
                        setIsOpen(false);
                      }}
                      className="relative w-8 h-8 rounded border border-gray-200 hover:scale-110 transition-transform duration-200"
                      style={{ backgroundColor: presetColor }}
                    >
                      {color === presetColor && (
                        <Check className="h-4 w-4 text-white absolute inset-0 m-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hex Input */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Hex Code
                </label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                      onChange(value);
                    }
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="#3B82F6"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ColorPicker;