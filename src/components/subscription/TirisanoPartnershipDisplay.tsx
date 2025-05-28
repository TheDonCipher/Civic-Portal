import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Building2,
  Star,
  MapPin,
  Phone,
  Globe,
  Heart,
  TrendingUp,
  Users,
  Award,
  ExternalLink,
  Mail,
  Calendar,
} from 'lucide-react';

interface TirisanoPartner {
  id: string;
  name: string;
  logo?: string;
  tier: 'supporter' | 'champion' | 'impact_partner';
  description: string;
  location: string;
  website?: string;
  phone?: string;
  email?: string;
  joinedDate: string;
  sponsoredProjects: number;
  communityImpact: string;
  currentOffers?: string[];
  featuredPlacement: boolean;
}

interface TirisanoPartnershipDisplayProps {
  partner: TirisanoPartner;
  variant?: 'card' | 'list' | 'featured';
  showContactInfo?: boolean;
  showMetrics?: boolean;
  className?: string;
}

const TirisanoPartnershipDisplay: React.FC<TirisanoPartnershipDisplayProps> = ({
  partner,
  variant = 'card',
  showContactInfo = false,
  showMetrics = true,
  className = '',
}) => {
  const getTierConfig = (tier: string) => {
    switch (tier) {
      case 'supporter':
        return {
          name: 'Community Supporter',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: Heart,
          description: 'BWP 200/month • Basic community support',
        };
      case 'champion':
        return {
          name: 'Community Champion',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Star,
          description: 'BWP 500/month • Enhanced visibility & engagement',
        };
      case 'impact_partner':
        return {
          name: 'Corporate Impact Partner',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Award,
          description: 'BWP 1500+/month • Strategic CSR partnership',
        };
      default:
        return {
          name: 'Partner',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Building2,
          description: 'Community partner',
        };
    }
  };

  const tierConfig = getTierConfig(partner.tier);
  const TierIcon = tierConfig.icon;

  // Featured variant for prominent display
  if (variant === 'featured') {
    return (
      <Card className={`border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 ${className}`}>
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
              <AvatarImage src={partner.logo} alt={partner.name} />
              <AvatarFallback className="text-lg font-bold">
                {partner.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-xl">{partner.name}</CardTitle>
            <Badge className={`${tierConfig.color} gap-1`}>
              <TierIcon className="w-3 h-3" />
              {tierConfig.name}
            </Badge>
            {partner.featuredPlacement && (
              <Badge variant="outline" className="gap-1 border-yellow-300 text-yellow-700">
                <Star className="w-3 h-3" />
                Featured Partner
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">{partner.description}</p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{partner.location}</span>
          </div>

          {showMetrics && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{partner.sponsoredProjects}</div>
                <div className="text-xs text-muted-foreground">Projects Sponsored</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-green-600">{partner.communityImpact}</div>
                <div className="text-xs text-muted-foreground">Community Impact</div>
              </div>
            </div>
          )}

          {partner.currentOffers && partner.currentOffers.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Current Community Offers</h4>
              <div className="space-y-1">
                {partner.currentOffers.slice(0, 2).map((offer, index) => (
                  <div key={index} className="text-xs p-2 bg-white rounded border">
                    {offer}
                  </div>
                ))}
              </div>
            </div>
          )}

          {showContactInfo && (
            <div className="flex justify-center gap-2 pt-4 border-t">
              {partner.website && (
                <Button size="sm" variant="outline" className="gap-1">
                  <Globe className="w-3 h-3" />
                  Website
                </Button>
              )}
              {partner.phone && (
                <Button size="sm" variant="outline" className="gap-1">
                  <Phone className="w-3 h-3" />
                  Call
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // List variant for compact display
  if (variant === 'list') {
    return (
      <div className={`flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 ${className}`}>
        <Avatar className="h-12 w-12">
          <AvatarImage src={partner.logo} alt={partner.name} />
          <AvatarFallback>
            {partner.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{partner.name}</h3>
            <Badge className={`${tierConfig.color} text-xs`}>
              <TierIcon className="w-3 h-3 mr-1" />
              {tierConfig.name}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-1">{partner.description}</p>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {partner.location}
            </span>
            {showMetrics && (
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {partner.sponsoredProjects} projects
              </span>
            )}
          </div>
        </div>

        {showContactInfo && (
          <div className="flex gap-1">
            {partner.website && (
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
            {partner.phone && (
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Phone className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Default card variant
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={partner.logo} alt={partner.name} />
            <AvatarFallback>
              {partner.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-1">
            <CardTitle className="text-lg">{partner.name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={`${tierConfig.color} text-xs`}>
                <TierIcon className="w-3 h-3 mr-1" />
                {tierConfig.name}
              </Badge>
              {partner.featuredPlacement && (
                <Badge variant="outline" className="text-xs">
                  Featured
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{partner.description}</p>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{partner.location}</span>
        </div>

        {showMetrics && (
          <div className="grid grid-cols-2 gap-4 py-3 border-t border-b">
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">{partner.sponsoredProjects}</div>
              <div className="text-xs text-muted-foreground">Projects Sponsored</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-green-600">{partner.communityImpact}</div>
              <div className="text-xs text-muted-foreground">Community Impact</div>
            </div>
          </div>
        )}

        {partner.currentOffers && partner.currentOffers.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              Current Offers
            </h4>
            <div className="space-y-1">
              {partner.currentOffers.map((offer, index) => (
                <div key={index} className="text-xs p-2 bg-yellow-50 dark:bg-yellow-950/30 rounded border border-yellow-200 dark:border-yellow-800">
                  {offer}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Partner since {new Date(partner.joinedDate).getFullYear()}
          </span>
          
          {showContactInfo && (
            <div className="flex gap-1">
              {partner.website && (
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <Globe className="w-3 h-3" />
                </Button>
              )}
              {partner.email && (
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <Mail className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TirisanoPartnershipDisplay;
