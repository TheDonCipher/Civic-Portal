import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FileText,
  Shield,
  Mail,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { getClientIpAddress } from '@/lib/utils/ipUtils';

const legalConsentSchema = z.object({
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the Terms of Service to continue',
  }),
  privacyAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the Privacy Policy to continue',
  }),
  marketingOptIn: z.boolean().optional(),
  dataProcessingConsent: z.boolean().refine((val) => val === true, {
    message: 'You must consent to data processing to use this service',
  }),
});

type LegalConsentFormData = z.infer<typeof legalConsentSchema>;

interface LegalConsentProps {
  onAccept?: (consents: LegalConsentFormData) => void;
  onDecline?: () => void;
  className?: string;
  showOptional?: boolean;
}

const CURRENT_VERSIONS = {
  terms: '2024.1',
  privacy: '2024.1',
  dataProcessing: '2024.1',
};

const LEGAL_DOCUMENTS = [
  {
    id: 'terms',
    title: 'Terms of Service',
    description: 'Rules and guidelines for using Civic Portal',
    icon: FileText,
    url: '/legal/terms',
    version: CURRENT_VERSIONS.terms,
    lastUpdated: 'December 1, 2024',
    required: true,
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    description: 'How we collect, use, and protect your personal information',
    icon: Shield,
    url: '/legal/privacy',
    version: CURRENT_VERSIONS.privacy,
    lastUpdated: 'December 1, 2024',
    required: true,
  },
  {
    id: 'dataProcessing',
    title: 'Data Processing Agreement',
    description:
      'Legal basis for processing your personal data under Botswana law',
    icon: Shield,
    url: '/legal/data-processing',
    version: CURRENT_VERSIONS.dataProcessing,
    lastUpdated: 'December 1, 2024',
    required: true,
  },
];

export function LegalConsent({
  onAccept = () => {},
  onDecline = () => {},
  className = '',
  showOptional = true,
}: LegalConsentProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LegalConsentFormData>({
    resolver: zodResolver(legalConsentSchema),
    defaultValues: {
      termsAccepted: false,
      privacyAccepted: false,
      marketingOptIn: false,
      dataProcessingConsent: false,
    },
  });

  const onSubmit = async (data: LegalConsentFormData) => {
    setIsLoading(true);

    try {
      // Record consent with metadata
      const consentData = {
        ...data,
        timestamp: new Date(),
        versions: CURRENT_VERSIONS,
        ipAddress: await getClientIpAddress(),
        userAgent: navigator.userAgent,
      };

      onAccept(consentData);
    } catch (error) {
      console.error('Error recording consent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const allRequiredAccepted =
    form.watch('termsAccepted') &&
    form.watch('privacyAccepted') &&
    form.watch('dataProcessingConsent');

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-primary/10 rounded-full">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Legal Agreements</h2>
        <p className="text-muted-foreground">
          Please review and accept our legal agreements to continue
        </p>
      </div>

      {/* Legal Documents */}
      <div className="space-y-4">
        {LEGAL_DOCUMENTS.map((doc) => {
          const Icon = doc.icon;
          return (
            <Card key={doc.id} className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {doc.title}
                        {doc.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {doc.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="flex-shrink-0"
                  >
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      Read
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Version {doc.version}</span>
                  <span>Last updated: {doc.lastUpdated}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Consent Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Consent</CardTitle>
              <CardDescription>
                Please check the boxes below to indicate your agreement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Terms of Service */}
              <FormField
                control={form.control}
                name="termsAccepted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium">
                        I accept the Terms of Service *
                      </FormLabel>
                      <FormDescription>
                        You agree to follow our community guidelines and
                        platform rules
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Separator />

              {/* Privacy Policy */}
              <FormField
                control={form.control}
                name="privacyAccepted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium">
                        I accept the Privacy Policy *
                      </FormLabel>
                      <FormDescription>
                        You understand how we collect, use, and protect your
                        personal information
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Separator />

              {/* Data Processing Consent */}
              <FormField
                control={form.control}
                name="dataProcessingConsent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium">
                        I consent to data processing *
                      </FormLabel>
                      <FormDescription>
                        You consent to processing of your personal data as
                        described in our Privacy Policy
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              {showOptional && (
                <>
                  <Separator />

                  {/* Marketing Opt-in */}
                  <FormField
                    control={form.control}
                    name="marketingOptIn"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value || false}
                            onCheckedChange={field.onChange}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-medium">
                            Send me updates and newsletters
                          </FormLabel>
                          <FormDescription>
                            Receive occasional updates about platform
                            improvements and civic engagement opportunities
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* Legal Notice */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Legal Notice:</strong> By accepting these agreements, you
              acknowledge that you have read, understood, and agree to be bound
              by these terms. Your consent is recorded with timestamp and IP
              address for legal compliance under Botswana data protection laws.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onDecline}
              disabled={isLoading}
              className="flex-1"
            >
              Decline
            </Button>
            <Button
              type="submit"
              disabled={!allRequiredAccepted || isLoading}
              isLoading={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Recording Consent...' : 'Accept & Continue'}
            </Button>
          </div>
        </form>
      </Form>

      {/* Footer */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          * Required fields. You can change your marketing preferences anytime
          in your account settings.
        </p>
      </div>
    </div>
  );
}

export default LegalConsent;
