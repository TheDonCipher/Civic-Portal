import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Heart,
  Crown,
  Building2,
  BarChart3,
  Users,
  ArrowLeft,
  Home,
  Eye,
  Sparkles,
} from 'lucide-react';

/**
 * MockupNavigation Component
 *
 * Provides easy navigation between different Mmogo Impact Ecosystem mockups
 * and related pages. Includes breadcrumb navigation and quick access buttons.
 */

interface NavigationItem {
  id: string;
  name: string;
  setswanaName: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  route: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    name: 'Civic Portal Home',
    setswanaName: 'Gae',
    description: 'Return to main civic portal',
    icon: Home,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor:
      'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700',
    route: '/',
  },
  {
    id: 'demo',
    name: 'Demo Mode',
    setswanaName: 'Sekao',
    description: 'Explore with demo data',
    icon: Eye,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor:
      'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
    route: '/demo',
  },
  {
    id: 'ecosystem',
    name: 'Ecosystem Overview',
    setswanaName: 'Kakaretso',
    description: 'Complete business model showcase',
    icon: Sparkles,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor:
      'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800',
    route: '/demo/mmogo-ecosystem',
  },
];

const mockupItems: NavigationItem[] = [
  {
    id: 'motse',
    name: 'Motse Platform',
    setswanaName: 'Our Village',
    description: 'Free civic engagement platform',
    icon: Users,
    color: 'text-green-600 dark:text-green-400',
    bgColor:
      'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
    route: '/demo',
  },
  {
    id: 'thusang',
    name: 'Thusang Projects',
    setswanaName: 'Together',
    description: 'Community crowdfunding interface',
    icon: Heart,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
    route: '/demo/mmogo-ecosystem?tier=thusang&mode=demo',
  },
  {
    id: 'kgotla',
    name: 'Kgotla+ Dashboard',
    setswanaName: 'Traditional Council Plus',
    description: 'Government management tools',
    icon: Crown,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor:
      'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
    route: '/demo/mmogo-ecosystem?tier=kgotla&mode=demo',
  },
  {
    id: 'tirisano',
    name: 'Tirisano Mmogo',
    setswanaName: 'Working Together',
    description: 'Business partnership interface',
    icon: Building2,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor:
      'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800',
    route: '/demo/mmogo-ecosystem?tier=tirisano_mmogo&mode=demo',
  },
  {
    id: 'tlhaloso',
    name: 'Tlhaloso Reports',
    setswanaName: 'Explanation/Analysis',
    description: 'Data analytics and insights',
    icon: BarChart3,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor:
      'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800',
    route: '/demo/mmogo-ecosystem?tier=tlhaloso&mode=demo',
  },
];

interface MockupNavigationProps {
  currentPage?: string;
  showMockups?: boolean;
  className?: string;
}

const MockupNavigation: React.FC<MockupNavigationProps> = ({
  currentPage = 'ecosystem',
  showMockups = true,
  className = '',
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (route: string) => {
    navigate(route);
  };

  const isCurrentPage = (itemId: string) => {
    if (itemId === 'ecosystem' && location.pathname === '/demo/mmogo-ecosystem')
      return true;
    if (itemId === 'demo' && location.pathname === '/demo') return true;
    if (itemId === 'home' && location.pathname === '/') return true;
    return false;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Breadcrumb Navigation */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Mmogo Impact Ecosystem Navigation
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Explore the complete business model and UI mockups
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              const isCurrent = isCurrentPage(item.id);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    isCurrent
                      ? `${item.bgColor} shadow-md ring-2 ring-blue-200 dark:ring-blue-800`
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => handleNavigation(item.route)}
                >
                  <div className="p-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${item.bgColor}`}>
                        <Icon className={`h-5 w-5 ${item.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                            {item.name}
                          </h4>
                          {isCurrent && (
                            <Badge className="bg-blue-500 text-white text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                          {item.setswanaName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Mockup Quick Access */}
      {showMockups && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Quick Access to Mockups
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {mockupItems.map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-md"
                    onClick={() => handleNavigation(item.route)}
                  >
                    <div className="p-3 text-center">
                      <div
                        className={`p-2 rounded-lg ${item.bgColor} mx-auto w-fit mb-2`}
                      >
                        <Icon className={`h-4 w-4 ${item.color}`} />
                      </div>
                      <h5 className="font-medium text-xs text-gray-900 dark:text-gray-100">
                        {item.name}
                      </h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                        {item.setswanaName}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Demo Mode Indicator */}
      <Card className="bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Sparkles className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                UI Mockup Showcase
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                These are visual mockups demonstrating the Mmogo Impact
                Ecosystem business model integration. All data is simulated for
                demonstration purposes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MockupNavigation;
