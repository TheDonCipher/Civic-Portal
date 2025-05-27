import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star } from 'lucide-react';

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingTierProps {
  title: string;
  description: string;
  price: string;
  priceDescription: string;
  icon: React.ReactNode;
  features: PricingFeature[];
  highlighted?: boolean;
  highlightText?: string;
  ctaText: string;
  ctaVariant?: 'default' | 'secondary' | 'outline';
  testimonial?: {
    text: string;
    author: string;
  };
  gradient?: string;
  iconBg?: string;
  accentColor?: string;
  onCtaClick?: () => void;
}

const PricingTier: React.FC<PricingTierProps> = ({
  title,
  description,
  price,
  priceDescription,
  icon,
  features,
  highlighted = false,
  highlightText,
  ctaText,
  ctaVariant = 'default',
  testimonial,
  gradient = 'from-gray-100 to-gray-100',
  iconBg = 'bg-gray-100',
  accentColor = 'text-gray-600',
  onCtaClick,
}) => {
  return (
    <Card 
      className={`relative border-2 transition-all duration-300 hover:shadow-lg ${
        highlighted 
          ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 hover:shadow-xl' 
          : 'hover:border-blue-300'
      }`}
    >
      {highlighted && highlightText && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-blue-600 text-white px-4 py-1">
            <Star className="w-4 h-4 mr-1" />
            {highlightText}
          </Badge>
        </div>
      )}
      
      <CardHeader className={`text-center space-y-4 ${highlighted ? 'pt-8' : ''}`}>
        <div className={`mx-auto w-16 h-16 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="space-y-2">
          <div className="text-3xl font-bold">{price}</div>
          <p className="text-sm text-muted-foreground">{priceDescription}</p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <CheckCircle className={`w-4 h-4 ${accentColor.replace('text-', 'text-').replace('-600', '-500')}`} />
              <span className="text-sm">{feature.text}</span>
            </div>
          ))}
        </div>
        
        {testimonial && (
          <div className={`bg-gradient-to-r ${gradient.replace('to-', 'to-').replace('-100', '-50')} dark:${gradient.replace('to-', 'to-').replace('-100', '-950/30')} p-4 rounded-lg`}>
            <p className={`text-sm ${accentColor.replace('-600', '-700')} dark:${accentColor.replace('-600', '-300')} font-medium`}>
              "{testimonial.text}"
            </p>
            <p className="text-xs text-muted-foreground font-medium mt-2">
              - {testimonial.author}
            </p>
          </div>
        )}
        
        <Button 
          className={`w-full ${
            ctaVariant === 'default' 
              ? accentColor.replace('text-', 'bg-').replace('-600', '-600') + ' hover:' + accentColor.replace('text-', 'bg-').replace('-600', '-700')
              : ''
          }`}
          variant={ctaVariant}
          onClick={onCtaClick}
        >
          {ctaText}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PricingTier;
