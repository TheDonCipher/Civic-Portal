import React, { useState } from "react";
import Header from "./layout/Header";
import LatestUpdates from "./issues/LatestUpdates";
import StatCards from "./dashboard/StatCards";
import IssueGrid from "./issues/IssueGrid";
import IssueDetailDialog from "./issues/IssueDetailDialog";
import type { Issue } from "./issues/IssueGrid";
import CreateIssueDialog from "./issues/CreateIssueDialog";
import { z } from "zod";

interface HomeProps {
  initialIssues?: Issue[];
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  location: z.string().min(1, "Location is required"),
});

const mockIssues = [
  {
    id: "1",
    title: "Road Maintenance Required",
    description:
      "Multiple potholes need attention along the Serowe-Palapye road.",
    category: "Infrastructure",
    status: "open",
    votes: 42,
    comments: [
      {
        id: 1,
        author: {
          name: "Jane Smith",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
        },
        content:
          "This needs immediate attention. I've seen multiple cars damaged.",
        date: "2024-03-21",
      },
      {
        id: 2,
        author: {
          name: "Michael Brown",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
        },
        content: "I agree, this is becoming a serious safety hazard.",
        date: "2024-03-21",
      },
      {
        id: 3,
        author: {
          name: "Sarah Lee",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
        },
        content: "My car was damaged last week due to these potholes.",
        date: "2024-03-22",
      },
    ],
    updates: [
      {
        id: 1,
        author: {
          name: "City Maintenance",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=city",
        },
        content: "Issue has been reviewed and scheduled for repair next week.",
        date: "2024-03-22",
        type: "status",
      },
      {
        id: 2,
        author: {
          name: "Road Department",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=road",
        },
        content:
          "Assessment team has been dispatched to evaluate repairs needed.",
        date: "2024-03-23",
        type: "status",
      },
      {
        id: 3,
        author: {
          name: "Engineering Team",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=engineer",
        },
        content:
          "Detailed repair plan has been finalized. Work starts in 3 days.",
        date: "2024-03-24",
        type: "update",
      },
    ],
    solutions: [
      {
        id: 1,
        title: "Complete Road Resurfacing",
        description:
          "Full resurfacing of the affected area with high-quality asphalt.",
        proposedBy: {
          name: "City Engineering",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=engineer",
        },
        estimatedCost: 25000,
        votes: 15,
        status: "proposed",
      },
      {
        id: 2,
        title: "Temporary Patch Repair",
        description:
          "Quick-fix solution using cold mix asphalt for immediate safety.",
        proposedBy: {
          name: "Road Maintenance Team",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maintenance",
        },
        estimatedCost: 5000,
        votes: 8,
        status: "in-progress",
      },
      {
        id: 3,
        title: "Drainage System Upgrade",
        description:
          "Address underlying water damage by improving road drainage.",
        proposedBy: {
          name: "Infrastructure Specialist",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=specialist",
        },
        estimatedCost: 35000,
        votes: 12,
        status: "proposed",
      },
    ],
    description:
      "Multiple potholes need attention along the Serowe-Palapye road.",
    category: "Infrastructure",
    status: "open",
    votes: 42,
    comments: [
      {
        id: 1,
        author: {
          name: "Jane Smith",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
        },
        content:
          "This needs immediate attention. I've seen multiple cars damaged.",
        date: "2024-03-21",
      },
    ],
    date: "2024-03-20",
    author: {
      name: "John Doe",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
    },
    thumbnail:
      "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&h=300&fit=crop",
    location: "Serowe-Palapye Road",
    constituency: "Serowe north",
    watchers: 68,
  },
  {
    id: "2",
    title: "Cleanup Initiative",
    description:
      "Organizing community cleanup at Main Mall. Need volunteers and equipment.",
    category: "Environment",
    status: "in-progress",
    votes: 28,
    comments: [],
    date: "2024-03-19",
    author: {
      name: "Jane Smith",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
    },
    thumbnail:
      "https://images.unsplash.com/photo-1571954471509-801c155e01ec?w=400&h=300&fit=crop",
    location: "Main Mall",
    constituency: "Gaborone central",
    watchers: 42,
  },
];

const mockStats = {
  totalIssues: 120,
  resolutionRate: 78,
  avgResponseTime: "4.5 days",
  engagementStats: {
    votesPerIssue: 15,
    commentsPerIssue: 8,
    trendingIssues: [
      {
        title: "Road Maintenance",
        category: "Infrastructure",
        engagement: 85,
        constituency: "Serowe north",
      },
      {
        title: "Park Cleanup",
        category: "Environment",
        engagement: 72,
        constituency: "Gaborone central",
      },
      {
        title: "Street Lighting",
        category: "Safety",
        engagement: 64,
        constituency: "Francistown east",
      },
    ],
  },
  fundingStats: {
    totalRaised: 125000,
    targetAmount: 250000,
    recentDonations: [
      {
        amount: 5000,
        project: "Community Center Renovation",
        date: "2024-03-22",
        provider: {
          name: "City Engineering",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=engineer",
        },
      },
      {
        amount: 2500,
        project: "Park Equipment",
        date: "2024-03-21",
        provider: {
          name: "Parks Department",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=parks",
        },
      },
      {
        amount: 1000,
        project: "Street Lighting",
        date: "2024-03-21",
        provider: {
          name: "Infrastructure Team",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=infra",
        },
      },
    ],
  },

  constituencyRankings: [
    { name: "Gaborone central", issues: 45, resolved: 38 },
    { name: "Serowe north", issues: 32, resolved: 25 },
    { name: "Francistown east", issues: 28, resolved: 20 },
    { name: "Maun west", issues: 25, resolved: 18 },
    { name: "Lobatse", issues: 22, resolved: 15 },
  ],
};

const Home = ({ initialIssues = mockIssues }: HomeProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [issues, setIssues] = useState(initialIssues);

  const handleDeleteIssue = (issueId: string) => {
    setIssues(issues.filter((issue) => issue.id !== issueId));
    setSelectedIssue(null);
  };

  const handleCreateIssue = (data: z.infer<typeof formSchema>) => {
    // Handle issue creation
    console.log("Creating issue:", data);
    setIsCreateDialogOpen(false);
  };

  const handleSearch = (term: string) => {
    // Handle search
    console.log("Searching for:", term);
  };

  const handleFilterChange = (filters: any) => {
    // Handle filter changes
    console.log("Filters changed:", filters);
  };

  // Filter issues to show only open and in-progress ones
  const activeIssues = issues.filter(
    (issue) => issue.status === "open" || issue.status === "in-progress",
  );

  return (
    <div className="min-h-screen bg-background">
      <Header
        onCreateIssue={() => setIsCreateDialogOpen(true)}
        onSearch={handleSearch}
      />

      <main className="pt-[72px] px-6 pb-6">
        <div className="max-w-[1800px] mx-auto space-y-8">
          <StatCards stats={mockStats} />
          <div className="flex gap-8">
            <div className="flex-1">
              <IssueGrid
                issues={activeIssues}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
                onIssueClick={(issue) => setSelectedIssue(issue)}
              />
            </div>
            <div className="w-[420px] hidden xl:block sticky top-[88px]">
              <LatestUpdates
                onIssueClick={(issueId) => {
                  const issue = issues.find((i) => i.id === issueId);
                  if (issue) {
                    setSelectedIssue(issue);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </main>

      <CreateIssueDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateIssue}
      />

      {selectedIssue && selectedIssue.title && (
        <IssueDetailDialog
          open={true}
          onOpenChange={() => setSelectedIssue(null)}
          issue={selectedIssue}
          onDelete={handleDeleteIssue}
        />
      )}
    </div>
  );
};

export default Home;
