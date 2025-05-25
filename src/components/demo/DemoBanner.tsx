import React from 'react';
import { motion } from 'framer-motion';
import { Info, Eye, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDemoMode } from '@/providers/DemoProvider';
import { useNavigate } from 'react-router-dom';

interface DemoBannerProps {
  className?: string;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ className = '' }) => {
  const { isDemoMode, demoUser, setDemoUser } = useDemoMode();
  const navigate = useNavigate();

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
      className={`bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 shadow-lg ${className}`}
    >
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            <span className="font-semibold">Demo Mode</span>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            Exploring Botswana Civic Portal
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Info className="h-4 w-4" />
          <span className="hidden sm:inline">
            You're viewing realistic demo data showcasing platform features
          </span>
          <span className="sm:hidden">Demo data - explore freely</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">View as:</span>
          <Button
            variant={demoUser?.role === 'citizen' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => handleUserSwitch('citizen')}
            className={
              demoUser?.role === 'citizen'
                ? 'bg-white text-blue-600 hover:bg-gray-100'
                : 'border-white/30 text-white hover:bg-white/10'
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
                ? 'bg-white text-blue-600 hover:bg-gray-100'
                : 'border-white/30 text-white hover:bg-white/10'
            }
          >
            <Settings className="h-4 w-4 mr-1" />
            Stakeholder
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
