import React from 'react';
import MainLayout from '../layout/MainLayout';
import PageTitle from '../common/PageTitle';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search } from 'lucide-react';
import SEOHead from '../common/SEOHead';

const faqs = [
  // Reporting Issues
  {
    question: 'How do I report a new issue?',
    answer:
      "To report a new issue, click on the 'Report Issue' button in the top navigation bar or from your dashboard. Fill out the form with details about the issue, including its location, category, and a description. You can also upload images to help illustrate the problem. Make sure to provide accurate information to help officials address the issue effectively.",
    category: 'reporting',
  },
  {
    question: 'Can I report an issue anonymously?',
    answer:
      'No, you need to be signed in to report issues. This helps ensure accountability and allows officials to contact you if they need more information. However, your personal information is protected and only shared with relevant government officials who need to address the issue.',
    category: 'reporting',
  },
  {
    question: 'What types of issues can I report?',
    answer:
      'You can report various civic issues including infrastructure problems (roads, water, electricity), public safety concerns, environmental issues, health and sanitation problems, education-related issues, and other matters that affect your community. Choose the appropriate category when submitting your report.',
    category: 'reporting',
  },
  {
    question: 'How do I add photos to my issue report?',
    answer:
      "When creating an issue report, you can upload photos by clicking the 'Add Photos' button in the form. You can upload multiple images to help illustrate the problem. Supported formats include JPG, PNG, and WebP. Make sure images are clear and relevant to the issue.",
    category: 'reporting',
  },
  {
    question: 'Can I edit my issue report after submitting it?',
    answer:
      'Once submitted, you cannot directly edit the core details of your issue report. However, you can add comments with additional information or clarifications. If you need to make significant changes, contact our support team or the relevant government department handling your issue.',
    category: 'reporting',
  },
  // Tracking Issues
  {
    question: 'How do I track the progress of my reported issues?',
    answer:
      "You can track all issues you've reported by visiting your dashboard or profile page. There, you'll see a list of your issues with their current status. You can also click on any issue to view detailed updates, comments, and official responses from government departments. You'll receive notifications when there are status changes.",
    category: 'tracking',
  },
  {
    question: 'What do the different issue statuses mean?',
    answer:
      "Issues progress through several statuses: 'Open' means the issue has been reported and is awaiting review by the relevant department, 'In Progress' means officials are actively working on resolving it, 'Resolved' means the issue has been addressed and fixed, and 'Closed' means the issue is complete or no longer relevant.",
    category: 'tracking',
  },
  {
    question: 'How will I know when my issue is updated?',
    answer:
      'You receive notifications when there are updates to your issues, including status changes, official responses, and new comments. Notifications appear in your dashboard and you can also opt to receive email notifications in your profile settings.',
    category: 'tracking',
  },
  {
    question: 'Can I follow issues reported by others?',
    answer:
      "Yes! You can 'watch' any public issue by clicking the watch button on the issue details page. This allows you to receive updates about issues in your area or topics you're interested in, even if you didn't report them yourself.",
    category: 'tracking',
  },

  // Citizen Engagement
  {
    question: 'How can I support an issue reported by someone else?',
    answer:
      'You can support issues by voting on them and adding comments with additional information. This helps officials prioritize issues that affect many citizens. To vote, click the thumbs-up icon on any issue card or detail page.',
    category: 'engagement',
  },
  {
    question: 'Can I suggest solutions to reported issues?',
    answer:
      "Yes! On any issue's detail page, you'll find a 'Suggest Solution' button. This allows you to propose specific solutions, including estimated costs and implementation details. Officials and other citizens can then vote on these suggestions.",
    category: 'engagement',
  },
  {
    question: 'How does the voting system work?',
    answer:
      'Citizens can vote on issues to show support and help prioritize them. You can also vote on proposed solutions to help officials identify the most popular approaches. Your votes are anonymous and help create a democratic process for addressing community issues.',
    category: 'engagement',
  },
  {
    question: 'Can I comment on issues and solutions?',
    answer:
      'Yes! You can add comments to any issue to provide additional information, ask questions, or share your experiences. Comments help create a dialogue between citizens and officials, leading to better understanding and solutions.',
    category: 'engagement',
  },
  // Government Officials
  {
    question: 'Who reviews and addresses the reported issues?',
    answer:
      'Reported issues are reviewed by verified government officials from relevant departments across Botswana. Each department has designated stakeholders who assess issues, provide updates, and coordinate solutions. The specific department depends on the category and location of the issue.',
    category: 'officials',
  },
  {
    question: 'How can government officials join the platform?',
    answer:
      'Government officials can register by selecting "Government Official" during signup and choosing their department. All official accounts require verification by platform administrators to ensure authenticity. This process typically takes 1-2 business days.',
    category: 'officials',
  },
  {
    question: 'What tools do officials have to manage issues?',
    answer:
      'Officials have access to a specialized dashboard where they can view department-specific issues, update statuses, add official responses, select approved solutions, and track performance metrics. They can also filter issues by priority, location, and status.',
    category: 'officials',
  },
  {
    question: 'How long does it typically take for issues to be resolved?',
    answer:
      'Resolution times vary depending on the complexity of the issue, available resources, and priority. Simple issues like streetlight repairs might be resolved within days, while complex infrastructure projects could take weeks or months. Officials provide regular updates on progress.',
    category: 'officials',
  },
  {
    question: 'How are issues prioritized by government departments?',
    answer:
      'Issues are prioritized based on several factors including public safety impact, number of citizens affected (votes and comments), available resources, and departmental priorities. Emergency issues receive immediate attention.',
    category: 'officials',
  },

  // Technical Support
  {
    question: 'Is there a mobile app available?',
    answer:
      'Currently, we offer a mobile-responsive website that works perfectly on smartphones and tablets. The platform is optimized for mobile use with touch-friendly interfaces. A dedicated mobile app is planned for future development.',
    category: 'technical',
  },
  {
    question: 'What browsers are supported?',
    answer:
      'The Civic Portal works on all modern browsers including Chrome, Firefox, Safari, and Edge. For the best experience, we recommend using the latest version of your preferred browser. Internet Explorer is not supported.',
    category: 'technical',
  },
  {
    question: 'What should I do if I encounter a technical problem?',
    answer:
      'If you experience technical issues, please contact our support team via WhatsApp at +267 72977535 or email support@civicportal.gov.bw. Include details about the problem, what you were trying to do, any error messages, and your device/browser information.',
    category: 'technical',
  },
  {
    question: 'How do I reset my password?',
    answer:
      'Click "Forgot Password" on the sign-in page and enter your email address. You\'ll receive a password reset link via email. If you don\'t receive the email within a few minutes, check your spam folder or contact support.',
    category: 'technical',
  },
  {
    question: 'Is my personal information secure?',
    answer:
      'Yes, we take data security seriously. The platform uses encryption, secure authentication, and follows Botswana data protection laws. Your personal information is only shared with relevant government officials when necessary to address your reported issues.',
    category: 'technical',
  },
  {
    question: 'Can I use the platform without creating an account?',
    answer:
      'You can browse public issues and explore the platform in demo mode without an account. However, to report issues, comment, vote, or track your submissions, you need to create a free account.',
    category: 'technical',
  },
];

const FAQPage = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filteredFaqs, setFilteredFaqs] = React.useState(faqs);
  const [activeCategory, setActiveCategory] = React.useState('all');

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'reporting', label: 'Reporting Issues' },
    { id: 'tracking', label: 'Tracking Issues' },
    { id: 'engagement', label: 'Citizen Engagement' },
    { id: 'officials', label: 'Government Officials' },
    { id: 'technical', label: 'Technical Support' },
  ];

  React.useEffect(() => {
    let filtered = faqs;

    // Apply category filter
    if (activeCategory !== 'all') {
      filtered = filtered.filter((faq) => faq.category === activeCategory);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (faq) =>
          faq.question.toLowerCase().includes(term) ||
          faq.answer.toLowerCase().includes(term)
      );
    }

    setFilteredFaqs(filtered);
  }, [searchTerm, activeCategory]);

  return (
    <MainLayout>
      <SEOHead
        title="Frequently Asked Questions"
        description="Find answers to common questions about using the Civic Portal platform."
      />

      <PageTitle
        title="Frequently Asked Questions"
        description="Find answers to common questions about using our platform"
        breadcrumbs={[{ label: 'FAQ' }]}
      />

      <div className="w-full max-w-[900px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search for questions..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(category.id)}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {filteredFaqs.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {filteredFaqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No questions found matching your search. Please try different
              keywords or select a different category.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchTerm('');
                setActiveCategory('all');
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}

        <div className="bg-muted/30 p-6 rounded-lg mt-8">
          <h3 className="text-lg font-semibold mb-2">Still have questions?</h3>
          <p className="mb-4">
            If you couldn't find the answer you were looking for, please contact
            our support team.
          </p>
          <Button variant="default" asChild>
            <a
              href="https://wa.me/26772977535"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787" />
              </svg>
              Contact Support via WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default FAQPage;
