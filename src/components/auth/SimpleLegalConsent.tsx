import React from 'react';
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

const simpleLegalConsentSchema = z.object({
  legalAcceptance: z.boolean().refine((val) => val === true, {
    message: 'You must accept the Terms of Service and Privacy Policy to continue',
  }),
});

type SimpleLegalConsentFormData = z.infer<typeof simpleLegalConsentSchema>;

interface SimpleLegalConsentProps {
  onAccept?: (accepted: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export function SimpleLegalConsent({
  onAccept = () => {},
  className = '',
  disabled = false,
}: SimpleLegalConsentProps) {
  const form = useForm<SimpleLegalConsentFormData>({
    resolver: zodResolver(simpleLegalConsentSchema),
    defaultValues: {
      legalAcceptance: false,
    },
  });

  const handleChange = (checked: boolean) => {
    form.setValue('legalAcceptance', checked);
    onAccept(checked);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <Form {...form}>
        <FormField
          control={form.control}
          name="legalAcceptance"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value || false}
                  onCheckedChange={handleChange}
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
                  </a>{' '}
                  and{' '}
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
      </Form>
    </div>
  );
}

export default SimpleLegalConsent;
