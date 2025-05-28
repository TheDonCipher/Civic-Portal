import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Smartphone,
  CreditCard,
  Building2,
  CheckCircle,
  Info,
  Zap,
  Shield,
  Clock,
  DollarSign,
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  fees: string;
  processingTime: string;
  availability: 'citizens' | 'businesses' | 'government' | 'all';
  recommended?: boolean;
  features: string[];
}

interface PaymentMethodSelectorProps {
  userRole: 'citizen' | 'official' | 'admin';
  subscriptionTier: string;
  amount: number;
  onMethodSelect: (methodId: string) => void;
  selectedMethod?: string;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  userRole,
  subscriptionTier,
  amount,
  onMethodSelect,
  selectedMethod,
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(selectedMethod || '');

  // Define payment methods based on user role and context
  const paymentMethods: PaymentMethod[] = [
    // Mobile Money Options (Citizens)
    {
      id: 'orange_money',
      name: 'Orange Money',
      description: 'Most popular mobile money service in Botswana',
      icon: Smartphone,
      fees: amount < 50 ? 'Free' : 'BWP 2',
      processingTime: 'Instant',
      availability: 'citizens',
      recommended: userRole === 'citizen' && amount < 100,
      features: [
        'Instant processing',
        'SMS confirmation',
        'No fees for small amounts',
        'Available 24/7',
      ],
    },
    {
      id: 'mascom_myzaka',
      name: 'Mascom MyZaka',
      description: 'Reliable mobile money with wide network coverage',
      icon: Smartphone,
      fees: 'BWP 1.50',
      processingTime: '30-60 seconds',
      availability: 'citizens',
      features: [
        'Wide network coverage',
        'SMS confirmation',
        'Standard network rates',
        'Available 24/7',
      ],
    },
    {
      id: 'btc_smega',
      name: 'BTC Smega',
      description: 'Bank-backed mobile money solution',
      icon: Smartphone,
      fees: 'BWP 2',
      processingTime: '1-2 minutes',
      availability: 'citizens',
      features: [
        'Bank-backed security',
        'SMS confirmation',
        'Lower fees for larger amounts',
        'Available 24/7',
      ],
    },
    // Request.Finance (Businesses & Government)
    {
      id: 'request_finance',
      name: 'Request.Finance',
      description: 'Professional payment processing for businesses and government',
      icon: CreditCard,
      fees: '2.5% + BWP 5',
      processingTime: '1-3 business days',
      availability: 'businesses',
      recommended: userRole === 'official' || (userRole === 'citizen' && amount > 500),
      features: [
        'Professional invoicing',
        'Multi-currency support',
        'Detailed reporting',
        'Compliance ready',
        'API integration',
      ],
    },
    // Bank Transfer (Government)
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      description: 'Direct bank transfer for government and large organizations',
      icon: Building2,
      fees: 'BWP 10-25',
      processingTime: '1-2 business days',
      availability: 'government',
      recommended: userRole === 'official' && subscriptionTier === 'kgotla',
      features: [
        'Government procurement compliant',
        'Formal invoicing',
        'Quarterly billing available',
        'VAT documentation',
        'Audit trail',
      ],
    },
    // E-Wallet (Citizens)
    {
      id: 'e_wallet',
      name: 'Digital Wallet',
      description: 'Secure digital wallet for online payments',
      icon: CreditCard,
      fees: '1.5%',
      processingTime: 'Instant',
      availability: 'citizens',
      features: [
        'Instant processing',
        'Secure encryption',
        'Transaction history',
        'Refund protection',
      ],
    },
  ];

  // Filter payment methods based on user role
  const availableMethods = paymentMethods.filter(method => {
    if (method.availability === 'all') return true;
    if (method.availability === 'citizens' && userRole === 'citizen') return true;
    if (method.availability === 'businesses' && (userRole === 'official' || userRole === 'admin')) return true;
    if (method.availability === 'government' && userRole === 'official') return true;
    return false;
  });

  const handleMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
    onMethodSelect(methodId);
  };

  const getMethodIcon = (method: PaymentMethod) => {
    return React.createElement(method.icon, { 
      className: "w-6 h-6 text-blue-600" 
    });
  };

  const getRoleBasedTitle = () => {
    switch (userRole) {
      case 'citizen':
        return 'Choose Your Payment Method';
      case 'official':
        return 'Government Payment Options';
      case 'admin':
        return 'Administrative Payment Methods';
      default:
        return 'Select Payment Method';
    }
  };

  const getRoleBasedDescription = () => {
    switch (userRole) {
      case 'citizen':
        return 'Select from mobile money services and digital payment options available in Botswana';
      case 'official':
        return 'Choose from government-approved payment methods with proper documentation and compliance';
      case 'admin':
        return 'Administrative payment processing with full audit trails and reporting';
      default:
        return 'Choose your preferred payment method';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{getRoleBasedTitle()}</h2>
        <p className="text-muted-foreground">{getRoleBasedDescription()}</p>
      </div>

      {/* Payment Amount Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Subscription Amount</p>
              <p className="text-2xl font-bold text-blue-600">BWP {amount}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Billing Cycle</p>
              <p className="font-medium">Monthly</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <RadioGroup value={selectedPaymentMethod} onValueChange={handleMethodSelect}>
        <div className="space-y-4">
          {availableMethods.map((method) => (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedPaymentMethod === method.id 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' 
                  : 'hover:border-blue-300'
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                    <div className="flex-1 space-y-4">
                      <Label htmlFor={method.id} className="cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getMethodIcon(method)}
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{method.name}</h3>
                                {method.recommended && (
                                  <Badge className="bg-green-100 text-green-800">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Recommended
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{method.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <DollarSign className="w-4 h-4" />
                              <span>{method.fees}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{method.processingTime}</span>
                            </div>
                          </div>
                        </div>
                      </Label>

                      {/* Features */}
                      <div className="grid grid-cols-2 gap-2">
                        {method.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Special notices for specific methods */}
                      {method.id === 'orange_money' && amount < 50 && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                          <Info className="w-4 h-4 text-green-600" />
                          <p className="text-sm text-green-700 dark:text-green-300">
                            No transaction fees for contributions under BWP 50!
                          </p>
                        </div>
                      )}

                      {method.id === 'request_finance' && userRole === 'official' && (
                        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                          <Shield className="w-4 h-4 text-blue-600" />
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Includes formal invoicing and government procurement compliance
                          </p>
                        </div>
                      )}

                      {method.id === 'bank_transfer' && (
                        <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                          <Building2 className="w-4 h-4 text-purple-600" />
                          <p className="text-sm text-purple-700 dark:text-purple-300">
                            PPADB compliant with quarterly billing options available
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </RadioGroup>

      {/* Security Notice */}
      <Card className="border-green-200 bg-green-50 dark:bg-green-950/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800 dark:text-green-200">Secure Payment Processing</p>
              <p className="text-sm text-green-700 dark:text-green-300">
                All payments are processed securely with bank-level encryption. Your financial information is never stored on our servers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="w-5 h-5" />
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Having trouble with payment setup? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="gap-2">
              <Smartphone className="w-4 h-4" />
              WhatsApp: +267 72977535
            </Button>
            <Button variant="outline" className="gap-2">
              <Info className="w-4 h-4" />
              Payment Guide
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentMethodSelector;
