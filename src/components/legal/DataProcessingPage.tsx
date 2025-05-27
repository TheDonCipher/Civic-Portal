import React from 'react';
import MainLayout from '../layout/MainLayout';
import PageTitle from '../common/PageTitle';
import SEOHead from '../common/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Shield, Clock, FileText, Mail, Database, Lock } from 'lucide-react';

const DataProcessingPage = () => {
  return (
    <MainLayout>
      <SEOHead
        title="Data Processing Agreement"
        description="Legal basis for processing personal data under Botswana Data Protection Act 2024 for the Civic Portal platform."
      />

      <PageTitle
        title="Data Processing Agreement"
        description="Legal basis for processing your personal data under Botswana law"
        breadcrumbs={[
          { label: 'Legal' },
          { label: 'Data Processing Agreement' },
        ]}
      />

      <div className="w-full max-w-[1000px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Header Information */}
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Data Processing Agreement
                  <Badge variant="secondary">Version 2024.1</Badge>
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Effective: December 1, 2024</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>Last Updated: December 1, 2024</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm text-green-800 dark:text-green-200">
                <strong>Legal Compliance:</strong> This agreement establishes
                the legal basis for processing your personal data in accordance
                with the Botswana Data Protection Act (DPA) 2024 and
                international data protection standards.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Legal Framework */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              1. Legal Framework and Authority
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-3">Governing Legislation</h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>
                  • <strong>Botswana Data Protection Act (DPA) 2024</strong> -
                  Primary data protection law
                </li>
                <li>
                  •{' '}
                  <strong>
                    Electronic Communications and Transactions Act
                  </strong>{' '}
                  - Digital communications
                </li>
                <li>
                  • <strong>Access to Information Act</strong> - Government
                  transparency requirements
                </li>
                <li>
                  • <strong>Constitution of Botswana</strong> - Fundamental
                  rights and freedoms
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">
                Data Controller Authority
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                The Civic Portal operates under the authority of the Government
                of Botswana as the data controller, with legal mandate to
                process personal data for civic engagement and public service
                delivery purposes.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Processing Purposes */}
        <Card>
          <CardHeader>
            <CardTitle>2. Data Processing Purposes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p>
              We process your personal data for the following specific,
              explicit, and legitimate purposes:
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold">Primary Purposes</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground mt-2">
                    <li>• Facilitate civic issue reporting</li>
                    <li>• Enable citizen-government communication</li>
                    <li>• Track and manage issue resolution</li>
                    <li>• Provide platform services and support</li>
                    <li>• Verify government official identities</li>
                  </ul>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold">Secondary Purposes</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground mt-2">
                    <li>• Platform improvement and analytics</li>
                    <li>• Security and fraud prevention</li>
                    <li>• Legal compliance and reporting</li>
                    <li>• Research and policy development</li>
                    <li>• Public transparency initiatives</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold">Communication Purposes</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground mt-2">
                    <li>• Issue status notifications</li>
                    <li>• Platform updates and announcements</li>
                    <li>• Account security alerts</li>
                    <li>• Customer support responses</li>
                    <li>• Verification communications</li>
                  </ul>
                </div>

                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold">Administrative Purposes</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground mt-2">
                    <li>• User account management</li>
                    <li>• Access control and permissions</li>
                    <li>• Audit trails and logging</li>
                    <li>• Performance monitoring</li>
                    <li>• Backup and disaster recovery</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Basis */}
        <Card>
          <CardHeader>
            <CardTitle>3. Legal Basis for Processing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="mb-4">
              Under Article 6 of the Botswana DPA 2024, we process your personal
              data based on the following legal grounds:
            </p>

            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  1. Consent (Article 6(1)(a))
                </h4>
                <p className="text-sm text-green-800 dark:text-green-200">
                  You have given clear, informed consent for processing your
                  personal data for specific purposes such as account creation,
                  optional features, and marketing communications.
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  2. Performance of Contract (Article 6(1)(b))
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Processing is necessary to provide the civic engagement
                  services you have requested, including issue reporting,
                  tracking, and communication features.
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                  3. Legal Obligation (Article 6(1)(c))
                </h4>
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  Processing is required to comply with legal obligations under
                  Botswana law, including transparency requirements and
                  government accountability measures.
                </p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
                  4. Public Interest (Article 6(1)(e))
                </h4>
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  Processing is necessary for the performance of tasks carried
                  out in the public interest, specifically facilitating
                  democratic participation and government accountability.
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                  5. Legitimate Interests (Article 6(1)(f))
                </h4>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Processing is necessary for legitimate interests pursued by
                  the platform, such as security, fraud prevention, and service
                  improvement, balanced against your rights.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Categories */}
        <Card>
          <CardHeader>
            <CardTitle>4. Categories of Personal Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Identity Data
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Full name</li>
                    <li>• Email address</li>
                    <li>• Username</li>
                    <li>• Government ID (for officials)</li>
                    <li>• Department affiliation</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Contact Data</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Email addresses</li>
                    <li>• Phone numbers (optional)</li>
                    <li>• Constituency information</li>
                    <li>• Communication preferences</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Usage Data</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Issue reports and comments</li>
                    <li>• Voting and engagement data</li>
                    <li>• Platform usage patterns</li>
                    <li>• Login and session information</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Technical Data</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• IP addresses</li>
                    <li>• Browser and device information</li>
                    <li>• Cookies and tracking data</li>
                    <li>• Security logs</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Subject Rights */}
        <Card>
          <CardHeader>
            <CardTitle>5. Your Rights as a Data Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Under the Botswana DPA 2024, you have comprehensive rights
              regarding your personal data:
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-primary mb-2">
                  Access Rights
                </h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Request data copies</li>
                  <li>• Understand processing</li>
                  <li>• Know data recipients</li>
                </ul>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-blue-600 mb-2">
                  Control Rights
                </h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Correct inaccurate data</li>
                  <li>• Request data deletion</li>
                  <li>• Restrict processing</li>
                </ul>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-green-600 mb-2">
                  Portability Rights
                </h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Data portability</li>
                  <li>• Object to processing</li>
                  <li>• Withdraw consent</li>
                </ul>
              </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg mt-4">
              <p className="text-sm">
                <strong>Exercise Your Rights:</strong> Contact us at
                privacy@civicportal.gov.bw to exercise any of these rights. We
                will respond within 30 days as required by law.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>6. Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              For questions about this Data Processing Agreement or to exercise
              your rights:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <Mail className="w-4 h-4" />
                <span>privacy@civicportal.gov.bw</span>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787" />
                </svg>
                <a
                  href="https://wa.me/26772977535"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  WhatsApp: +267 72977535
                </a>
              </div>
              <p className="text-sm text-muted-foreground">
                Data Protection Officer: Government Enclave, Gaborone, Botswana
              </p>
              <p className="text-sm text-muted-foreground">
                Supervisory Authority: Botswana Information and Data Protection
                Commission
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default DataProcessingPage;
