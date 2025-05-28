import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import {
  MmogoEcosystemShowcase,
  MockupNavigation,
} from '@/components/subscription';
import MockupModeIndicator from '@/components/demo/MockupModeIndicator';

/**
 * Mmogo Impact Ecosystem Mockups Demo Page
 *
 * This page showcases the UI mockups for integrating the "Mmogo Impact Ecosystem"
 * business model into the civic portal. It demonstrates:
 *
 * 1. Thusang Community Action Funds - Project contribution interface
 * 2. Kgotla+ Ward Councilor Dashboard - Government management tools
 * 3. Tirisano Mmogo Business Partnership - Business sponsor displays and insights
 * 4. Tlhaloso Data Reports - Anonymized civic data presentation
 *
 * All mockups use the existing design system and maintain mobile responsiveness
 * while incorporating appropriate Setswana terminology.
 */

const MmogoMockupsPage: React.FC = () => {
  return (
    <MainLayout>
      <MockupModeIndicator />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto py-6 space-y-6">
          <MockupNavigation currentPage="ecosystem" showMockups={true} />
          <MmogoEcosystemShowcase />
        </div>
      </div>
    </MainLayout>
  );
};

export default MmogoMockupsPage;
