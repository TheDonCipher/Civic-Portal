import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useDemoMode } from '@/providers/DemoProvider';
import MainLayout from '@/components/layout/MainLayout';
import PaymentMethodSelector from './PaymentMethodSelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Star,
  Heart,
  Target,
  TrendingUp,
  Users,
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle,
  Info,
  ArrowLeft,
  Thermometer,
  Camera,
  FileText,
} from 'lucide-react';

interface ThusangProject {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  goalAmount: number;
  raisedAmount: number;
  contributors: number;
  daysLeft: number;
  image: string;
  updates: number;
  featured: boolean;
}

const ThusangSubscriptionPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { isDemoMode } = useDemoMode();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState<number>(25);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');

  // Demo Thusang projects
  const demoProjects: ThusangProject[] = [
    {
      id: 'project_001',
      title: 'Repair Tlokweng Library Roof',
      description: 'The Tlokweng Community Library roof has been leaking during the rainy season, damaging books and making the space unusable. We need BWP 15,000 to repair the roof and protect this vital community resource.',
      location: 'Tlokweng, Gaborone',
      category: 'Education',
      goalAmount: 15000,
      raisedAmount: 8750,
      contributors: 127,
      daysLeft: 18,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
      updates: 3,
      featured: true,
    },
    {
      id: 'project_002',
      title: 'Streetlights for Mogoditshane Ward 3',
      description: 'Install 12 solar-powered streetlights along the main road in Mogoditshane Ward 3 to improve safety for residents walking at night, especially students and workers.',
      location: 'Mogoditshane, Kweneng',
      category: 'Infrastructure',
      goalAmount: 8500,
      raisedAmount: 3200,
      contributors: 89,
      daysLeft: 25,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      updates: 1,
      featured: false,
    },
    {
      id: 'project_003',
      title: 'Gaborone Parks Maintenance Fund',
      description: 'Monthly recurring fund to maintain and improve public parks in Gaborone. Funds will be used for gardening supplies, equipment maintenance, and small infrastructure improvements.',
      location: 'Gaborone Central',
      category: 'Environment',
      goalAmount: 2500,
      raisedAmount: 1850,
      contributors: 156,
      daysLeft: 0, // Recurring fund
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
      updates: 5,
      featured: false,
    },
  ];

  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId);
    setShowPaymentSelector(true);
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    console.log('Selected payment method:', methodId);
    // TODO: Process payment
  };

  const getProgressPercentage = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100);
  };

  const calculatePlatformFee = (amount: number) => {
    return Math.max(amount * 0.05, 0.5); // 5% with minimum 50t
  };

  const selectedProjectData = demoProjects.find(p => p.id === selectedProject);

  if (showPaymentSelector && selectedProjectData) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto mobile-padding section-spacing">
          <div className="space-y-6">
            {/* Back Button */}
            <Button
              variant="outline"
              onClick={() => setShowPaymentSelector(false)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
            </Button>

            {/* Project Summary */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <img
                    src={selectedProjectData.image}
                    alt={selectedProjectData.title}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-2">{selectedProjectData.title}</h2>
                    <p className="text-muted-foreground mb-3">{selectedProjectData.location}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span>BWP {selectedProjectData.raisedAmount.toLocaleString()} raised</span>
                      <span>•</span>
                      <span>{selectedProjectData.contributors} contributors</span>
                      <span>•</span>
                      <span>{getProgressPercentage(selectedProjectData.raisedAmount, selectedProjectData.goalAmount).toFixed(1)}% funded</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contribution Amount */}
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Contribution</CardTitle>
                <CardDescription>
                  Every contribution helps bring this project closer to completion
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[10, 25, 50, 100].map((amount) => (
                    <Button
                      key={amount}
                      variant={contributionAmount === amount ? 'default' : 'outline'}
                      onClick={() => setContributionAmount(amount)}
                      className="h-12"
                    >
                      BWP {amount}
                    </Button>
                  ))}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Custom Amount (BWP)</label>
                  <input
                    type="number"
                    min="5"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(Number(e.target.value))}
                    className="w-full p-3 border rounded-lg"
                    placeholder="Enter amount"
                  />
                </div>

                {/* Fee Breakdown */}
                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Your contribution:</span>
                    <span>BWP {contributionAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Platform fee (5%):</span>
                    <span>BWP {calculatePlatformFee(contributionAmount).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Goes to project:</span>
                    <span>BWP {(contributionAmount - calculatePlatformFee(contributionAmount)).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <PaymentMethodSelector
              userRole={profile?.role || 'citizen'}
              subscriptionTier="thusang"
              amount={contributionAmount}
              onMethodSelect={handlePaymentMethodSelect}
            />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto mobile-padding section-spacing">
        {/* Header */}
        <div className="text-center space-y-6 py-12">
          <div className="space-y-4">
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium bg-blue-50 border-blue-200">
              <Star className="w-4 h-4 mr-2" />
              Thusang Community Action Funds
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Fund Community{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Projects
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Support specific, community-prioritized projects with transparent funding and real impact tracking.
              Every contribution creates lasting change in Botswana communities.
            </p>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">BWP 127,500</div>
              <p className="text-sm text-muted-foreground">Total Raised</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">23</div>
              <p className="text-sm text-muted-foreground">Projects Completed</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">1,247</div>
              <p className="text-sm text-muted-foreground">Community Contributors</p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <section className="py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How Thusang Projects Work</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transparent, community-driven funding with clear goals and measurable impact
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold">1. Community Identifies Need</h3>
              <p className="text-sm text-muted-foreground">
                Issues gain traction through reports, votes, and community endorsement
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">2. Project Created</h3>
              <p className="text-sm text-muted-foreground">
                Clear budget, goals, and timeline established with community input
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold">3. Community Contributes</h3>
              <p className="text-sm text-muted-foreground">
                Citizens and businesses fund the project with transparent fees
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <Camera className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold">4. Impact Delivered</h3>
              <p className="text-sm text-muted-foreground">
                Project completed with photos, updates, and community celebration
              </p>
            </div>
          </div>
        </section>

        {/* Projects Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="projects">Active Projects</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="recurring">Recurring Funds</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {demoProjects.filter(p => p.daysLeft > 0).map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                    {project.featured && (
                      <div className="relative">
                        <Badge className="absolute top-4 left-4 z-10 bg-yellow-500 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                    )}
                    
                    <div className="relative">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="absolute bottom-4 right-4">
                        <Badge variant="secondary" className="bg-white/90 text-black">
                          {project.daysLeft} days left
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-6 space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{project.category}</Badge>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {project.location}
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {project.description}
                        </p>
                      </div>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>BWP {project.raisedAmount.toLocaleString()} raised</span>
                          <span>BWP {project.goalAmount.toLocaleString()} goal</span>
                        </div>
                        <Progress value={getProgressPercentage(project.raisedAmount, project.goalAmount)} />
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{project.contributors} contributors</span>
                          <span>{getProgressPercentage(project.raisedAmount, project.goalAmount).toFixed(1)}% funded</span>
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => handleProjectSelect(project.id)}
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Contribute to Project
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Completed Projects</h3>
                <p className="text-muted-foreground mb-6">
                  View successfully funded and completed community projects with impact reports
                </p>
                <Button variant="outline">
                  View Completed Projects
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recurring" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {demoProjects.filter(p => p.daysLeft === 0).map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{project.category}</Badge>
                            <Badge className="bg-blue-100 text-blue-800">Recurring</Badge>
                          </div>
                          <h3 className="font-semibold">{project.title}</h3>
                          <p className="text-sm text-muted-foreground">{project.location}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>This month: BWP {project.raisedAmount.toLocaleString()}</span>
                            <span>Goal: BWP {project.goalAmount.toLocaleString()}</span>
                          </div>
                          <Progress value={getProgressPercentage(project.raisedAmount, project.goalAmount)} />
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleProjectSelect(project.id)}
                          className="w-full"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Set Monthly Contribution
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Transparency Section */}
        <section className="py-16 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 rounded-2xl">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">Complete Transparency</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Every contribution is tracked, every project is documented, and every impact is measured
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <DollarSign className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold">Clear Fee Structure</h3>
                <p className="text-sm text-muted-foreground">
                  5-7% platform fee clearly shown upfront. Only charged on successful projects.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Thermometer className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold">Real-time Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Visual progress thermometer and regular updates with photos and videos.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold">Community Driven</h3>
                <p className="text-sm text-muted-foreground">
                  Projects emerge from community needs and are prioritized by local support.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default ThusangSubscriptionPage;
