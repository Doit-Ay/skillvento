import React, { useState, useEffect } from 'react';
import { Paintbrush, Check, Crown, Sparkles } from 'lucide-react';
import { auth, db } from '../../lib/supabase';
import { PortfolioTheme } from '../../types';
import Button from '../common/Button';

interface ThemeSelectorProps {
  onThemeChange: (theme: string, layout?: string) => void;
  currentTheme?: string;
  currentLayout?: string;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ 
  onThemeChange, 
  currentTheme = 'default',
  currentLayout = 'standard'
}) => {
  const [themes, setThemes] = useState<PortfolioTheme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const [selectedLayout, setSelectedLayout] = useState(currentLayout);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    loadThemes();
  }, []);
  
  const loadThemes = async () => {
    try {
      setLoading(true);
      const { data, error } = await db.getPortfolioThemes();
      
      if (error) throw error;
      
      setThemes(data || []);
    } catch (err: any) {
      console.error('Error loading themes:', err);
      setError(err.message || 'Failed to load themes');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveTheme = async () => {
    try {
      setSaving(true);
      const user = await auth.getCurrentUser();
      if (!user) throw new Error('User not authenticated');
      
      await db.updateUserPortfolioTheme(user.id, selectedTheme, selectedLayout);
      
      onThemeChange(selectedTheme, selectedLayout);
    } catch (err: any) {
      console.error('Error saving theme:', err);
      setError(err.message || 'Failed to save theme');
    } finally {
      setSaving(false);
    }
  };
  
  const layouts = [
    { id: 'standard', name: 'Standard', description: 'Classic portfolio layout' },
    { id: 'modern', name: 'Modern', description: 'Contemporary design with cards' },
    { id: 'minimal', name: 'Minimal', description: 'Clean and simple design' }
  ];
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Paintbrush className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Portfolio Theme</h3>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Paintbrush className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Portfolio Theme</h3>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Select Theme</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {themes.map(theme => (
            <div
              key={theme.id}
              onClick={() => setSelectedTheme(theme.id)}
              className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
                selectedTheme === theme.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Premium Badge */}
              {theme.is_premium && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                  <Crown className="h-3 w-3 mr-1" />
                  Pro
                </div>
              )}

              {/* Selection Indicator */}
              {selectedTheme === theme.id && (
                <div className="absolute top-3 right-3 bg-blue-500 text-white rounded-full p-1">
                  <Check className="h-3 w-3" />
                </div>
              )}
              
              {/* Theme Preview */}
              <div 
                className="w-full h-20 rounded mb-2" 
                style={{ 
                  background: `linear-gradient(to right, ${theme.primary_color}, ${theme.secondary_color})` 
                }}
              ></div>
              
              <h5 className="font-medium text-gray-900">{theme.name}</h5>
              <p className="text-xs text-gray-500 mt-1">{theme.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Select Layout</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {layouts.map(layout => (
            <div
              key={layout.id}
              onClick={() => setSelectedLayout(layout.id)}
              className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
                selectedLayout === layout.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Selection Indicator */}
              {selectedLayout === layout.id && (
                <div className="absolute top-3 right-3 bg-blue-500 text-white rounded-full p-1">
                  <Check className="h-3 w-3" />
                </div>
              )}
              
              <h5 className="font-medium text-gray-900">{layout.name}</h5>
              <p className="text-xs text-gray-500 mt-1">{layout.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          onClick={handleSaveTheme}
          loading={saving}
          icon={Sparkles}
        >
          Apply Theme
        </Button>
      </div>
    </div>
  );
};

export default ThemeSelector;