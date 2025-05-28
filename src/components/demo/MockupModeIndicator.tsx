import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Eye,
  Sparkles,
  ArrowLeft,
  Home,
  Info,
  Lightbulb,
} from 'lucide-react';

/**
 * MockupModeIndicator Component
 * 
 * Displays a prominent indicator when users are viewing UI mockups,
 * providing context and navigation options back to the main application.
 */

interface MockupModeIndicatorProps {
  className?: string;
  showNavigation?: boolean;
}

const MockupModeIndicator: React.FC<MockupModeIndicatorProps> = ({
  className = '',
  showNavigation = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isMockupPage = location.pathname.includes('/demo/mmogo-ecosystem');

  if (!isMockupPage) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg ${className}`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-white/20 rounded">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-semibold text-sm">UI Mockup Showcase</span>
            </div>
            
            <Badge className="bg-white/20 text-white border-white/30 text-xs">
              Mmogo Impact Ecosystem
            </Badge>
            
            <div className="hidden md:flex items-center gap-2 text-sm">
              <Info className="h-4 w-4" />
              <span>Visual demonstration of business model integration</span>
            </div>
          </div>

          {showNavigation && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/demo')}
                className="text-white hover:bg-white/20 text-xs"
              >
                <Eye className="h-4 w-4 mr-1" />
                Demo Mode
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="text-white hover:bg-white/20 text-xs"
              >
                <Home className="h-4 w-4 mr-1" />
                Main App
              </Button>
            </div>
          )}
        </div>

        {/* Additional Context */}
        <div className="mt-2 text-xs text-purple-100">
          <div className="flex items-center gap-4">
            <span>🎨 Visual mockups only</span>
            <span>📱 Mobile responsive</span>
            <span>🌙 Dark mode supported</span>
            <span>🇧🇼 Botswana-focused design</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MockupModeIndicator;
