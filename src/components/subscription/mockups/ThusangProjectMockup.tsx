import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Heart,
  Users,
  MapPin,
  Calendar,
  Target,
  TrendingUp,
  Share2,
  MessageSquare,
  CheckCircle2,
  Clock,
  Smartphone,
  CreditCard,
  Building2,
  Star,
  Camera,
  FileText,
} from 'lucide-react';

/**
 * Thusang Community Action Funds Mockup
 *
 * This mockup demonstrates the "Thusang" (Together) project contribution interface
 * where citizens can contribute BWP 10-100 to community-prioritized projects.
 *
 * Features:
 * - Visual fund progress indicators
 * - Mobile-first contribution flow
 * - Transparent fee structure (5-7%)
 * - Project updates and milestones
 * - Community engagement metrics
 */

interface ThusangProject {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  targetAmount: number;
  raisedAmount: number;
  contributorCount: number;
  daysLeft: number;
  status: 'active' | 'funded' | 'completed';
  priority: 'high' | 'medium' | 'low';
  department: string;
  councilor: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  updates: Array<{
    id: string;
    date: string;
    title: string;
    description: string;
    images?: string[];
  }>;
  milestones: Array<{
    id: string;
    title: string;
    targetAmount: number;
    completed: boolean;
    description: string;
  }>;
}

const mockProject: ThusangProject = {
  id: 'thusang-001',
  title: 'Repair Tlokweng Library Roof',
  description:
    'The community library roof has been leaking during the rainy season, damaging books and making the space unusable. This project will repair the roof and install proper drainage.',
  category: 'Education',
  location: 'Tlokweng Ward 3',
  targetAmount: 15000,
  raisedAmount: 8750,
  contributorCount: 127,
  daysLeft: 18,
  status: 'active',
  priority: 'high',
  department: 'Ministry of Education',
  councilor: {
    name: 'Kgosi Mmoloki',
    avatar: '/api/placeholder/40/40',
    verified: true,
  },
  updates: [
    {
      id: 'update-1',
      date: '2024-01-15',
      title: 'Contractor Selected',
      description:
        'After community consultation, we have selected Botswana Roofing Solutions to handle the repairs.',
      images: ['/api/placeholder/300/200'],
    },
    {
      id: 'update-2',
      date: '2024-01-10',
      title: 'Project Approved',
      description:
        'The Tlokweng Ward Council has officially approved this Thusang project.',
    },
  ],
  milestones: [
    {
      id: 'milestone-1',
      title: 'Initial Assessment',
      targetAmount: 2000,
      completed: true,
      description: 'Professional roof assessment and damage evaluation',
    },
    {
      id: 'milestone-2',
      title: 'Materials Purchase',
      targetAmount: 8000,
      completed: false,
      description: 'Purchase roofing materials and supplies',
    },
    {
      id: 'milestone-3',
      title: 'Repair Work',
      targetAmount: 5000,
      completed: false,
      description: 'Complete roof repair and installation',
    },
  ],
};

const ThusangProjectMockup: React.FC = () => {
  const [selectedAmount, setSelectedAmount] = useState<number>(25);
  const [showContributionFlow, setShowContributionFlow] = useState(false);

  const progressPercentage =
    (mockProject.raisedAmount / mockProject.targetAmount) * 100;
  const platformFee = Math.round(selectedAmount * 0.06); // 6% platform fee
  const projectAmount = selectedAmount - platformFee;

  const contributionAmounts = [10, 25, 50, 100];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Badge
          variant="outline"
          className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
        >
          Thusang Community Action Funds
        </Badge>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Mmogo Impact Ecosystem - Project Funding
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Together we build stronger communities • Re aga setšhaba se se
          nonofileng mmogo
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Project Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <div className="relative h-48 bg-gradient-to-r from-blue-500 to-blue-600">
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute top-4 left-4">
                <Badge className="bg-red-500 text-white">
                  {mockProject.priority.toUpperCase()} PRIORITY
                </Badge>
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <h2 className="text-xl font-bold">{mockProject.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{mockProject.location}</span>
                </div>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  {mockProject.description}
                </p>

                {/* Progress Section */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Funding Progress
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {progressPercentage.toFixed(1)}% funded
                    </span>
                  </div>

                  <Progress value={progressPercentage} className="h-3" />

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        BWP {mockProject.raisedAmount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Raised
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        BWP {mockProject.targetAmount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Target
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {mockProject.contributorCount}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Contributors
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Stats */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm dark:text-gray-300">
                        {mockProject.daysLeft} days left
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm dark:text-gray-300">
                        {mockProject.department}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={mockProject.councilor.avatar} />
                      <AvatarFallback>KM</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium dark:text-gray-300">
                      {mockProject.councilor.name}
                    </span>
                    {mockProject.councilor.verified && (
                      <CheckCircle2 className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Project Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockProject.milestones.map((milestone, index) => (
                  <div key={milestone.id} className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        milestone.completed
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {milestone.completed ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium dark:text-gray-100">
                          {milestone.title}
                        </h4>
                        <span className="text-sm font-medium dark:text-gray-300">
                          BWP {milestone.targetAmount.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contribution Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-center">Make a Contribution</CardTitle>
              <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                Every pula brings us closer to completion
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Amount Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block dark:text-gray-300">
                  Choose Amount
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {contributionAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant={
                        selectedAmount === amount ? 'default' : 'outline'
                      }
                      onClick={() => setSelectedAmount(amount)}
                      className="h-12"
                    >
                      BWP {amount}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Fee Breakdown */}
              <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg space-y-2">
                <div className="flex justify-between text-sm dark:text-gray-300">
                  <span>Your contribution:</span>
                  <span>BWP {selectedAmount}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Platform fee (6%):</span>
                  <span>BWP {platformFee}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-medium dark:text-gray-200">
                  <span>To project:</span>
                  <span className="text-green-600 dark:text-green-400">
                    BWP {projectAmount}
                  </span>
                </div>
              </div>

              {/* Contribution Button */}
              <Button
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                onClick={() => setShowContributionFlow(true)}
              >
                <Heart className="h-4 w-4 mr-2" />
                Contribute BWP {selectedAmount}
              </Button>

              {/* Payment Methods Preview */}
              <div className="space-y-2">
                <p className="text-xs text-gray-600 text-center">
                  Accepted payment methods:
                </p>
                <div className="flex justify-center gap-2">
                  <div className="flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                    <Smartphone className="h-3 w-3" />
                    Orange Money
                  </div>
                  <div className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    <CreditCard className="h-3 w-3" />
                    Bank Card
                  </div>
                </div>
              </div>

              {/* Social Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Discuss
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Contributors */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent Contributors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Thabo M.', amount: 50, time: '2 hours ago' },
                  { name: 'Keabetswe L.', amount: 25, time: '5 hours ago' },
                  { name: 'Mpho K.', amount: 100, time: '1 day ago' },
                ].map((contributor, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {contributor.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {contributor.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        BWP {contributor.amount}
                      </div>
                      <div className="text-xs text-gray-500">
                        {contributor.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ThusangProjectMockup;
