import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Info,
  Eye,
  Users,
  Settings,
  Crown,
  Building2,
  Star,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useDemoMode } from '@/providers/DemoProvider';
import { useNavigate } from 'react-router-dom';
import SubscriptionDevTools from '@/components/dev/SubscriptionDevTools';

interface DemoBannerProps {
  className?: string;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ className = '' }) => {
  const { isDemoMode, demoUser, setDemoUser } = useDemoMode();
  const navigate = useNavigate();
  const [showBusinessModel, setShowBusinessModel] = useState(false);

  if (!isDemoMode) return null;

  const handleUserSwitch = (userType: 'citizen' | 'stakeholder') => {
    if (userType === 'citizen') {
      // Switch to a citizen user
      const citizenUser = {
        id: 'demo-citizen',
        full_name: 'Thabo Mogale',
        username: 'thabo.mogale',
        role: 'citizen',
        constituency: 'Gaborone central',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=thabo',
      };
      setDemoUser(citizenUser);
      navigate('/demo');
    } else {
      // Switch to a stakeholder user
      const stakeholderUser = {
        id: 'demo-stakeholder',
        full_name: 'Kefilwe Seretse',
        username: 'kefilwe.seretse',
        role: 'official',
        department: 'transport-infrastructure',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kefilwe',
      };
      setDemoUser(stakeholderUser);
      navigate('/demo/stakeholder');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 text-white p-4 shadow-lg ${className}`}
    >
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            <span className="font-semibold">Demo Mode</span>
          </div>
          <Badge
            variant="secondary"
            className="bg-white/20 dark:bg-white/30 text-white border-white/30 dark:border-white/40"
          >
            Exploring Botswana Civic Portal
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Info className="h-4 w-4" />
          <span className="hidden sm:inline">
            Exploring the Mmogo Impact Ecosystem - realistic demo data
            showcasing our 4-tier business model
          </span>
          <span className="sm:hidden">Mmogo Impact Demo</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">View as:</span>
          <Button
            variant={demoUser?.role === 'citizen' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => handleUserSwitch('citizen')}
            className={
              demoUser?.role === 'citizen'
                ? 'bg-white text-blue-600 hover:bg-gray-100 dark:bg-gray-100 dark:text-blue-700 dark:hover:bg-gray-200'
                : 'border-white/30 dark:border-white/40 text-white hover:bg-white/10 dark:hover:bg-white/20'
            }
          >
            <Users className="h-4 w-4 mr-1" />
            Citizen
          </Button>
          <Button
            variant={demoUser?.role === 'official' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => handleUserSwitch('stakeholder')}
            className={
              demoUser?.role === 'official'
                ? 'bg-white text-blue-600 hover:bg-gray-100 dark:bg-gray-100 dark:text-blue-700 dark:hover:bg-gray-200'
                : 'border-white/30 dark:border-white/40 text-white hover:bg-white/10 dark:hover:bg-white/20'
            }
          >
            <Settings className="h-4 w-4 mr-1" />
            Stakeholder
          </Button>
        </div>

        {/* Business Model Showcase Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowBusinessModel(!showBusinessModel)}
          className="border-white/30 dark:border-white/40 text-white hover:bg-white/10 dark:hover:bg-white/20"
        >
          {showBusinessModel ? (
            <ChevronUp className="h-4 w-4 mr-1" />
          ) : (
            <ChevronDown className="h-4 w-4 mr-1" />
          )}
          Mmogo Ecosystem
        </Button>
      </div>

      {/* Business Model Showcase */}
      {showBusinessModel && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 border-t border-white/20 dark:border-white/30 pt-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Motse Platform - Free */}
            <Card className="bg-white/10 dark:bg-white/20 border-white/20 dark:border-white/30 text-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-green-400 dark:text-green-300" />
                  <h4 className="font-semibold">Motse Platform</h4>
                </div>
                <p className="text-sm text-white/80 dark:text-white/90 mb-2">
                  Free for all citizens
                </p>
                <Badge className="bg-green-500/20 dark:bg-green-500/30 text-green-300 dark:text-green-200 border-green-400/30 dark:border-green-400/40">
                  FREE Forever
                </Badge>
              </CardContent>
            </Card>

            {/* Thusang Projects */}
            <Card className="bg-white/10 dark:bg-white/20 border-white/20 dark:border-white/30 text-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-5 w-5 text-blue-400 dark:text-blue-300" />
                  <h4 className="font-semibold">Thusang Projects</h4>
                </div>
                <p className="text-sm text-white/80 dark:text-white/90 mb-2">
                  Community crowdfunding
                </p>
                <Badge className="bg-blue-500/20 dark:bg-blue-500/30 text-blue-300 dark:text-blue-200 border-blue-400/30 dark:border-blue-400/40">
                  5-7% Project Fee
                </Badge>
              </CardContent>
            </Card>

            {/* Tirisano Mmogo Business */}
            <Card className="bg-white/10 dark:bg-white/20 border-white/20 dark:border-white/30 text-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-5 w-5 text-purple-400 dark:text-purple-300" />
                  <h4 className="font-semibold">Tirisano Mmogo</h4>
                </div>
                <p className="text-sm text-white/80 dark:text-white/90 mb-2">
                  Business partnerships
                </p>
                <Badge className="bg-purple-500/20 dark:bg-purple-500/30 text-purple-300 dark:text-purple-200 border-purple-400/30 dark:border-purple-400/40">
                  BWP 200-1500+/mo
                </Badge>
              </CardContent>
            </Card>

            {/* Kgotla+ Governance */}
            <Card className="bg-white/10 dark:bg-white/20 border-white/20 dark:border-white/30 text-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-5 w-5 text-yellow-400 dark:text-yellow-300" />
                  <h4 className="font-semibold">Kgotla+ Governance</h4>
                </div>
                <p className="text-sm text-white/80 dark:text-white/90 mb-2">
                  Government solutions
                </p>
                <Badge className="bg-yellow-500/20 dark:bg-yellow-500/30 text-yellow-300 dark:text-yellow-200 border-yellow-400/30 dark:border-yellow-400/40">
                  BWP 750-6500/mo
                </Badge>
              </CardContent>
            </Card>
          </div>

          <div className="mt-4 flex justify-center gap-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/pricing')}
              className="bg-white text-blue-600 hover:bg-gray-100 dark:bg-gray-100 dark:text-blue-700 dark:hover:bg-gray-200"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Pricing Page
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/demo/mmogo-ecosystem')}
              className="bg-white text-purple-600 hover:bg-gray-100 dark:bg-gray-100 dark:text-purple-700 dark:hover:bg-gray-200"
            >
              <Eye className="h-4 w-4 mr-2" />
              View UI Mockups
            </Button>
          </div>
        </motion.div>
      )}

      {/* Subscription Dev Tools - Only in demo mode */}
      <SubscriptionDevTools />
    </motion.div>
  );
};
