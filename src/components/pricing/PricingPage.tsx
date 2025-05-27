import React from 'react';
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
  BarChart3,
  CheckCircle,
  Star,
  Zap,
  Shield,
  Globe,
  TrendingUp,
  Handshake,
  Target,
} from 'lucide-react';

const PricingPage = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto mobile-padding section-spacing">
        {/* Hero Section */}
        <section className="text-center space-y-6 py-12">
          <div className="space-y-4">
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
              <Globe className="w-4 h-4 mr-2" />
              Empowering Botswana Communities
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Building Our Nation,{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Together
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              In the spirit of <em>Botho</em> and <em>Kagisano</em>, our pricing
              reflects the Ubuntu philosophy: "I am because we are." Every
              contribution, no matter how small, strengthens our collective
              voice.
            </p>
          </div>

          {/* Philosophy Banner */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 dark:from-blue-950/30 dark:to-purple-950/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-4 text-center">
                <Heart className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    "Motho ke motho ka batho ba bangwe"
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    A person is a person through other people - Ubuntu
                    Philosophy
                  </p>
                </div>
                <Heart className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Pricing Tiers */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Choose Your Impact Level</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From individual contributions to institutional partnerships, every
              level creates meaningful change in our communities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Tier 1: Community-Powered Solutions */}
            <Card className="relative border-2 hover:border-green-300 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Community Champion</CardTitle>
                  <CardDescription>
                    Every Motswana Can Make a Difference
                  </CardDescription>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-green-600">
                    BWP 5+
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Per contribution • No monthly commitment
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center mb-4">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    Perfect for individual citizens who want to contribute to
                    their community's development
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-700 dark:text-green-300 flex items-center gap-2">
                      💰 Flexible Contributions
                    </h4>
                    <div className="space-y-2 ml-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          Contribute BWP 5-50 to any community issue
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          No platform fees for contributions under BWP 50
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          Orange Money, MyZaka & BTC Smega support
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-700 dark:text-green-300 flex items-center gap-2">
                      📊 Impact Tracking
                    </h4>
                    <div className="space-y-2 ml-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          Real-time progress visualization of your contributions
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          See exactly how your BWP 5 helps fix community issues
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          Before/after photos and community testimonials
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-700 dark:text-green-300 flex items-center gap-2">
                      🏆 Community Recognition
                    </h4>
                    <div className="space-y-2 ml-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          "Adopt-an-Issue" monthly subscriptions (BWP 8-25)
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          Digital guardian certificates for adopted issues
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          Community leaderboards and social sharing
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-center">
                    <p className="text-sm text-green-700 dark:text-green-300 font-medium mb-1">
                      "Your BWP 5 + 47 neighbors = BWP 240"
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Enough to fix street lights in Mogoditshane!
                    </p>
                  </div>
                </div>

                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Start Contributing Today
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  No signup required • Contribute anonymously • Cancel anytime
                </p>
              </CardContent>
            </Card>

            {/* Tier 2: Local Business Integration */}
            <Card className="relative border-2 hover:border-purple-300 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Business Partner</CardTitle>
                  <CardDescription>
                    Grow Your Business While Helping Your Community
                  </CardDescription>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-purple-600">
                    BWP 100-500
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Per month • 3 sponsorship tiers
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center mb-4">
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Ideal for local businesses wanting to support their
                    community while gaining visibility
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-purple-700 dark:text-purple-300 flex items-center gap-2">
                      🏪 Sponsorship Tiers
                    </h4>
                    <div className="space-y-2 ml-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Spaza Shop (BWP 100/month):</strong> Logo on 1
                          local issue
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Small Business (BWP 250/month):</strong>{' '}
                          Priority listing + radio mentions
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Established Business (BWP 500/month):</strong>{' '}
                          Featured placement + events
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-purple-700 dark:text-purple-300 flex items-center gap-2">
                      📢 Marketing Benefits
                    </h4>
                    <div className="space-y-2 ml-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          Logo placement on sponsored community issues
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          Monthly mentions on Yarona FM radio
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          Social media recognition and sharing tools
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-purple-700 dark:text-purple-300 flex items-center gap-2">
                      📊 Impact Reporting
                    </h4>
                    <div className="space-y-2 ml-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          Quarterly impact reports with photos and testimonials
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          Community reach metrics and engagement data
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          Priority access to community events and initiatives
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="text-center">
                    <p className="text-sm text-purple-700 dark:text-purple-300 font-medium mb-1">
                      "Proudly supporting Tlokweng community improvements"
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400">
                      Join 50+ local businesses making a difference
                    </p>
                  </div>
                </div>

                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  Become a Community Sponsor
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Bank transfer • Cheque • Mobile money • Cancel anytime
                </p>
              </CardContent>
            </Card>

            {/* Tier 3: Government Efficiency */}
            <Card className="relative border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white px-4 py-1">
                  <Star className="w-4 h-4 mr-1" />
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="text-center space-y-4 pt-8">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    Government Solutions
                  </CardTitle>
                  <CardDescription>
                    Transparent Governance for All Levels
                  </CardDescription>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-blue-600">
                    BWP 800-6000
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Per month • Quarterly billing
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center mb-4">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Comprehensive tools for ward councilors, district officers,
                    and national ministries
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      🏛️ Government Tiers
                    </h4>
                    <div className="space-y-2 ml-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Ward Level (BWP 800/month):</strong> 5 users,
                          basic reporting
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>District Level (BWP 2500/month):</strong> 25
                          users, advanced analytics
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>National Level (BWP 6000/month):</strong> 100
                          users, full oversight
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      📊 Management Tools
                    </h4>
                    <div className="space-y-2 ml-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          Advanced issue tracking and status management
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          Performance dashboards with KPI tracking
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          Budget allocation and expenditure tracking
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      🤝 Citizen Engagement
                    </h4>
                    <div className="space-y-2 ml-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          Direct messaging with automatic translation
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          Mobile reports with smartphone camera integration
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          Transparency-compliant reporting and invoicing
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-center">
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">
                      "85% faster issue resolution with transparent governance"
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Trusted by 12+ government departments
                    </p>
                  </div>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Contact Government Sales
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Formal invoicing • Quarterly billing • Dedicated support
                </p>
              </CardContent>
            </Card>

            {/* Tier 4: Data & Insights */}
            <Card className="relative border-2 hover:border-orange-300 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Data & Insights</CardTitle>
                  <CardDescription>
                    Smart Analytics for Decision Makers
                  </CardDescription>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-orange-600">
                    BWP 200-1200
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Per month • 3 insight levels
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center mb-4">
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    Perfect for community leaders, researchers, and decision
                    makers who need actionable insights
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-orange-700 dark:text-orange-300 flex items-center gap-2">
                      📈 Analytics Tiers
                    </h4>
                    <div className="space-y-2 ml-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Community Leader (BWP 200/month):</strong>{' '}
                          Monthly area reports
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>
                            Business Intelligence (BWP 500/month):
                          </strong>{' '}
                          Market & community insights
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          <strong>Government Premium (BWP 1200/month):</strong>{' '}
                          Policy impact analysis
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-orange-700 dark:text-orange-300 flex items-center gap-2">
                      📱 Smart Delivery
                    </h4>
                    <div className="space-y-2 ml-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          WhatsApp Business integration for instant insights
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          Simple dashboards with "Top 3 issues" summaries
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          Community satisfaction scores and trend analysis
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-orange-700 dark:text-orange-300 flex items-center gap-2">
                      🎯 Actionable Insights
                    </h4>
                    <div className="space-y-2 ml-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          AI-powered recommendations: "Focus on road
                          maintenance"
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          Cross-district comparison and benchmarking
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          Policy impact measurement and ROI tracking
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="text-center">
                    <p className="text-sm text-orange-700 dark:text-orange-300 font-medium mb-1">
                      "Data-driven decisions for community growth"
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                      Trusted by 25+ community leaders and researchers
                    </p>
                  </div>
                </div>

                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                  Get Smart Insights
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Email delivery • WhatsApp reports • Export capabilities
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Impact Stories Section */}
        <section className="py-16 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-2xl">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">Real Impact, Real Stories</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                See how communities across Botswana are using the Civic Portal
                to create lasting change
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      BWP 2,340
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Raised by Mogoditshane community
                    </p>
                  </div>
                  <p className="text-sm">
                    "47 neighbors contributed BWP 5-50 each to fix our street
                    lights. Now our children walk safely to school."
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    - Thabo M., Ward Councilor
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <Handshake className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      3 Businesses
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Sponsoring Tlokweng improvements
                    </p>
                  </div>
                  <p className="text-sm">
                    "Local businesses are proud to support community
                    development. Our BWP 300/month helps maintain the local
                    park."
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    - Sarah K., Business Owner
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">85%</div>
                    <p className="text-sm text-muted-foreground">
                      Faster issue resolution
                    </p>
                  </div>
                  <p className="text-sm">
                    "The government dashboard helps us track and resolve
                    community issues more efficiently than ever before."
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    - Ministry of Local Government
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Philosophy & Values Section */}
        <section className="py-16 text-center space-y-12">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Built on Botswana Values</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our pricing model reflects the core principles that make Botswana
              strong: unity, democracy, development, and self-reliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Kagisano (Unity)</h3>
                <p className="text-sm text-muted-foreground">
                  Every contribution, big or small, strengthens our collective
                  voice
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  Puso ya Batho (Democracy)
                </h3>
                <p className="text-sm text-muted-foreground">
                  Transparent governance with accessible pricing for all levels
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  Tsosoloso (Development)
                </h3>
                <p className="text-sm text-muted-foreground">
                  Sustainable growth through community-driven solutions
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  Boitekanelo (Self-Reliance)
                </h3>
                <p className="text-sm text-muted-foreground">
                  Empowering communities to solve their own challenges
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
                  🚀 How do I get started as a citizen?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Getting started is simple and requires no upfront commitment:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>
                    • Visit any issue on the platform and click "Contribute"
                  </li>
                  <li>
                    • Choose your contribution amount (starting from BWP 5)
                  </li>
                  <li>• Pay via Orange Money, MyZaka, or BTC Smega</li>
                  <li>
                    • Track your impact in real-time with photos and updates
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-3">
                  No registration required for contributions under BWP 50!
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

            {/* Why BWP 5 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  💰 Why start at just BWP 5?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  BWP 5 reflects our Ubuntu philosophy - every Motswana should
                  be able to contribute to their community's development.
                </p>
                <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg text-sm">
                  <p className="text-green-700 dark:text-green-300 font-medium mb-2">
                    Real Example:
                  </p>
                  <p className="text-green-600 dark:text-green-400">
                    In Mogoditshane, 47 neighbors each contributed BWP 5-50 to
                    raise BWP 2,340 for street light repairs. Small
                    contributions, big impact!
                  </p>
                </div>
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

            {/* Business Registration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  🏪 Do I need business registration for sponsorship?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Requirements depend on your sponsorship level:
                </p>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div>
                    <strong>Spaza Shop (BWP 100/month):</strong> No formal
                    registration required. Perfect for informal businesses.
                  </div>
                  <div>
                    <strong>Small Business (BWP 250/month):</strong> CIPA
                    registration recommended for tax benefits and radio
                    mentions.
                  </div>
                  <div>
                    <strong>Established Business (BWP 500/month):</strong> VAT
                    registration required for formal invoicing and event
                    participation.
                  </div>
                </div>
                <p className="text-sm text-purple-600 mt-3 font-medium">
                  💡 We can help connect you with CIPA registration services
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
                  Ready to Make a Difference?
                </h2>
                <p className="text-xl opacity-90 max-w-2xl mx-auto">
                  Join thousands of Batswana who are already building stronger
                  communities through the Civic Portal.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  Start with BWP 5
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  Contact Sales Team
                </Button>
              </div>

              <p className="text-sm opacity-75">
                No setup fees • Cancel anytime • 30-day money-back guarantee
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </MainLayout>
  );
};

export default PricingPage;
