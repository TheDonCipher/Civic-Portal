import React from 'react';
import MainLayout from '../layout/MainLayout';
import PageTitle from '../common/PageTitle';
import SEOHead from '../common/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Shield, FileText, Clock, Mail } from 'lucide-react';

const PrivacyPolicyPage = () => {
  return (
    <MainLayout>
      <SEOHead
        title="Privacy Policy"
        description="Learn how the Civic Portal collects, uses, and protects your personal information in accordance with Botswana data protection laws."
      />

      <PageTitle
        title="Privacy Policy"
        description="How we collect, use, and protect your personal information"
        breadcrumbs={[{ label: 'Legal' }, { label: 'Privacy Policy' }]}
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
                  Privacy Policy
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
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Important:</strong> This Privacy Policy complies with
                the Botswana Data Protection Act (DPA) 2024 and explains how we
                collect, use, and protect your personal information when using
                the Civic Portal.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Controller */}
        <Card>
          <CardHeader>
            <CardTitle>1. Data Controller</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The data controller responsible for your personal data is the
              Civic Portal platform, operated under the authority of the
              Government of Botswana.
            </p>
            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Contact Information:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>privacy@civicportal.gov.bw</span>
                </div>
                <p>Physical Address: Government Enclave, Gaborone, Botswana</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card>
          <CardHeader>
            <CardTitle>2. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">Account Information</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h5 className="font-medium text-sm">Citizens:</h5>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Full name</li>
                    <li>• Email address</li>
                    <li>• Password (encrypted)</li>
                    <li>• Constituency (optional)</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-sm">Government Officials:</h5>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Full name</li>
                    <li>• Official government email</li>
                    <li>• Department affiliation</li>
                    <li>• Position/title</li>
                    <li>• Verification documents</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">User Content</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Issue reports (descriptions, categories, locations)</li>
                <li>• Comments and responses</li>
                <li>• Solution proposals</li>
                <li>• Uploaded images and files</li>
                <li>• Voting and engagement data</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">
                Automatically Collected Information
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• IP address and location data</li>
                <li>• Browser type and operating system</li>
                <li>• Pages visited and time spent</li>
                <li>• Device information</li>
                <li>• Usage patterns and analytics</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Legal Basis for Processing */}
        <Card>
          <CardHeader>
            <CardTitle>3. Legal Basis for Processing Personal Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              We process your personal data based on the following legal grounds
              under the Botswana Data Protection Act (DPA) 2024:
            </p>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold">Consent</h4>
                <p className="text-sm text-muted-foreground">
                  For account creation, optional information sharing, and
                  marketing communications. You can withdraw consent at any
                  time.
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold">Performance of Service</h4>
                <p className="text-sm text-muted-foreground">
                  To provide core platform services including issue reporting,
                  tracking, and communication.
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold">Legitimate Interests</h4>
                <p className="text-sm text-muted-foreground">
                  For platform improvement, security, fraud prevention, and
                  usage analytics.
                </p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold">Legal Obligation</h4>
                <p className="text-sm text-muted-foreground">
                  When required to comply with Botswana law or valid legal
                  requests.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Your Information */}
        <Card>
          <CardHeader>
            <CardTitle>4. How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              We use the information we collect for the following purposes:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Core Services</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Provide and maintain the platform</li>
                  <li>• Process issue reports and comments</li>
                  <li>• Facilitate citizen-government communication</li>
                  <li>• Verify government official identities</li>
                  <li>• Send notifications and updates</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Platform Improvement</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Analyze usage patterns and trends</li>
                  <li>• Improve user experience</li>
                  <li>• Detect and prevent fraud</li>
                  <li>• Ensure platform security</li>
                  <li>• Provide customer support</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How We Share Your Information */}
        <Card>
          <CardHeader>
            <CardTitle>5. How We Share Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Public Information</h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Issue reports, comments, and solutions are publicly visible to
                promote transparency. Your username will be displayed with your
                public contributions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">
                Information Sharing Scenarios
              </h4>
              <div className="space-y-3">
                <div className="border-l-4 border-primary pl-4">
                  <h5 className="font-medium">With Government Departments</h5>
                  <p className="text-sm text-muted-foreground">
                    Issue details are shared with relevant verified government
                    officials to facilitate resolution.
                  </p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h5 className="font-medium">With Service Providers</h5>
                  <p className="text-sm text-muted-foreground">
                    We share data with trusted service providers (hosting,
                    analytics) under strict contractual obligations.
                  </p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <h5 className="font-medium">For Legal Reasons</h5>
                  <p className="text-sm text-muted-foreground">
                    When required by Botswana law or valid legal requests from
                    authorities.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Security and Retention */}
        <Card>
          <CardHeader>
            <CardTitle>6. Data Security and Retention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-3">Security Measures</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• End-to-end encryption for data transmission</li>
                <li>• Secure authentication and password protection</li>
                <li>• Row-level security for database access</li>
                <li>• Regular security audits and monitoring</li>
                <li>• Access controls and user permissions</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Data Retention</h4>
              <p className="text-sm text-muted-foreground mb-2">
                We retain your personal information only as long as necessary
                for the purposes outlined in this policy:
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>
                  • Account data: Until account deletion or 3 years of
                  inactivity
                </li>
                <li>
                  • Issue reports: Retained for historical and transparency
                  purposes
                </li>
                <li>• Analytics data: Anonymized after 2 years</li>
                <li>• Legal compliance: As required by Botswana law</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Your Data Protection Rights */}
        <Card>
          <CardHeader>
            <CardTitle>7. Your Data Protection Rights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Under the Botswana Data Protection Act (DPA) 2024, you have the
              following rights:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="border-l-4 border-primary pl-4">
                  <h5 className="font-medium">Right to Access</h5>
                  <p className="text-sm text-muted-foreground">
                    Request copies of your personal data
                  </p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h5 className="font-medium">Right to Rectification</h5>
                  <p className="text-sm text-muted-foreground">
                    Correct inaccurate or incomplete information
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h5 className="font-medium">Right to Erasure</h5>
                  <p className="text-sm text-muted-foreground">
                    Request deletion of your personal data
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="border-l-4 border-orange-500 pl-4">
                  <h5 className="font-medium">Right to Restrict Processing</h5>
                  <p className="text-sm text-muted-foreground">
                    Limit how we process your data
                  </p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <h5 className="font-medium">Right to Data Portability</h5>
                  <p className="text-sm text-muted-foreground">
                    Transfer your data to another service
                  </p>
                </div>
                <div className="border-l-4 border-red-500 pl-4">
                  <h5 className="font-medium">Right to Object</h5>
                  <p className="text-sm text-muted-foreground">
                    Object to certain processing activities
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg mt-4">
              <p className="text-sm">
                <strong>To exercise these rights:</strong> Contact us at
                privacy@civicportal.gov.bw. We will respond within the
                timeframes required by the DPA 2024.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cross-Border Data Transfers */}
        <Card>
          <CardHeader>
            <CardTitle>8. Cross-Border Data Transfers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Your information may be transferred to and maintained on servers
              located outside of Botswana through our hosting provider
              (Supabase). We ensure appropriate safeguards are in place:
            </p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>
                • Standard Contractual Clauses approved by data protection
                authorities
              </li>
              <li>• Encryption in transit and at rest</li>
              <li>• Regular security assessments of service providers</li>
              <li>• Compliance with international data protection standards</li>
            </ul>
          </CardContent>
        </Card>

        {/* Changes to This Policy */}
        <Card>
          <CardHeader>
            <CardTitle>9. Changes to This Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We may update this Privacy Policy from time to time. We will
              notify you of any material changes by posting the new policy on
              this page and updating the "Last Updated" date. Continued use of
              the platform after changes constitutes acceptance of the updated
              policy.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>10. Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              If you have questions about this Privacy Policy or wish to
              exercise your data protection rights, please contact us:
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
                You also have the right to lodge a complaint with the Botswana
                Information and Data Protection Commission if you believe your
                data protection rights have been infringed.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default PrivacyPolicyPage;
