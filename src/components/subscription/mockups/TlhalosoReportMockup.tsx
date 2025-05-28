import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  MapPin,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  Download,
  Share2,
  Filter,
  Search,
  Eye,
  Lock,
  Shield,
  Database,
  FileText,
  PieChart,
  LineChart,
  Activity,
  Zap,
  Globe,
  Building2,
} from 'lucide-react';

/**
 * Tlhaloso Data & Insights Services Mockup
 *
 * This mockup demonstrates the "Tlhaloso" (Explanation/Analysis) data reports interface
 * for premium analytics services (BWP 1000+ reports/subscriptions).
 *
 * Features:
 * - Thematic intelligence reports
 * - Custom data projects
 * - Developer API access
 * - Anonymized civic data insights
 * - Strategic decision-making tools
 * - Ethical data framework compliance
 */

interface DataReport {
  id: string;
  title: string;
  category: string;
  type: 'thematic' | 'custom' | 'api';
  price: number;
  description: string;
  lastUpdated: string;
  dataPoints: number;
  regions: string[];
  timeframe: string;
  insights: Array<{
    title: string;
    value: string;
    trend: 'up' | 'down' | 'stable';
    description: string;
  }>;
  keyFindings: string[];
  methodology: string;
  ethicalCompliance: boolean;
}

interface APIEndpoint {
  id: string;
  name: string;
  description: string;
  category: string;
  dataType: string;
  updateFrequency: string;
  sampleSize: string;
  price: number;
}

const mockReports: DataReport[] = [
  {
    id: 'report-001',
    title: 'State of Water Access in Central District',
    category: 'Infrastructure',
    type: 'thematic',
    price: 1000,
    description:
      'Comprehensive analysis of water access issues, infrastructure gaps, and citizen satisfaction across Central District.',
    lastUpdated: '2024-01-15',
    dataPoints: 2847,
    regions: ['Central District', 'Serowe', 'Palapye', 'Mahalapye'],
    timeframe: '12 months',
    insights: [
      {
        title: 'Water Access Rate',
        value: '78%',
        trend: 'up',
        description: 'Improved by 5% from previous year',
      },
      {
        title: 'Average Response Time',
        value: '8.5 days',
        trend: 'down',
        description: 'Faster resolution of water issues',
      },
      {
        title: 'Citizen Satisfaction',
        value: '72%',
        trend: 'stable',
        description: 'Consistent satisfaction levels',
      },
    ],
    keyFindings: [
      'Rural areas show 23% lower water access compared to urban centers',
      'Seasonal variations significantly impact water availability',
      'Community-led initiatives show 40% better sustainability rates',
      'Investment in infrastructure correlates with 65% improvement in satisfaction',
    ],
    methodology:
      'Analysis based on anonymized citizen reports, government data, and field surveys',
    ethicalCompliance: true,
  },
  {
    id: 'report-002',
    title: 'Road Safety Hotspots & Trends in Gaborone',
    category: 'Transportation',
    type: 'thematic',
    price: 1200,
    description:
      'Detailed analysis of road safety issues, accident hotspots, and infrastructure needs in Greater Gaborone area.',
    lastUpdated: '2024-01-10',
    dataPoints: 1653,
    regions: ['Gaborone', 'Tlokweng', 'Mogoditshane', 'Gabane'],
    timeframe: '18 months',
    insights: [
      {
        title: 'Accident Reduction',
        value: '15%',
        trend: 'down',
        description: 'Significant improvement in road safety',
      },
      {
        title: 'Infrastructure Issues',
        value: '234',
        trend: 'up',
        description: 'Increase in reported road problems',
      },
      {
        title: 'Response Efficiency',
        value: '89%',
        trend: 'up',
        description: 'Improved emergency response times',
      },
    ],
    keyFindings: [
      'Main Mall and Western Bypass identified as primary hotspots',
      'Evening hours (5-7 PM) show highest incident rates',
      'Streetlight improvements correlate with 30% accident reduction',
      'Community reporting leads to 50% faster issue resolution',
    ],
    methodology:
      'Aggregated data from traffic reports, citizen submissions, and municipal records',
    ethicalCompliance: true,
  },
];

const mockAPIEndpoints: APIEndpoint[] = [
  {
    id: 'api-001',
    name: 'Issue Density Mapping',
    description:
      'Anonymized geographic distribution of civic issues by category and severity',
    category: 'Geographic Data',
    dataType: 'GeoJSON',
    updateFrequency: 'Daily',
    sampleSize: '10,000+ issues',
    price: 2000,
  },
  {
    id: 'api-002',
    name: 'Community Engagement Metrics',
    description: 'Aggregated citizen participation and satisfaction trends',
    category: 'Social Analytics',
    dataType: 'JSON',
    updateFrequency: 'Weekly',
    sampleSize: '5,000+ users',
    price: 1500,
  },
  {
    id: 'api-003',
    name: 'Infrastructure Performance Index',
    description:
      'Composite scores for infrastructure quality and maintenance needs',
    category: 'Infrastructure',
    dataType: 'CSV/JSON',
    updateFrequency: 'Monthly',
    sampleSize: '2,000+ data points',
    price: 2500,
  },
];

const TlhalosoReportMockup: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('reports');
  const [selectedReport, setSelectedReport] = useState<DataReport | null>(
    mockReports[0]
  );
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('12months');

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable':
        return <div className="w-4 h-0.5 bg-gray-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Badge
          variant="outline"
          className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700"
        >
          Tlhaloso Data & Insights Services
        </Badge>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Premium Analytics Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Strategic insights for informed decision-making • Kitso ya maano a
          botlhokwa
        </p>
      </div>

      {/* Ethical Framework Notice */}
      <Card className="border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-950/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <h3 className="font-medium text-green-800 dark:text-green-200">
                Ethical Data Framework
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                All data is anonymized and aggregated. No personally
                identifiable information is shared. Users can opt-out of data
                aggregation while maintaining report integrity.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports">Thematic Reports</TabsTrigger>
          <TabsTrigger value="custom">Custom Projects</TabsTrigger>
          <TabsTrigger value="api">Developer API</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Report List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Available Reports</CardTitle>
                  <div className="flex gap-2">
                    <Select
                      value={selectedRegion}
                      onValueChange={setSelectedRegion}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter by region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Regions</SelectItem>
                        <SelectItem value="central">
                          Central District
                        </SelectItem>
                        <SelectItem value="gaborone">
                          Greater Gaborone
                        </SelectItem>
                        <SelectItem value="south">Southern District</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockReports.map((report) => (
                      <div
                        key={report.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedReport?.id === report.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => setSelectedReport(report)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                              {report.title}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {report.category}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                BWP {report.price}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {report.timeframe}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Report Details */}
            <div className="lg:col-span-2">
              {selectedReport && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{selectedReport.title}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            {selectedReport.description}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                          <Button size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Purchase BWP {selectedReport.price}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {selectedReport.dataPoints.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Data Points
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600 dark:text-green-400">
                            {selectedReport.regions.length}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Regions
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            {selectedReport.timeframe}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Timeframe
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                            {selectedReport.lastUpdated}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Last Updated
                          </div>
                        </div>
                      </div>

                      {/* Key Insights */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {selectedReport.insights.map((insight, index) => (
                          <div
                            key={index}
                            className="p-3 border rounded-lg text-center"
                          >
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <span className="text-xl font-bold">
                                {insight.value}
                              </span>
                              {getTrendIcon(insight.trend)}
                            </div>
                            <div className="text-sm font-medium dark:text-gray-100">
                              {insight.title}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {insight.description}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Key Findings */}
                      <div>
                        <h4 className="font-medium mb-3 dark:text-gray-100">
                          Key Findings
                        </h4>
                        <div className="space-y-2">
                          {selectedReport.keyFindings.map((finding, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                              <span className="text-sm dark:text-gray-300">
                                {finding}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Methodology & Compliance */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Methodology</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {selectedReport.methodology}
                        </p>
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">
                              Data Sources
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            Civic Portal reports, government databases, field
                            surveys
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Compliance & Ethics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Data Anonymization</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Privacy Protection</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="text-sm">
                              Ethical Review Board Approved
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="text-sm">
                              Botswana Benefit Focus
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Data Projects</CardTitle>
              <p className="text-sm text-gray-600">
                Bespoke research projects tailored to your specific analytical
                needs
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Project Examples</h4>
                  <div className="space-y-3">
                    {[
                      {
                        title: 'Urban Planning Impact Assessment',
                        description:
                          'Analysis of public space utilization and infrastructure needs',
                        client: 'City Planning Department',
                        duration: '6-8 weeks',
                        price: 'BWP 15,000 - 25,000',
                      },
                      {
                        title: 'NGO Intervention Effectiveness',
                        description:
                          'Measuring community impact of development programs',
                        client: 'International NGO',
                        duration: '4-6 weeks',
                        price: 'BWP 12,000 - 18,000',
                      },
                      {
                        title: 'Infrastructure Investment ROI',
                        description:
                          'Cost-benefit analysis of proposed infrastructure projects',
                        client: 'Government Ministry',
                        duration: '8-12 weeks',
                        price: 'BWP 20,000 - 35,000',
                      },
                    ].map((project, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <h5 className="font-medium">{project.title}</h5>
                        <p className="text-sm text-gray-600 mt-1">
                          {project.description}
                        </p>
                        <div className="grid grid-cols-2 gap-4 mt-3 text-xs">
                          <div>
                            <span className="text-gray-500">Client Type:</span>
                            <div className="font-medium">{project.client}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Duration:</span>
                            <div className="font-medium">
                              {project.duration}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="text-xs text-gray-500">
                            Estimated Cost:
                          </span>
                          <div className="text-sm font-medium text-blue-600">
                            {project.price}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Request Custom Project</h4>
                  <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h5 className="font-medium mb-2">
                      Start Your Custom Project
                    </h5>
                    <p className="text-sm text-gray-600 mb-4">
                      Tell us about your research needs and we'll provide a
                      detailed proposal
                    </p>
                    <Button>
                      <FileText className="h-4 w-4 mr-2" />
                      Submit Project Request
                    </Button>
                  </div>

                  <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                    <h5 className="font-medium text-yellow-800 dark:text-yellow-200">
                      Project Process
                    </h5>
                    <div className="space-y-2 mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                      <div>1. Initial consultation & scope definition</div>
                      <div>2. Data collection & methodology design</div>
                      <div>3. Analysis & insight generation</div>
                      <div>4. Report delivery & presentation</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Developer API Access</CardTitle>
              <p className="text-sm text-gray-600">
                Programmatic access to anonymized, aggregated civic data for
                integration into your applications
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {mockAPIEndpoints.map((endpoint) => (
                  <div key={endpoint.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{endpoint.name}</h4>
                          <Badge variant="outline">{endpoint.category}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {endpoint.description}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Data Type:</span>
                            <div className="font-medium">
                              {endpoint.dataType}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Updates:</span>
                            <div className="font-medium">
                              {endpoint.updateFrequency}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Sample Size:</span>
                            <div className="font-medium">
                              {endpoint.sampleSize}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Price:</span>
                            <div className="font-medium text-blue-600">
                              BWP {endpoint.price}/month
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Docs
                        </Button>
                        <Button size="sm">Subscribe</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  API Features
                </h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700 dark:text-blue-300">
                  <div className="space-y-1">
                    <div>• RESTful API with JSON responses</div>
                    <div>• Rate limiting and authentication</div>
                    <div>• Real-time and historical data access</div>
                  </div>
                  <div className="space-y-1">
                    <div>• Comprehensive documentation</div>
                    <div>• SDKs for popular languages</div>
                    <div>• 24/7 technical support</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TlhalosoReportMockup;
