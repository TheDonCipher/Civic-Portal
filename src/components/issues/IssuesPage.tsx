import React, { useState } from "react";
import Header from "../layout/Header";
import IssueGrid from "./IssueGrid";
import IssueDetailDialog from "./IssueDetailDialog";
import CreateIssueDialog from "./CreateIssueDialog";
import type { Issue } from "./IssueGrid";
import { z } from "zod";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  location: z.string().min(1, "Location is required"),
  constituency: z.string().min(1, "Constituency is required"),
});

const mockIssues = [
  {
    id: "1",
    title: "Road Maintenance Required",
    description:
      "Multiple potholes need attention along the Serowe-Palapye road.",
    category: "Infrastructure",
    status: "open" as "open",
    votes: 42,
    comments: [],
    date: "2024-03-20",
    author: {
      name: "John Doe",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
    },
    thumbnail:
      "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&h=300&fit=crop",
    location: "Serowe-Palapye Road",
    watchers: 68,
  },
  {
    id: "2",
    title: "Cleanup Initiative",
    description:
      "Organizing community cleanup at Main Mall. Need volunteers and equipment.",
    category: "Environment",
    status: "in-progress" as "in-progress",
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
    watchers: 42,
  },
  {
    id: "3",
    title: "Street Light Malfunction",
    description:
      "Several street lights are not working on Oak Avenue, creating safety concerns.",
    category: "Safety",
    status: "resolved" as "resolved",
    votes: 15,
    comments: [],
    date: "2024-03-18",
    author: {
      name: "Mike Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
    },
    thumbnail:
      "https://images.unsplash.com/photo-1542574621-e088a4464f7e?w=400&h=300&fit=crop",
    location: "Oak Avenue",
    watchers: 35,
  },
];

export const IssuesPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

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

  return (
    <div className="min-h-screen bg-background">
      <Header
        onCreateIssue={() => setIsCreateDialogOpen(true)}
        onSearch={handleSearch}
      />

      <main className="pt-[72px] px-6 pb-6">
        <div className="max-w-[1800px] mx-auto">
          <IssueGrid
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            issues={mockIssues}
            onIssueClick={(issue) => setSelectedIssue(issue)}
          />
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
        />
      )}
    </div>
  );
};
