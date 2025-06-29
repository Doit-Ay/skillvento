import React, { useState } from 'react';
import { Users, Copy, Check, Gift } from 'lucide-react';
import Button from '../common/Button';

interface ReferralCardProps {
  referralCode: string;
  referralCount: number;
  bonusUploads: number;
  username?: string;
}

const ReferralCard: React.FC<ReferralCardProps> = ({
  referralCode,
  referralCount,
  bonusUploads,
  username
}) => {
  const [copied, setCopied] = useState(false);

  // Use username-based referral link if username is available
  const referralLink = username 
    ? `${window.location.origin}/signup?ref=${username}`
    : `${window.location.origin}/signup?ref=${referralCode}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 sm:p-6 border border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Refer Friends</h3>
        <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
      </div>

      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-purple-600">{referralCount}</div>
            <div className="text-xs sm:text-sm text-gray-600">Referrals</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-600">+{bonusUploads}</div>
            <div className="text-xs sm:text-sm text-gray-600">Bonus Uploads</div>
          </div>
        </div>

        {/* Referral Link */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Your Referral Link
          </label>
          <div className="flex">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-xs sm:text-sm truncate"
            />
            <button
              onClick={copyToClipboard}
              className="px-2 sm:px-3 py-1 sm:py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700 transition-colors duration-200"
            >
              {copied ? <Check className="h-3 w-3 sm:h-4 sm:w-4" /> : <Copy className="h-3 w-3 sm:h-4 sm:w-4" />}
            </button>
          </div>
          {username && (
            <p className="text-xs text-gray-500 mt-1">
              Your referral code: <span className="font-mono font-bold">{username}</span>
            </p>
          )}
        </div>

        {/* Info */}
        <div className="bg-white/60 rounded-lg p-3 border border-purple-200">
          <p className="text-xs sm:text-sm text-gray-700">
            <strong>Earn +5 uploads</strong> for each friend who signs up using your link!
          </p>
        </div>

        {/* Share Button */}
        <Button
          variant="outline"
          size="sm"
          icon={Users}
          fullWidth
          className="border-purple-200 text-purple-600 hover:bg-purple-50"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'Join Skillvento',
                text: 'Build your professional portfolio with Skillvento!',
                url: referralLink
              });
            } else {
              copyToClipboard();
            }
          }}
        >
          Share Link
        </Button>
      </div>
    </div>
  );
};

export default ReferralCard;