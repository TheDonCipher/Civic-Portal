import React, { useState } from "react";
import Header from "../layout/Header";
import UserProfile from "./UserProfile";
import IssueDetailDialog from "../issues/IssueDetailDialog";
import type { Issue } from "../issues/IssueGrid";

const mockUser = {
  name: "John Doe",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
  email: "john.doe@example.com",
  role: "Citizen",
  joinDate: "2024-01-01",
  issuesCreated: [
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
  ],
  issuesWatching: [],
  issuesSolved: [],
};

const ProfilePage = () => {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-[72px]">
        <UserProfile user={mockUser} onIssueClick={setSelectedIssue} />
      </main>

      {selectedIssue && (
        <IssueDetailDialog
          open={true}
          onOpenChange={() => setSelectedIssue(null)}
          issue={selectedIssue}
        />
      )}
    </div>
  );
};

export default ProfilePage;
