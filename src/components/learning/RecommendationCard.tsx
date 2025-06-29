import React from 'react';
import { ExternalLink, Lightbulb, X, ThumbsUp, ThumbsDown } from 'lucide-react';
import { LearningRecommendation } from '../../types';
import { db } from '../../lib/supabase';
import Button from '../common/Button';

interface RecommendationCardProps {
  recommendation: LearningRecommendation;
  onDismiss: (id: string) => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation, onDismiss }) => {
  const handleDismiss = async () => {
    try {
      await db.dismissLearningRecommendation(recommendation.id);
      onDismiss(recommendation.id);
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
    }
  };
  
  const getProviderLogo = (provider: string) => {
    const logos: Record<string, string> = {
      'Coursera': 'https://d3njjcbhbojbot.cloudfront.net/web/images/favicons/favicon-v2-194x194.png',
      'Udemy': 'https://www.udemy.com/staticx/udemy/images/v7/logo-udemy.svg',
      'Frontend Masters': 'https://frontendmasters.com/static-assets/fm-meta-logo.png',
      'A Cloud Guru': 'https://acloudguru.com/favicon.ico',
      'CompTIA': 'https://www.comptia.org/favicon.ico',
      'PortSwigger': 'https://portswigger.net/content/images/logos/portswigger-logo.svg',
      'Microsoft Learn': 'https://learn.microsoft.com/favicon.ico'
    };
    
    return logos[provider] || 'https://via.placeholder.com/40';
  };
  
  const getConfidenceLabel = (score: number) => {
    if (score >= 0.9) return 'Very High';
    if (score >= 0.7) return 'High';
    if (score >= 0.5) return 'Medium';
    return 'Low';
  };
  
  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-100 text-green-800';
    if (score >= 0.7) return 'bg-blue-100 text-blue-800';
    if (score >= 0.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };
  
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-4 relative">
      <div className="absolute top-3 right-3">
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          title="Dismiss recommendation"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-4">
          <img 
            src={getProviderLogo(recommendation.provider)} 
            alt={recommendation.provider} 
            className="w-10 h-10 rounded-lg object-contain bg-white p-1"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center mb-1">
            <Lightbulb className="h-4 w-4 text-yellow-500 mr-1" />
            <span className="text-xs font-medium text-blue-600">Recommended for you</span>
            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${getConfidenceColor(recommendation.confidence_score)}`}>
              {getConfidenceLabel(recommendation.confidence_score)} Match
            </span>
          </div>
          
          <h3 className="text-base font-semibold text-gray-900 mb-1">{recommendation.title}</h3>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recommendation.description}</p>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                {recommendation.domain}
              </span>
              <span className="text-xs text-gray-500 ml-2">{recommendation.provider}</span>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                icon={ExternalLink}
                onClick={() => window.open(recommendation.url, '_blank')}
                className="text-xs py-1 px-2"
              >
                View Course
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-end mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500 mr-2">Was this helpful?</div>
            <button className="p-1 text-gray-400 hover:text-green-600 transition-colors duration-200">
              <ThumbsUp className="h-4 w-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200">
              <ThumbsDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;