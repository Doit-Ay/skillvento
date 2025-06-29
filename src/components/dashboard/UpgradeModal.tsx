import React, { useState } from 'react';
import { X, Crown, Check, Sparkles, Zap, Award, Shield, Download, Mail } from 'lucide-react';
import Button from '../common/Button';

interface UpgradeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface PricingPlan {
  id: string;
  name: string;
  certificates: number;
  price: number;
  originalPrice?: number;
  popular?: boolean;
  features: string[];
  color: string;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ onClose, onSuccess }) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'plans' | 'payment'>('plans');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [showComingSoon, setShowComingSoon] = useState(false);

  const pricingPlans: PricingPlan[] = [
    {
      id: 'starter',
      name: 'Starter',
      certificates: 10,
      price: 100,
      features: [
        '10 Certificate uploads',
        'Basic portfolio',
        'PDF & Image downloads',
        'Email support'
      ],
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'professional',
      name: 'Professional',
      certificates: 20,
      price: 200,
      popular: true,
      features: [
        '20 Certificate uploads',
        'Premium portfolio themes',
        'Advanced analytics',
        'QR code generation',
        'Priority support'
      ],
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'business',
      name: 'Business',
      certificates: 30,
      price: 300,
      features: [
        '30 Certificate uploads',
        'Team collaboration',
        'Custom branding',
        'API access',
        'Dedicated support'
      ],
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      certificates: 40,
      price: 400,
      features: [
        '40 Certificate uploads',
        'Unlimited team members',
        'White-label solution',
        'Advanced integrations',
        '24/7 phone support'
      ],
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'unlimited',
      name: 'Unlimited',
      certificates: 50,
      price: 500,
      features: [
        '50 Certificate uploads',
        'Everything included',
        'Custom development',
        'Personal account manager',
        'SLA guarantee'
      ],
      color: 'from-red-500 to-red-600'
    }
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleContinueToPayment = () => {
    if (!selectedPlan) {
      setError('Please select a plan');
      return;
    }
    setStep('payment');
  };

  const handlePayment = () => {
    setShowComingSoon(true);
  };

  const selectedPlanData = pricingPlans.find(plan => plan.id === selectedPlan);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Crown className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {step === 'plans' ? 'Upgrade to Pro' : 'Complete Payment'}
                </h2>
                <p className="text-gray-600">
                  {step === 'plans' 
                    ? 'Choose the perfect plan for your needs' 
                    : 'Secure payment processing'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          {/* Coming Soon Modal */}
          {showComingSoon && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon!</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Our payment system is currently under development and will be available soon. 
                  We're working hard to bring you the best experience possible.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center mb-2">
                    <Mail className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-900">Need Support?</span>
                  </div>
                  <p className="text-blue-700 text-sm">
                    Contact us at: <a href="mailto:support@skillvento.com" className="font-semibold underline">support@skillvento.com</a>
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowComingSoon(false)}
                    fullWidth
                  >
                    Go Back
                  </Button>
                  <Button
                    onClick={() => {
                      setShowComingSoon(false);
                      onClose();
                    }}
                    fullWidth
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 'plans' ? (
            <>
              {/* Pricing Plans */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => handlePlanSelect(plan.id)}
                    className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 hover:shadow-lg ${
                      selectedPlan === plan.id
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${plan.popular ? 'ring-2 ring-purple-500 ring-opacity-50' : ''}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}
                    
                    <div className={`w-12 h-12 bg-gradient-to-r ${plan.color} rounded-lg flex items-center justify-center mb-4`}>
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <div className="flex items-baseline">
                        <span className="text-2xl font-bold text-gray-900">
                          ₹{plan.price}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">per 6 months</p>
                      <p className="text-sm font-medium text-blue-600">
                        {plan.certificates} certificates
                      </p>
                    </div>
                    
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    {selectedPlan === plan.id && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              {selectedPlan && (
                <div className="bg-blue-50 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{selectedPlanData?.name} Plan</span>
                      <span className="font-medium">₹{selectedPlanData?.price}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>₹{selectedPlanData?.price}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Continue Button */}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  fullWidth
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleContinueToPayment}
                  disabled={!selectedPlan}
                  fullWidth
                >
                  Continue to Payment
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Payment Step */}
              <div className="max-w-2xl mx-auto">
                {/* Order Summary */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 bg-gradient-to-r ${selectedPlanData?.color} rounded-lg flex items-center justify-center mr-3`}>
                        <Crown className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{selectedPlanData?.name} Plan</p>
                        <p className="text-sm text-gray-600">{selectedPlanData?.certificates} certificates • 6 months</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">₹{selectedPlanData?.price}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Form */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                  
                  {/* Payment Methods */}
                  <div className="space-y-4 mb-6">
                    <div 
                      className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors duration-200 ${
                        paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setPaymentMethod('card')}
                    >
                      <input
                        type="radio"
                        id="card"
                        name="payment"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="card" className="flex-1 flex items-center cursor-pointer">
                        <div className="bg-blue-100 p-2 rounded mr-3">
                          <Download className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Credit/Debit Card</p>
                          <p className="text-sm text-gray-600">Visa, Mastercard, RuPay</p>
                        </div>
                      </label>
                    </div>
                    
                    <div 
                      className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors duration-200 ${
                        paymentMethod === 'upi' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setPaymentMethod('upi')}
                    >
                      <input
                        type="radio"
                        id="upi"
                        name="payment"
                        checked={paymentMethod === 'upi'}
                        onChange={() => setPaymentMethod('upi')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="upi" className="flex-1 flex items-center cursor-pointer">
                        <div className="bg-green-100 p-2 rounded mr-3">
                          <Zap className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">UPI</p>
                          <p className="text-sm text-gray-600">Pay with any UPI app</p>
                        </div>
                      </label>
                    </div>
                    
                    <div 
                      className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors duration-200 ${
                        paymentMethod === 'netbanking' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setPaymentMethod('netbanking')}
                    >
                      <input
                        type="radio"
                        id="netbanking"
                        name="payment"
                        checked={paymentMethod === 'netbanking'}
                        onChange={() => setPaymentMethod('netbanking')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="netbanking" className="flex-1 flex items-center cursor-pointer">
                        <div className="bg-purple-100 p-2 rounded mr-3">
                          <Shield className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Net Banking</p>
                          <p className="text-sm text-gray-600">All major banks supported</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-green-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-green-900">Secure Payment</p>
                        <p className="text-sm text-green-700">
                          Your payment information is encrypted and secure. We never store your card details.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep('plans')}
                    fullWidth
                    disabled={loading}
                  >
                    Back to Plans
                  </Button>
                  <Button
                    onClick={handlePayment}
                    loading={loading}
                    fullWidth
                    icon={Crown}
                  >
                    Pay ₹{selectedPlanData?.price}
                  </Button>
                </div>

                {/* Coming Soon Notice */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Sparkles className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Payment System Coming Soon</p>
                      <p className="text-sm text-blue-700">
                        Our secure payment gateway is currently under development. Contact support for early access.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;