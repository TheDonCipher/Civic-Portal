import React from "react";
import IssueCard from "./IssueCard";
import FilterBar from "./FilterBar";

interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "open" | "in-progress" | "resolved";
  votes: number;
  comments: Array<{
    id: number;
    author: {
      name: string;
      avatar: string;
    };
    content: string;
    date: string;
  }>;
  date: string;
  author: {
    name: string;
    avatar: string;
  };
  thumbnail: string;
  location?: string;
  updates?: Array<{
    id: number;
    author: {
      name: string;
      avatar: string;
    };
    content: string;
    date: string;
    type: "status" | "comment" | "solution";
  }>;
  solutions?: Array<{
    id: number;
    title: string;
    description: string;
    proposedBy: {
      name: string;
      avatar: string;
    };
    estimatedCost: number;
    votes: number;
    status: "proposed" | "approved" | "in-progress" | "completed";
  }>;
  watchers?: number;
  constituency?: string;
}

interface IssueGridProps {
  issues?: Issue[];
  onFilterChange?: (filters: any) => void;
  onSearch?: (searchTerm: string) => void;
  onIssueClick: (issue: Issue) => void;
}

const IssueGrid = ({
  issues = [
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
        {
          id: 4,
          author: {
            name: "David Wilson",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
          },
          content: "The situation is getting worse with the recent rains.",
          date: "2024-03-23",
        },
        {
          id: 5,
          author: {
            name: "Emily Chen",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily",
          },
          content: "We need a long-term solution, not just temporary patches.",
          date: "2024-03-23",
        },
      ],
      updates: [
        {
          id: 1,
          author: {
            name: "City Maintenance",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=city",
          },
          content:
            "Issue has been reviewed and scheduled for repair next week.",
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
            "Assessment team has been dispatched to evaluate the extent of repairs needed.",
          date: "2024-03-23",
          type: "status",
        },
        {
          id: 3,
          author: {
            name: "Community Manager",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=community",
          },
          content:
            "Traffic diversion plans are being prepared for the repair work.",
          date: "2024-03-24",
          type: "update",
        },
        {
          id: 4,
          author: {
            name: "Engineering Team",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=engineer",
          },
          content:
            "Detailed repair plan has been finalized. Work to commence in 3 days.",
          date: "2024-03-25",
          type: "status",
        },
        {
          id: 5,
          author: {
            name: "Budget Office",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=budget",
          },
          content:
            "Emergency funding of P50,000 has been approved for immediate repairs.",
          date: "2024-03-25",
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
            "Quick-fix solution using cold mix asphalt to address immediate safety concerns.",
          proposedBy: {
            name: "Road Maintenance Team",
            avatar:
              "https://api.dicebear.com/7.x/avataaars/svg?seed=maintenance",
          },
          estimatedCost: 5000,
          votes: 8,
          status: "in-progress",
        },
        {
          id: 3,
          title: "Drainage System Upgrade",
          description:
            "Address underlying water damage issues by improving road drainage.",
          proposedBy: {
            name: "Infrastructure Specialist",
            avatar:
              "https://api.dicebear.com/7.x/avataaars/svg?seed=specialist",
          },
          estimatedCost: 35000,
          votes: 12,
          status: "proposed",
        },
        {
          id: 4,
          title: "Smart Traffic Management",
          description:
            "Install smart traffic management system to reduce congestion during repairs.",
          proposedBy: {
            name: "Smart City Team",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=smart",
          },
          estimatedCost: 15000,
          votes: 10,
          status: "proposed",
        },
        {
          id: 5,
          title: "Community Monitoring System",
          description:
            "Implement a community-based monitoring system for early detection of road issues.",
          proposedBy: {
            name: "Community Innovation Hub",
            avatar:
              "https://api.dicebear.com/7.x/avataaars/svg?seed=innovation",
          },
          estimatedCost: 8000,
          votes: 18,
          status: "proposed",
        },
      ],
      date: "2024-03-20",
      author: {
        name: "John Doe",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
      },
      thumbnail:
        "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&h=300&fit=crop",
      location: "Serowe-Palapye Road, near Mall intersection",
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
      comments: [
        {
          id: 1,
          author: {
            name: "Bob Wilson",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
          },
          content: "Looking forward to helping with the cleanup!",
          date: "2024-03-19",
        },
      ],
      updates: [
        {
          id: 1,
          author: {
            name: "Environmental Department",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=env",
          },
          content: "Clean-up event scheduled for next Saturday at 9 AM.",
          date: "2024-03-21",
          type: "status",
        },
      ],
      solutions: [
        {
          id: 1,
          title: "Community Cleanup Day",
          description:
            "Organize a community-wide cleanup event with provided equipment.",
          proposedBy: {
            name: "Community Center",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=community",
          },
          estimatedCost: 2000,
          votes: 25,
          status: "approved",
        },
      ],
      date: "2024-03-19",
      author: {
        name: "Jane Smith",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
      },
      thumbnail:
        "https://images.unsplash.com/photo-1571954471509-801c155e01ec?w=400&h=300&fit=crop",
      location: "Main Mall, Central District",
      watchers: 42,
    },
    {
      id: "3",
      title: "Street Light Malfunction",
      description:
        "Several street lights are not working on Oak Avenue, creating safety concerns.",
      category: "Safety",
      status: "resolved",
      votes: 15,
      comments: [
        {
          id: 1,
          author: {
            name: "Sarah Lee",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
          },
          content: "Glad this has been fixed!",
          date: "2024-03-18",
        },
      ],
      updates: [
        {
          id: 1,
          author: {
            name: "City Maintenance",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=city",
          },
          content: "All street lights have been repaired and tested.",
          date: "2024-03-19",
          type: "status",
        },
      ],
      solutions: [
        {
          id: 1,
          title: "Replace Old Lights",
          description: "Replace all old street lights with new LED fixtures.",
          proposedBy: {
            name: "City Engineering",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=engineer",
          },
          estimatedCost: 8000,
          votes: 12,
          status: "completed",
        },
      ],
      date: "2024-03-18",
      author: {
        name: "Mike Johnson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
      },
      thumbnail:
        "https://images.unsplash.com/photo-1542574621-e088a4464f7e?w=400&h=300&fit=crop",
      location: "Oak Avenue, Residential District",
      watchers: 35,
    },
  ],
  onFilterChange = () => {},
  onSearch = () => {},
  onIssueClick,
}: IssueGridProps) => {
  return (
    <div className="w-full flex flex-col gap-6">
      <FilterBar onFilterChange={onFilterChange} onSearch={onSearch} />
      <div className="flex-1 bg-background border-border rounded-lg p-6 shadow-sm">
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 pb-6">
            {issues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => onIssueClick(issue)}
                className="cursor-pointer transition-transform hover:scale-[1.02]"
              >
                <IssueCard
                  title={issue.title}
                  description={issue.description}
                  category={issue.category}
                  status={issue.status}
                  votes={issue.votes}
                  comments={issue.comments}
                  date={issue.date}
                  author={issue.author}
                  thumbnail={issue.thumbnail}
                  constituency={issue.constituency}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export type { Issue };
export default IssueGrid;
