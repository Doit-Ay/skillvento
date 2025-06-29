import React, { useState } from 'react';
import { Upload, Crown, Users, Sparkles } from 'lucide-react';
import Button from '../common/Button';
import UpgradeModal from './UpgradeModal';

interface UploadLimitCardProps {
  current: number;
  limit: number;
  bonusUploads: number;
}

const UploadLimitCard: React.FC<UploadLimitCardProps> = ({
  current,
  limit,
  bonusUploads
}) => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const percentage = (current / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = current >= limit;

  const handleUpgradeSuccess = () => {
    setShowUpgradeModal(false);
    // Reload the page to reflect the new plan
    window.location.reload();
  };

  return (
    <>
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Upload Limit</h3>
          <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        </div>

        <div className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs sm:text-sm mb-2">
              <span className="text-gray-600">Used</span>
              <span className={`font-medium ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-orange-600' : 'text-gray-900'}`}>
                {current} / {limit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-orange-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Bonus Uploads */}
          {bonusUploads > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center">
                <Users className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-green-800">
                  +{bonusUploads} bonus uploads from referrals
                </span>
              </div>
            </div>
          )}

          {/* Status Message */}
          <div className="text-xs sm:text-sm">
            {isAtLimit ? (
              <p className="text-red-600">
                You've reached your upload limit. Upgrade to Pro or refer friends to continue.
              </p>
            ) : isNearLimit ? (
              <p className="text-orange-600">
                You're approaching your upload limit ({limit - current} remaining).
              </p>
            ) : (
              <p className="text-gray-600">
                You have {limit - current} uploads remaining.
              </p>
            )}
          </div>

          {/* Upgrade Button */}
          <Button
            variant="outline"
            size="sm"
            icon={Crown}
            fullWidth
            className="border-purple-200 text-purple-600 hover:bg-purple-50 relative overflow-hidden group"
            onClick={() => setShowUpgradeModal(true)}
          >
            <span className="relative z-10 flex items-center">
              <Sparkles className="h-4 w-4 mr-2" />
              Upgrade to Pro
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
          </Button>

          {/* Pro Benefits Preview */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
            <h4 className="text-xs sm:text-sm font-medium text-purple-900 mb-2">Pro Benefits</h4>
            <ul className="text-xs text-purple-700 space-y-1">
              <li>• Up to 50 certificate uploads</li>
              <li>• Premium portfolio themes</li>
              <li>• Advanced analytics</li>
              <li>• Priority support</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal
          onClose={() => setShowUpgradeModal(false)}
          onSuccess={handleUpgradeSuccess}
        />
      )}
    </>
  );
};

export default UploadLimitCard;