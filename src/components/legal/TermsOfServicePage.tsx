import React from 'react';
import MainLayout from '../layout/MainLayout';
import PageTitle from '../common/PageTitle';
import SEOHead from '../common/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  FileText,
  Clock,
  Mail,
  Users,
  Shield,
  AlertTriangle,
} from 'lucide-react';

const TermsOfServicePage = () => {
  return (
    <MainLayout>
      <SEOHead
        title="Terms of Service"
        description="Terms and conditions for using the Civic Portal platform, including user responsibilities and platform guidelines."
      />

      <PageTitle
        title="Terms of Service"
        description="Rules and guidelines for using the Civic Portal platform"
        breadcrumbs={[{ label: 'Legal' }, { label: 'Terms of Service' }]}
      />

      <div className="w-full max-w-[1000px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Header Information */}
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Terms of Service
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
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Welcome to the Civic Portal!</strong> These Terms of
                Service govern your use of our platform for reporting and
                tracking civic issues in Botswana. By using our service, you
                agree to these terms.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Acceptance of Terms */}
        <Card>
          <CardHeader>
            <CardTitle>1. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              By registering for, accessing, or using the Civic Portal, you
              accept and agree to be bound by these Terms of Service and our
              Privacy Policy. If you do not agree to these terms, you must not
              access or use the service.
            </p>
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Important:</strong> These terms are governed by the
                  laws of the Republic of Botswana. Continued use of the
                  platform constitutes acceptance of any updates to these terms.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Roles and Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              2. User Roles and Accounts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p>
              The Civic Portal offers different functionalities based on user
              roles:
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-primary mb-2">Citizens</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Report civic issues</li>
                  <li>• Comment and vote on issues</li>
                  <li>• Propose solutions</li>
                  <li>• Track issue progress</li>
                  <li>• Receive notifications</li>
                </ul>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-blue-600 mb-2">
                  Government Officials
                </h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Manage issue statuses</li>
                  <li>• Provide official updates</li>
                  <li>• Access department dashboards</li>
                  <li>• Select approved solutions</li>
                  <li>• View performance metrics</li>
                </ul>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-green-600 mb-2">
                  Administrators
                </h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Platform management</li>
                  <li>• User verification</li>
                  <li>• Content moderation</li>
                  <li>• System oversight</li>
                  <li>• Analytics access</li>
                </ul>
              </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Account Responsibilities</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>
                  • Provide accurate and current information during registration
                </li>
                <li>• Keep your account information updated</li>
                <li>• Safeguard your password and account security</li>
                <li>• Notify us immediately of any unauthorized account use</li>
                <li>
                  • Take responsibility for all activities under your account
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Acceptable Use */}
        <Card>
          <CardHeader>
            <CardTitle>3. Acceptable Use of the Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              You agree to use the Civic Portal only for lawful purposes and in
              accordance with these Terms.
            </p>

            <div>
              <h4 className="font-semibold mb-3 text-green-600">
                ✓ Encouraged Behavior
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>
                  • Report genuine civic issues that affect your community
                </li>
                <li>• Provide accurate and helpful information</li>
                <li>• Engage constructively in discussions</li>
                <li>• Respect other users and officials</li>
                <li>• Follow up on your reported issues appropriately</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-red-600">
                ✗ Prohibited Activities
              </h4>
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <ul className="text-sm space-y-1 text-red-800 dark:text-red-200">
                  <li>• Posting false, misleading, or fraudulent reports</li>
                  <li>• Harassment, abuse, or threatening behavior</li>
                  <li>
                    • Impersonating others or misrepresenting affiliations
                  </li>
                  <li>
                    • Uploading inappropriate, offensive, or illegal content
                  </li>
                  <li>• Spamming or posting unsolicited advertisements</li>
                  <li>• Attempting to disrupt or interfere with the service</li>
                  <li>
                    • Violating any applicable Botswana laws or regulations
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content and User Responsibilities */}
        <Card>
          <CardHeader>
            <CardTitle>4. Content: Reports, Comments, and Solutions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-3">User-Generated Content</h4>
              <p className="text-sm text-muted-foreground mb-3">
                You are solely responsible for all content you submit, including
                issue reports, comments, images, and proposed solutions.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border-l-4 border-primary pl-4">
                  <h5 className="font-medium">Your Responsibilities</h5>
                  <ul className="text-sm space-y-1 text-muted-foreground mt-2">
                    <li>• Ensure accuracy and truthfulness</li>
                    <li>• Respect privacy and confidentiality</li>
                    <li>• Own or have rights to uploaded content</li>
                    <li>• Follow community guidelines</li>
                  </ul>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h5 className="font-medium">License Grant</h5>
                  <p className="text-sm text-muted-foreground mt-2">
                    By submitting content, you grant us a license to use,
                    display, and distribute it in connection with the service
                    and for promoting civic engagement.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Content Moderation</h4>
              <p className="text-sm text-muted-foreground">
                We reserve the right to review, edit, or remove any content that
                violates these terms or is deemed inappropriate. We aim for
                transparency in our moderation process while maintaining a safe
                and constructive environment.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Government Official Use */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              5. Government Official Use
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Verified Government Officials have additional responsibilities and
              privileges on the platform:
            </p>

            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold">Official Responsibilities</h4>
                <ul className="text-sm space-y-1 text-muted-foreground mt-2">
                  <li>
                    • Use official functions responsibly and professionally
                  </li>
                  <li>• Provide accurate status updates and information</li>
                  <li>• Respond to issues within reasonable timeframes</li>
                  <li>• Maintain confidentiality of sensitive information</li>
                  <li>• Represent your department appropriately</li>
                </ul>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Note:</strong> Misuse of official status or
                  permissions may result in account suspension or termination.
                  All official actions are logged for accountability.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card>
          <CardHeader>
            <CardTitle>6. Intellectual Property Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The Civic Portal and its contents, features, and functionality are
              owned by the Government of Botswana and are protected by
              copyright, trademark, and other intellectual property laws.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold">Platform Content</h4>
                <ul className="text-sm space-y-1 text-muted-foreground mt-2">
                  <li>• Software and source code</li>
                  <li>• Design and user interface</li>
                  <li>• Documentation and help materials</li>
                  <li>• Logos and branding elements</li>
                </ul>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold">Usage Restrictions</h4>
                <ul className="text-sm space-y-1 text-muted-foreground mt-2">
                  <li>• No copying or redistribution</li>
                  <li>• No reverse engineering</li>
                  <li>• No commercial use without permission</li>
                  <li>• Respect trademark usage</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card>
          <CardHeader>
            <CardTitle>7. Account Termination</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-3">Platform Rights</h4>
              <p className="text-sm text-muted-foreground mb-3">
                We may terminate or suspend your access to the service, without
                prior notice, for any reason including violation of these Terms.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">User Rights</h4>
              <p className="text-sm text-muted-foreground mb-3">
                You may terminate your account at any time by contacting us or
                using the account deletion feature in your profile settings.
              </p>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Effect of Termination</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Your right to use the service immediately ceases</li>
                <li>• Public content may remain for transparency purposes</li>
                <li>
                  • Personal data will be handled according to our Privacy
                  Policy
                </li>
                <li>
                  • You remain responsible for any outstanding obligations
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimers */}
        <Card>
          <CardHeader>
            <CardTitle>8. Disclaimers and Limitations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-amber-800 dark:text-amber-200">
                Service Disclaimer
              </h4>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                The service is provided "AS IS" and "AS AVAILABLE" without
                warranties of any kind. We do not guarantee uninterrupted
                service, error-free operation, or specific outcomes for reported
                issues.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Platform Role</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>
                  • We facilitate communication between citizens and government
                </li>
                <li>• We do not guarantee resolution of reported issues</li>
                <li>
                  • Government departments are responsible for addressing issues
                </li>
                <li>
                  • Response times depend on department resources and priorities
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Limitation of Liability</h4>
              <p className="text-sm text-muted-foreground">
                To the fullest extent permitted by Botswana law, we shall not be
                liable for any indirect, incidental, special, or consequential
                damages arising from your use of the service.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card>
          <CardHeader>
            <CardTitle>9. Governing Law and Dispute Resolution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <h4 className="font-semibold">Governing Law</h4>
              <p className="text-sm text-muted-foreground mt-2">
                These Terms are governed by the laws of the Republic of
                Botswana, without regard to conflict of law provisions.
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold">Dispute Resolution</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Any disputes arising from these Terms shall be resolved through
                the courts of Botswana. We encourage users to contact us first
                to resolve issues amicably.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card>
          <CardHeader>
            <CardTitle>10. Changes to These Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              We reserve the right to modify these Terms at any time. Material
              changes will be announced with at least 30 days' notice. Continued
              use of the service after changes take effect constitutes
              acceptance of the updated terms.
            </p>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Stay Informed:</strong> We recommend reviewing these
                Terms periodically. The "Last Updated" date at the top indicates
                when changes were last made.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>11. Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              If you have questions about these Terms of Service, please contact
              us:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <Mail className="w-4 h-4" />
                <span>legal@civicportal.gov.bw</span>
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
                Physical Address: Government Enclave, Gaborone, Botswana
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default TermsOfServicePage;
