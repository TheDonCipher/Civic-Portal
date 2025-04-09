import React from "react";
import MainLayout from "../layout/MainLayout";
import PageTitle from "../common/PageTitle";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search } from "lucide-react";
import SEOHead from "../common/SEOHead";

const faqs = [
  {
    question: "How do I report a new issue?",
    answer:
      "To report a new issue, click on the 'Report Issue' button in the top navigation bar. Fill out the form with details about the issue, including its location, category, and a description. You can also upload images to help illustrate the problem.",
    category: "reporting",
  },
  {
    question: "Can I report an issue anonymously?",
    answer:
      "No, you need to be signed in to report issues. This helps ensure accountability and allows officials to contact you if they need more information. However, your personal information is protected and only shared with relevant officials.",
    category: "reporting",
  },
  {
    question: "How do I track the progress of my reported issues?",
    answer:
      "You can track all issues you've reported by visiting your profile page. There, you'll see a list of your issues with their current status. You can also click on any issue to view detailed updates and comments.",
    category: "tracking",
  },
  {
    question: "What do the different issue statuses mean?",
    answer:
      "Issues can have one of three statuses: 'Open' (newly reported and awaiting review), 'In Progress' (being addressed by officials), and 'Resolved' (the issue has been fixed or addressed).",
    category: "tracking",
  },
  {
    question: "How can I support an issue reported by someone else?",
    answer:
      "You can support issues by voting on them and adding comments with additional information. This helps officials prioritize issues that affect many citizens. To vote, click the thumbs-up icon on any issue card or detail page.",
    category: "engagement",
  },
  {
    question: "Can I suggest solutions to reported issues?",
    answer:
      "Yes! On any issue's detail page, you'll find a 'Suggest Solution' button. This allows you to propose specific solutions, including estimated costs and implementation details. Officials and other citizens can then vote on these suggestions.",
    category: "engagement",
  },
  {
    question: "Who reviews and addresses the reported issues?",
    answer:
      "Reported issues are reviewed by government officials from relevant departments. They assess each issue, provide updates, and work on implementing solutions. The specific department depends on the category and location of the issue.",
    category: "officials",
  },
  {
    question: "How long does it typically take for an issue to be resolved?",
    answer:
      "Resolution times vary depending on the complexity of the issue, available resources, and priority. Simple issues might be resolved within days, while more complex ones could take weeks or months. You can always check the status and updates on the issue detail page.",
    category: "officials",
  },
  {
    question: "Is there a mobile app available?",
    answer:
      "Currently, we offer a mobile-responsive website that works well on smartphones and tablets. A dedicated mobile app is in development and will be released in the near future.",
    category: "technical",
  },
  {
    question:
      "What should I do if I encounter a technical problem with the platform?",
    answer:
      "If you experience any technical issues, please contact our support team at support@civicportal.gov.bw. Include details about the problem, such as what you were trying to do, any error messages you received, and what device/browser you were using.",
    category: "technical",
  },
];

const FAQPage = () => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filteredFaqs, setFilteredFaqs] = React.useState(faqs);
  const [activeCategory, setActiveCategory] = React.useState("all");

  const categories = [
    { id: "all", label: "All Questions" },
    { id: "reporting", label: "Reporting Issues" },
    { id: "tracking", label: "Tracking Issues" },
    { id: "engagement", label: "Citizen Engagement" },
    { id: "officials", label: "Government Officials" },
    { id: "technical", label: "Technical Support" },
  ];

  React.useEffect(() => {
    let filtered = faqs;

    // Apply category filter
    if (activeCategory !== "all") {
      filtered = filtered.filter((faq) => faq.category === activeCategory);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (faq) =>
          faq.question.toLowerCase().includes(term) ||
          faq.answer.toLowerCase().includes(term),
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
        breadcrumbs={[{ label: "FAQ" }]}
      />

      <div className="max-w-[900px] mx-auto px-6 py-12 space-y-8">
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
                variant={activeCategory === category.id ? "default" : "outline"}
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
                setSearchTerm("");
                setActiveCategory("all");
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
          <Button variant="default">Contact Support</Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default FAQPage;
