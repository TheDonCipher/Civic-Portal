import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';

const enhancedLegalConsentSchema = z.object({
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the Terms of Service to continue',
  }),
  privacyAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the Privacy Policy to continue',
  }),
  dataProcessingAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the Data Processing Agreement to continue',
  }),
});

type EnhancedLegalConsentFormData = z.infer<typeof enhancedLegalConsentSchema>;

interface ConsentTimestamps {
  termsAcceptedAt?: Date;
  privacyAcceptedAt?: Date;
  dataProcessingAcceptedAt?: Date;
}

interface EnhancedLegalConsentProps {
  onAccept?: (accepted: boolean) => void;
  onTimestampsChange?: (timestamps: ConsentTimestamps) => void;
  className?: string;
  disabled?: boolean;
}

export function EnhancedLegalConsent({
  onAccept = () => {},
  onTimestampsChange = () => {},
  className = '',
  disabled = false,
}: EnhancedLegalConsentProps) {
  const [timestamps, setTimestamps] = useState<ConsentTimestamps>({});

  const form = useForm<EnhancedLegalConsentFormData>({
    resolver: zodResolver(enhancedLegalConsentSchema),
    defaultValues: {
      termsAccepted: false,
      privacyAccepted: false,
      dataProcessingAccepted: false,
    },
  });

  const handleConsentChange = (field: keyof EnhancedLegalConsentFormData, checked: boolean) => {
    form.setValue(field, checked);
    
    const now = new Date();
    const newTimestamps = { ...timestamps };
    
    if (checked) {
      // Record timestamp when consent is given
      switch (field) {
        case 'termsAccepted':
          newTimestamps.termsAcceptedAt = now;
          break;
        case 'privacyAccepted':
          newTimestamps.privacyAcceptedAt = now;
          break;
        case 'dataProcessingAccepted':
          newTimestamps.dataProcessingAcceptedAt = now;
          break;
      }
    } else {
      // Clear timestamp when consent is withdrawn
      switch (field) {
        case 'termsAccepted':
          delete newTimestamps.termsAcceptedAt;
          break;
        case 'privacyAccepted':
          delete newTimestamps.privacyAcceptedAt;
          break;
        case 'dataProcessingAccepted':
          delete newTimestamps.dataProcessingAcceptedAt;
          break;
      }
    }
    
    setTimestamps(newTimestamps);
    onTimestampsChange(newTimestamps);
    
    // Check if all required consents are accepted
    const allAccepted = form.getValues('termsAccepted') && 
                       form.getValues('privacyAccepted') && 
                       form.getValues('dataProcessingAccepted');
    onAccept(allAccepted);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <Form {...form}>
        <div className="space-y-3">
          <FormField
            control={form.control}
            name="termsAccepted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={(checked) => handleConsentChange('termsAccepted', checked as boolean)}
                    disabled={disabled}
                    className="mt-1"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-medium leading-relaxed">
                    I accept the{' '}
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--gov-primary)] hover:text-[var(--gov-primary-dark)] hover:underline font-semibold transition-colors duration-200"
                    >
                      Terms of Service
                    </a>
                    {' *'}
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="privacyAccepted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={(checked) => handleConsentChange('privacyAccepted', checked as boolean)}
                    disabled={disabled}
                    className="mt-1"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-medium leading-relaxed">
                    I accept the{' '}
                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--gov-primary)] hover:text-[var(--gov-primary-dark)] hover:underline font-semibold transition-colors duration-200"
                    >
                      Privacy Policy
                    </a>
                    {' *'}
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dataProcessingAccepted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={(checked) => handleConsentChange('dataProcessingAccepted', checked as boolean)}
                    disabled={disabled}
                    className="mt-1"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-medium leading-relaxed">
                    I consent to data processing as described in the{' '}
                    <a
                      href="/legal/data-processing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--gov-primary)] hover:text-[var(--gov-primary-dark)] hover:underline font-semibold transition-colors duration-200"
                    >
                      Data Processing Agreement
                    </a>
                    {' *'}
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </div>
      </Form>
    </div>
  );
}

export default EnhancedLegalConsent;
