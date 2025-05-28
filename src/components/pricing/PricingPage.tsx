import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/components/layout/MainLayout';
import {
  Heart,
  Users,
  Building2,
  CheckCircle,
  Star,
  Home,
  Coins,
  Crown,
  Eye,
  Lightbulb,
  Network,
  Smartphone,
} from 'lucide-react';

const PricingPage = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto mobile-padding section-spacing">
        {/* Hero Section */}
        <section className="text-center space-y-6 py-12">
          <div className="space-y-4">
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
              <Network className="w-4 h-4 mr-2" />
              Mmogo Impact Ecosystem
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              The{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Mmogo
              </span>{' '}
              Impact Ecosystem
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              From reporting issues to creating solutions. Our ecosystem
              transforms civic engagement into an{' '}
              <em>Action & Resolution Platform</em> where value flows through
              facilitation, solutions, insights, and stakeholder empowerment.
            </p>
          </div>

          {/* Philosophy Banner */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 dark:from-blue-950/30 dark:to-purple-950/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-4 text-center">
                <Heart className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    "Mmogo" - Together We Build
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    An ecosystem where every contribution creates lasting impact
                  </p>
                </div>
                <Heart className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Money Flow & Platform Impact Section */}
        <section className="py-16 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-green-950/20 dark:via-blue-950/20 dark:to-purple-950/20 rounded-2xl">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <Badge
                variant="outline"
                className="px-4 py-2 text-sm font-medium bg-white/80"
              >
                <Network className="w-4 h-4 mr-2" />
                Money Flow & Platform Impact
              </Badge>
              <h2 className="text-3xl font-bold">
                How Your Payments Drive Real Change
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Every payment in the Mmogo Impact Ecosystem directly funds issue
                resolution, community development, and democratic participation
                across Botswana.
              </p>
            </div>

            {/* Flow Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur border-2 border-green-200">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto">
                    <Coins className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-700">
                      1. Community Contributions
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Citizens fund Thusang projects (BWP 10-100) with
                      transparent 5-7% platform fees
                    </p>
                  </div>
                  <div className="text-xs text-green-600 font-medium">
                    93-95% → Direct Project Funding
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur border-2 border-purple-200">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto">
                    <Building2 className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-purple-700">
                      2. Business Partnerships
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Tirisano Mmogo subscriptions (BWP 200-1500+) fund
                      community visibility and CSR projects
                    </p>
                  </div>
                  <div className="text-xs text-purple-600 font-medium">
                    Enhanced Community Engagement
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur border-2 border-blue-200">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto">
                    <Crown className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-700">
                      3. Government Efficiency
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Kgotla+ subscriptions (BWP 750-6500) improve citizen
                      communication and issue resolution
                    </p>
                  </div>
                  <div className="text-xs text-blue-600 font-medium">
                    60% Faster Resolution Times
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur border-2 border-orange-200">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto">
                    <Lightbulb className="w-8 h-8 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-orange-700">
                      4. Data-Driven Insights
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Tlhaloso intelligence (BWP 1000+) guides BWP millions in
                      infrastructure investments
                    </p>
                  </div>
                  <div className="text-xs text-orange-600 font-medium">
                    Informed Policy Decisions
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Impact Metrics */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur rounded-xl p-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-6 text-center">
                Platform Impact Multiplier
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    BWP 1
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Community contribution generates <strong>BWP 3-5</strong> in
                    total community value through government efficiency gains
                    and business engagement
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    60%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Average improvement in issue resolution times when
                    communities, government, and businesses collaborate through
                    the platform
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    100%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Transparency in fund allocation - every BWP tracked from
                    contribution to community impact with photo documentation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Free Foundation Layer */}
        <section className="space-y-8 py-12">
          <div className="text-center space-y-4">
            <Badge
              variant="outline"
              className="px-4 py-2 text-sm font-medium bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300"
            >
              <Home className="w-4 h-4 mr-2" />
              Foundation Layer - Always Free
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              The "Motse" Platform - Our Village
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Universal access for all citizens. The bedrock that ensures
              everyone can participate in building stronger communities.
            </p>
          </div>

          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 dark:from-green-950/30 dark:to-blue-950/30 dark:border-green-800">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto">
                    <Smartphone className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Easy Reporting
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Text, photo, GPS, voice notes via app and USSD
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto">
                    <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Public Tracking
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Issue tracking and progress visualization for all
                  </p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mx-auto">
                    <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Community Forums
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Discuss local issues with moderated community spaces
                  </p>
                </div>
              </div>
              <div className="text-center mt-6">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white"
                >
                  Start Using Motse Platform - Free Forever
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Monetization Layers */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Monetization Layers</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four specialized layers that create sustainable value while
              empowering communities, government, businesses, and
              decision-makers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Layer 1: "Thusang" Community Action Funds */}
            <Card className="relative border-2 hover:border-green-300 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                  <Coins className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    "Thusang" Action Funds
                  </CardTitle>
                  <CardDescription>
                    Project-Focused Community Crowdfunding
                  </CardDescription>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-green-600">5-7%</div>
                  <p className="text-sm text-muted-foreground">
                    Platform fee on successful projects
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center mb-4">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    Empowering citizens to directly fund community solutions
                    with complete transparency and democratic participation in
                    project selection
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-700 dark:text-green-300 flex items-center gap-2">
                      👥 User-Centered Features
                    </h4>
                    <div className="space-y-2 ml-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Easy Contribution:</strong> BWP 10, 25, 50,
                          100 or custom amounts via mobile money
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Project Voting:</strong> Community votes on
                          which issues become funded projects
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Progress Tracking:</strong> Real-time updates
                          with photos and milestone notifications
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Impact Dashboard:</strong> Personal
                          contribution history and community impact metrics
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-700 dark:text-green-300 flex items-center gap-2">
                      🎯 Targeted Project Examples
                    </h4>
                    <div className="space-y-2 ml-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Infrastructure:</strong> "Repair Tlokweng
                          Library Roof" - BWP 15,000 goal
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Safety:</strong> "Streetlights for
                          Mogoditshane Ward 3" - BWP 8,500 goal
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Education:</strong> "School Computer Lab
                          Equipment" - BWP 25,000 goal
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Health:</strong> "Community Clinic Medical
                          Supplies" - BWP 12,000 goal
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-700 dark:text-green-300 flex items-center gap-2">
                      🔄 Recurring Community Funds
                    </h4>
                    <div className="space-y-2 ml-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Parks & Recreation:</strong> "Gaborone Parks
                          Maintenance Fund" - BWP 20/month
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Water Access:</strong> "Rural Water Access
                          Fund" - BWP 15/month
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Youth Programs:</strong> "Community Sports
                          Equipment Fund" - BWP 10/month
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Emergency Response:</strong> "Disaster Relief
                          Preparedness Fund" - BWP 25/month
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-700 dark:text-green-300 flex items-center gap-2">
                      💰 Democratic Participation Benefits
                    </h4>
                    <div className="space-y-2 ml-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Voice in Priorities:</strong> Vote on which
                          community issues receive funding priority
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Transparent Accountability:</strong> Track
                          every BWP from contribution to completion
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Community Recognition:</strong> Contributor
                          badges and community impact certificates
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Local Ownership:</strong> Projects managed by
                          community with government coordination
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-center">
                    <p className="text-sm text-green-700 dark:text-green-300 font-medium mb-1">
                      "BWP 1000 raised = BWP 50 platform fee + BWP 950 to
                      project"
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Transparent fee structure supports portal operations
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() =>
                    (window.location.href = '/subscription/thusang')
                  }
                >
                  Fund a Thusang Project
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Only pay when projects are successfully funded • Full
                  transparency
                </p>
              </CardContent>
            </Card>

            {/* Layer 2: "Tirisano Mmogo" Business & Enterprise Solutions */}
            <Card className="relative border-2 hover:border-purple-300 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    "Tirisano Mmogo" Business Solutions
                  </CardTitle>
                  <CardDescription>
                    Value-Driven Community Partnerships
                  </CardDescription>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-purple-600">
                    BWP 200-1500+
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Per month • 3 partnership tiers
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center mb-4">
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    <strong>Critical for Business Success:</strong> Participate
                    in civic engagement, build community partnerships, and
                    demonstrate corporate social responsibility while gaining
                    valuable market insights
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-purple-700 dark:text-purple-300 flex items-center gap-2">
                      🏪 Why Businesses Need Civic Engagement
                    </h4>
                    <div className="space-y-2 ml-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Community Trust:</strong> Build authentic
                          relationships with local customers through visible
                          community support
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Market Intelligence:</strong> Understand local
                          needs, preferences, and emerging opportunities
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Competitive Advantage:</strong> Differentiate
                          through meaningful community partnerships
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Risk Mitigation:</strong> Early awareness of
                          local issues that could impact operations
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-purple-700 dark:text-purple-300 flex items-center gap-2">
                      💼 Partnership Tier Value Propositions
                    </h4>
                    <div className="space-y-2 ml-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Community Supporter (BWP 200/month):</strong>{' '}
                          Essential visibility with sponsor badge, directory
                          listing, and basic community recognition
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Community Champion (BWP 500/month):</strong>{' '}
                          Enhanced marketing with featured placement, local
                          deals promotion, and monthly pulse reports
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>
                            Corporate Impact Partner (BWP 1500+/month):
                          </strong>{' '}
                          Strategic CSR alignment with co-created projects, API
                          access, and comprehensive analytics
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-purple-700 dark:text-purple-300 flex items-center gap-2">
                      📈 Measurable Business Impact
                    </h4>
                    <div className="space-y-2 ml-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Customer Loyalty:</strong> 73% of consumers
                          prefer brands that support local communities
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Brand Recognition:</strong> Logo visibility on
                          resolved issues reaches 10,000+ citizens monthly
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Market Insights:</strong> Hyperlocal data
                          worth BWP 5,000+ in traditional market research
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Employee Engagement:</strong> Staff pride in
                          company's community impact increases retention
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-purple-700 dark:text-purple-300 flex items-center gap-2">
                      🤝 Corporate Social Responsibility Excellence
                    </h4>
                    <div className="space-y-2 ml-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Authentic Impact:</strong> Direct funding of
                          community projects with transparent outcomes
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Stakeholder Reporting:</strong> Detailed CSR
                          impact reports for investors and partners
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Strategic Alignment:</strong> Co-create
                          projects that align with business goals and community
                          needs
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Long-term Partnerships:</strong> Build lasting
                          relationships with government and community leaders
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="text-center">
                    <p className="text-sm text-purple-700 dark:text-purple-300 font-medium mb-1">
                      "Enhanced brand reputation + hyperlocal insights"
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400">
                      Direct community engagement with measurable impact
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() =>
                    (window.location.href = '/subscription/tirisano')
                  }
                >
                  Become a Tirisano Mmogo Partner
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Monthly billing • CSR alignment • Measurable community impact
                </p>
              </CardContent>
            </Card>

            {/* Layer 3: "Kgotla+" Local Governance Solutions */}
            <Card className="relative border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white px-4 py-1">
                  <Star className="w-4 h-4 mr-1" />
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="text-center space-y-4 pt-8">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                  <Crown className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    "Kgotla+" Governance Solutions
                  </CardTitle>
                  <CardDescription>
                    Efficiency & Engagement for All Government Levels
                  </CardDescription>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-blue-600">
                    BWP 750-6500
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Per month • Quarterly/Annual billing
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center mb-4">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    <strong>Essential for Democratic Governance:</strong>{' '}
                    Transform citizen communication, ensure transparent
                    accountability, and achieve measurable improvements in
                    public service delivery
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      🏛️ Why Government Entities Need These Tools
                    </h4>
                    <div className="space-y-2 ml-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Democratic Transparency:</strong> Citizens
                          demand real-time visibility into government actions
                          and progress
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Efficient Resource Allocation:</strong>{' '}
                          Data-driven decisions prevent waste and maximize
                          impact
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Citizen Trust Building:</strong> Transparent
                          communication increases public confidence in
                          government
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Performance Accountability:</strong>{' '}
                          Measurable outcomes demonstrate effective governance
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      📊 Government Tier Solutions
                    </h4>
                    <div className="space-y-2 ml-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Ward Essentials (BWP 750/month):</strong>{' '}
                          Secure dashboard, direct citizen communication, basic
                          analytics, and USSD interface for immediate response
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>District Command (BWP 2800/month):</strong>{' '}
                          Cross-ward coordination, advanced analytics, budget
                          utilization tracking, and custom reporting tools
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>National Oversight (BWP 6500/month):</strong>{' '}
                          Policy impact simulation, national benchmarking, and
                          aggregated civic indicators
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      🚀 Proven Efficiency Gains
                    </h4>
                    <div className="space-y-2 ml-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>60% Faster Resolution:</strong> Streamlined
                          workflows reduce average issue resolution time
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>85% Citizen Satisfaction:</strong> Transparent
                          communication increases public approval
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>40% Cost Reduction:</strong> Better
                          coordination eliminates duplicate efforts and waste
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Real-time Monitoring:</strong> Immediate
                          alerts prevent small issues from becoming major
                          problems
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      🤝 Enhanced Democratic Participation
                    </h4>
                    <div className="space-y-2 ml-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Bilingual Communication:</strong> Bulk
                          SMS/in-app messaging with Setswana/English translation
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Inclusive Access:</strong> USSD interface
                          ensures participation regardless of smartphone access
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Feedback Loops:</strong> Continuous citizen
                          input improves policy and service delivery
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Public Accountability:</strong> Open progress
                          tracking builds trust and demonstrates results
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-center">
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">
                      "Demonstrable ROI through faster resolution & citizen
                      satisfaction"
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Aligned with government budget cycles
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() =>
                    (window.location.href = '/subscription/kgotla')
                  }
                >
                  Contact Kgotla+ Sales
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Quarterly/Annual billing • Government procurement • Dedicated
                  support
                </p>
              </CardContent>
            </Card>

            {/* Layer 4: "Tlhaloso" Data & Insights Services */}
            <Card className="relative border-2 hover:border-orange-300 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    "Tlhaloso" Data & Insights
                  </CardTitle>
                  <CardDescription>
                    Premium Analytics for Strategic Decision-Making
                  </CardDescription>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-orange-600">
                    BWP 1000+
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Per report/subscription • Custom pricing
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center mb-4">
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    <strong>Transform Decision-Making:</strong> Actionable
                    intelligence that drives informed business strategy, policy
                    development, and infrastructure investments worth millions
                    of BWP
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-orange-700 dark:text-orange-300 flex items-center gap-2">
                      💡 Actionable Business Intelligence Examples
                    </h4>
                    <div className="space-y-2 ml-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Retail Location Analysis:</strong> "Gaborone
                          Shopping Center Foot Traffic Patterns" - Identify
                          optimal store locations based on citizen movement data
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Service Demand Forecasting:</strong> "Mobile
                          Money Usage Trends by District" - Predict where to
                          expand financial services
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Market Entry Strategy:</strong> "Rural
                          Internet Connectivity Gaps" - Guide telecommunications
                          investment decisions
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Supply Chain Optimization:</strong>{' '}
                          "Transportation Issue Hotspots" - Optimize logistics
                          routes and warehouse locations
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-orange-700 dark:text-orange-300 flex items-center gap-2">
                      🏛️ Government Policy Intelligence Examples
                    </h4>
                    <div className="space-y-2 ml-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Infrastructure Investment:</strong> "Water
                          Access Analysis - Central District" guided BWP 2M
                          borehole placement for maximum community impact
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Education Planning:</strong> "School Capacity
                          vs. Population Growth" - Predict where new schools are
                          needed 5 years in advance
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Healthcare Resource Allocation:</strong>{' '}
                          "Disease Pattern Mapping" - Optimize clinic locations
                          and medical supply distribution
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Economic Development:</strong> "Youth
                          Employment Opportunity Mapping" - Target skills
                          training programs where they're most needed
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-orange-700 dark:text-orange-300 flex items-center gap-2">
                      📊 Intelligence Service Offerings
                    </h4>
                    <div className="space-y-2 ml-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Thematic Reports (BWP 1000/report):</strong>{' '}
                          Quarterly deep-dive analyses on specific sectors or
                          geographic areas
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>
                            Custom Data Projects (BWP 5000-50000):
                          </strong>{' '}
                          Bespoke research projects tailored to specific
                          business or policy questions
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Developer API (BWP 2000+/month):</strong>{' '}
                          Real-time access to aggregated, anonymized datasets
                          for integration into business systems
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Predictive Analytics (BWP 10000+):</strong>{' '}
                          Machine learning models for forecasting trends and
                          identifying opportunities
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-orange-700 dark:text-orange-300 flex items-center gap-2">
                      🔒 Ethical Framework & Privacy Protection
                    </h4>
                    <div className="space-y-2 ml-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Absolute Privacy:</strong> All data anonymized
                          and aggregated - no individual identification possible
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Community Benefit:</strong> Insights must
                          demonstrate clear benefit to Botswana's development
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Transparent Usage:</strong> Users informed how
                          their anonymized data contributes to insights
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Regulatory Compliance:</strong> Full adherence
                          to Botswana Data Protection Office standards
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="text-center">
                    <p className="text-sm text-orange-700 dark:text-orange-300 font-medium mb-1">
                      "Actionable intelligence becomes more valuable as data
                      pool grows"
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                      Strict privacy protection with community benefit focus
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={() =>
                    (window.location.href = '/subscription/tlhaloso')
                  }
                >
                  Request Tlhaloso Intelligence
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Custom consultancy • API access • Academic partnerships
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Ecosystem Success Stories */}
        <section className="py-16 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-2xl">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">
                Mmogo Impact Ecosystem in Action
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Real stories from across the four layers of our ecosystem,
                showing how each contributes to sustainable community
                development
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Coins className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      BWP 15,000
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Thusang Project: Tlokweng Library Roof
                    </p>
                  </div>
                  <p className="text-sm">
                    "Community raised funds with transparent 5% platform fee.
                    BWP 750 supported portal operations, BWP 14,250 fixed our
                    library."
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    - Community Project Success
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <Building2 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      5 Partners
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Intla Business Solutions subscribers
                    </p>
                  </div>
                  <p className="text-sm">
                    "Our BWP 500/month gives us hyperlocal insights and
                    community recognition. ROI through increased foot traffic is
                    measurable."
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    - Local Business Champion
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Crown className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      3 Wards
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Using Kgotla+ Governance Solutions
                    </p>
                  </div>
                  <p className="text-sm">
                    "BWP 750/month transformed our citizen engagement.
                    Resolution times improved 60% with transparent tracking."
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    - Ward Councilor Pilot Program
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                    <Lightbulb className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      2 Reports
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Tlhaloso Intelligence delivered
                    </p>
                  </div>
                  <p className="text-sm">
                    "BWP 1000 'Water Access Analysis' helped prioritize BWP 2M
                    infrastructure investment. Data-driven policy works."
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    - District Development Committee
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Enhanced Mmogo Impact System Benefits Section */}
        <section className="py-16 text-center space-y-12">
          <div className="space-y-6">
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
              <Heart className="w-4 h-4 mr-2" />
              Mmogo Impact System Benefits
            </Badge>
            <h2 className="text-3xl font-bold">
              The Power of "Mmogo" - Unity in Action
            </h2>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
              "Mmogo" embodies the Setswana principle of unity and togetherness.
              Our ecosystem creates a virtuous cycle where engaged citizens
              provide data, which powers solutions and insights, which attract
              paying stakeholders, whose contributions sustain and expand the
              platform for greater community benefit across Botswana.
            </p>
          </div>

          {/* Cultural Significance */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl p-8">
            <h3 className="text-2xl font-semibold mb-6">
              Cultural Foundation of Civic Engagement
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-red-700">
                    Traditional Kgotla Values
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Building on Botswana's traditional governance system where
                    community voices matter, decisions are made collectively,
                    and transparency is paramount
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-green-700">
                    Ubuntu Philosophy
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    "I am because we are" - fostering collaborative
                    problem-solving where individual contributions strengthen
                    the entire community fabric
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto">
                  <Network className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-purple-700">
                    Modern Democracy
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Bridging traditional wisdom with digital innovation to
                    create inclusive, transparent, and effective democratic
                    participation for all Batswana
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Core Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Home className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Universal Access</h3>
                <p className="text-sm text-muted-foreground">
                  Free Motse Platform ensures every citizen can participate in
                  building stronger communities, regardless of economic status
                  or location
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Coins className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Transparent Value</h3>
                <p className="text-sm text-muted-foreground">
                  Clear fee structures where stakeholders receive distinct,
                  tangible benefits directly related to their goals while
                  supporting community development
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Network className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Sustainable Growth</h3>
                <p className="text-sm text-muted-foreground">
                  Multiple revenue streams reduce dependency while keeping
                  community benefit at the core, ensuring long-term platform
                  sustainability
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <Eye className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Ethical Intelligence</h3>
                <p className="text-sm text-muted-foreground">
                  Data insights that improve civic life while maintaining
                  absolute user privacy, transparency, and benefit to Botswana's
                  development
                </p>
              </div>
            </div>
          </div>

          {/* Collaborative Problem-Solving Examples */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur rounded-xl p-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-semibold mb-8">
              Collaborative Problem-Solving in Action
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Coins className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-green-700">
                  Community-Led Solutions
                </h4>
                <p className="text-sm text-muted-foreground">
                  Citizens identify issues → Community funds Thusang projects →
                  Local businesses provide resources → Government coordinates
                  implementation → Everyone benefits from improved
                  infrastructure
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Crown className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-blue-700">
                  Government Efficiency
                </h4>
                <p className="text-sm text-muted-foreground">
                  Kgotla+ tools enable faster response times → Citizens see
                  transparent progress → Trust in government increases → More
                  civic participation → Better policy outcomes
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-purple-700">
                  Business Integration
                </h4>
                <p className="text-sm text-muted-foreground">
                  Businesses gain community visibility → Support local projects
                  through Tirisano Mmogo → Receive hyperlocal insights → Build
                  customer loyalty → Contribute to sustainable development
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Everything you need to know about using the Civic Portal in
              Botswana - from mobile money payments to government procurement
              processes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Getting Started */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  🚀 How do I get started with the Mmogo Ecosystem?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Start with the free Motse Platform, then choose your
                  engagement level:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>
                    • <strong>Free Access:</strong> Use Motse Platform for issue
                    reporting and tracking
                  </li>
                  <li>
                    • <strong>Thusang Projects:</strong> Fund specific community
                    projects with transparent fees
                  </li>
                  <li>
                    • <strong>Business Partnership:</strong> Join Intla
                    solutions for community visibility
                  </li>
                  <li>
                    • <strong>Government Solutions:</strong> Access Kgotla+ for
                    efficient governance
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-3">
                  Everyone starts with free access - no barriers to civic
                  engagement!
                </p>
              </CardContent>
            </Card>

            {/* Mobile Money */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  📱 How do I set up mobile money payments?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  We support all major Botswana mobile money services:
                </p>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div>
                    <strong>Orange Money:</strong> Dial *145# → My Account →
                    Register. Contributions under BWP 50 have no fees.
                  </div>
                  <div>
                    <strong>MyZaka (Mascom):</strong> Dial *151# → Register.
                    Standard network rates apply.
                  </div>
                  <div>
                    <strong>BTC Smega:</strong> Visit any BTC branch or dial
                    *150#. Lowest transaction fees for larger contributions.
                  </div>
                </div>
                <p className="text-sm text-green-600 mt-3 font-medium">
                  💡 Tip: Orange Money is recommended for small contributions
                  (BWP 5-50)
                </p>
              </CardContent>
            </Card>

            {/* Thusang Fee Structure */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  💰 How does the Thusang project fee structure work?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Transparent 5-7% platform fee only on successfully funded
                  projects:
                </p>
                <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg text-sm">
                  <p className="text-green-700 dark:text-green-300 font-medium mb-2">
                    Example: "Repair Tlokweng Library Roof" - BWP 15,000 goal
                  </p>
                  <p className="text-green-600 dark:text-green-400">
                    • BWP 15,000 raised by community
                    <br />
                    • BWP 750 platform fee (5%) supports portal operations
                    <br />
                    • BWP 14,250 goes directly to the library roof repair
                    <br />• Full transparency with photos and progress updates
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  No fees if project doesn't reach its funding goal!
                </p>
              </CardContent>
            </Card>

            {/* Government Procurement */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  🏛️ How does government procurement work?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  We follow all Botswana government procurement guidelines:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>
                    • Formal quotations and invoicing through PPADB-compliant
                    processes
                  </li>
                  <li>
                    • Quarterly billing aligned with government budget cycles
                  </li>
                  <li>• VAT registration and proper tax documentation</li>
                  <li>• Transparency reports for public accountability</li>
                  <li>• Dedicated account manager for government clients</li>
                </ul>
                <p className="text-sm text-blue-600 mt-3 font-medium">
                  📞 Contact our Government Sales team: +267 72977535
                </p>
              </CardContent>
            </Card>

            {/* Intla Business Partnership */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  🏪 What are the Intla Business Partnership requirements?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Requirements depend on your Intla partnership tier:
                </p>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div>
                    <strong>Community Supporter (BWP 200/month):</strong> Basic
                    business registration. Get sponsor badge and directory
                    listing.
                  </div>
                  <div>
                    <strong>Community Champion (BWP 500/month):</strong> CIPA
                    registration recommended. Featured visibility and local
                    deals promotion.
                  </div>
                  <div>
                    <strong>Corporate Impact Partner (BWP 1500+/month):</strong>{' '}
                    VAT registration required. Co-created CSR projects and API
                    access.
                  </div>
                </div>
                <p className="text-sm text-purple-600 mt-3 font-medium">
                  💡 All tiers include hyperlocal insights and measurable
                  community impact
                </p>
              </CardContent>
            </Card>

            {/* Internet Connectivity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  📶 What about internet connectivity in rural areas?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  The platform is designed for Botswana's connectivity
                  realities:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>
                    • Works on 2G/3G networks - no high-speed internet required
                  </li>
                  <li>• Offline mode for basic issue reporting and viewing</li>
                  <li>• SMS notifications for areas with limited data</li>
                  <li>• Mobile-first design optimized for low bandwidth</li>
                  <li>• Data usage: ~2MB per month for typical citizen use</li>
                </ul>
                <p className="text-sm text-blue-600 mt-3 font-medium">
                  📱 Average data cost: BWP 10-20/month for regular platform use
                </p>
              </CardContent>
            </Card>

            {/* Language Support */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  🗣️ Is the platform available in Setswana?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Yes! We support both English and Setswana:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Full interface translation in Setswana</li>
                  <li>• Automatic translation for government communications</li>
                  <li>• Voice-to-text in both languages for issue reporting</li>
                  <li>• SMS notifications in your preferred language</li>
                  <li>• Community discussions in local languages</li>
                </ul>
                <p className="text-sm text-green-600 mt-3 font-medium">
                  🌍 Coming soon: Support for other local languages like Kalanga
                  and Herero
                </p>
              </CardContent>
            </Card>

            {/* Technical Support */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  🛠️ What technical support is available?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Comprehensive support tailored to your subscription level:
                </p>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div>
                    <strong>Community Champions:</strong> WhatsApp support group
                    and online help center
                  </div>
                  <div>
                    <strong>Business Partners:</strong> Email and phone support
                    during business hours
                  </div>
                  <div>
                    <strong>Government Solutions:</strong> Dedicated account
                    manager and priority support
                  </div>
                </div>
                <p className="text-sm text-blue-600 mt-3 font-medium">
                  📞 Support: +267 72977535 (WhatsApp) |
                  support@civicportal.gov.bw
                </p>
              </CardContent>
            </Card>

            {/* Data Privacy */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  🔒 How is my data protected and stored?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  We follow strict Botswana data protection standards:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>
                    • Data stored in South African servers (POPIA compliant)
                  </li>
                  <li>
                    • Bank-level encryption for all financial transactions
                  </li>
                  <li>• No personal data shared without explicit consent</li>
                  <li>• Government access only through legal channels</li>
                  <li>• Anonymous contribution options available</li>
                </ul>
                <p className="text-sm text-green-600 mt-3 font-medium">
                  🛡️ Certified by Botswana Data Protection Office
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="p-12 space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold">
                  Ready to Join the Mmogo Impact Ecosystem?
                </h2>
                <p className="text-xl opacity-90 max-w-2xl mx-auto">
                  Start with free access to the Motse Platform, then choose your
                  level of engagement in building stronger communities across
                  Botswana.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  Start with Free Motse Platform
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  Explore Partnership Options
                </Button>
              </div>

              <p className="text-sm opacity-75">
                Free foundation layer • Transparent fees • Sustainable community
                impact
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </MainLayout>
  );
};

export default PricingPage;
