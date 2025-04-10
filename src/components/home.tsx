import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import AuthDialog from "./auth/AuthDialog";
import Header from "./layout/Header";
import LatestUpdates from "./issues/LatestUpdates";
import StatCards from "./dashboard/StatCards";
import IssueGrid from "./issues/IssueGrid";
import IssueDetailDialog from "./issues/IssueDetailDialog";
import type { Issue } from "./issues/IssueGrid";
import CreateIssueDialog from "./issues/CreateIssueDialog";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast-enhanced";

interface HomeProps {
  initialIssues?: Issue[];
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  location: z.string().min(1, "Location is required"),
  constituency: z.string().min(1, "Constituency is required"),
});

const mockIssues: Issue[] = [
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
    comments: [
      {
        id: 1,
        author: {
          name: "Environmental Team",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=env",
        },
        content: "We'll provide cleaning equipment and safety gear.",
        date: "2024-03-19",
      },
      {
        id: 2,
        author: {
          name: "Community Leader",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=leader",
        },
        content: "Great initiative! We'll help coordinate volunteers.",
        date: "2024-03-20",
      },
    ],
    updates: [
      {
        id: 1,
        author: {
          name: "Environmental Team",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=env",
        },
        content:
          "Equipment and supplies have been arranged. Cleanup scheduled for next Saturday.",
        date: "2024-03-21",
        type: "status",
      },
    ],
    solutions: [
      {
        id: 1,
        title: "Community Cleanup Day",
        description:
          "Organize a full day cleanup event with local volunteers and municipal support.",
        proposedBy: {
          name: "Environmental Team",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=env",
        },
        estimatedCost: 15000,
        votes: 25,
        status: "in-progress",
      },
    ],
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

const Home = ({ initialIssues = mockIssues }: HomeProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  // Check URL params for signin=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("signin") === "true" && !user) {
      setIsAuthDialogOpen(true);
      // Clean up the URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [user]);

  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [issues, setIssues] = useState(initialIssues);

  // Prevent duplicate issues by ensuring we only fetch once
  const [hasFetched, setHasFetched] = useState(false);

  // Fetch issues from the database when the component mounts
  useEffect(() => {
    if (hasFetched) return;

    const fetchIssues = async () => {
      try {
        const { supabase } = await import("@/lib/supabase");
        const { data, error } = await supabase
          .from("issues")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          // Format the issues to match our Issue type
          const formattedIssues = data.map((issue) => ({
            id: issue.id,
            title: issue.title,
            description: issue.description,
            category: issue.category,
            status: issue.status as "open" | "in-progress" | "resolved",
            votes: issue.votes || 0,
            comments: [],
            date: issue.created_at,
            author: {
              name: issue.author_name || "Unknown",
              avatar:
                issue.author_avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${issue.author_id}`,
            },
            thumbnail:
              issue.thumbnail ||
              (() => {
                // Select a default image based on category if thumbnail is missing
                const category =
                  issue.category?.toLowerCase() || "infrastructure";
                const defaultImages = {
                  infrastructure:
                    "https://cdn.pixabay.com/photo/2018/01/10/18/49/city-3073958_1280.jpg",
                  environment:
                    "https://cdn.pixabay.com/photo/2015/12/01/20/28/green-1072828_1280.jpg",
                  safety:
                    "https://cdn.pixabay.com/photo/2019/04/13/00/47/police-4123365_1280.jpg",
                  community:
                    "https://cdn.pixabay.com/photo/2017/02/10/12/03/volunteer-2055010_1280.jpg",
                };
                return defaultImages[category] || defaultImages.infrastructure;
              })(),
            location: issue.location,
            constituency: issue.constituency,
            watchers: issue.watchers_count || 0,
          }));

          setIssues(formattedIssues);
        }
      } catch (error) {
        console.error("Error fetching issues:", error);
      } finally {
        setHasFetched(true);
      }
    };

    fetchIssues();
  }, [hasFetched]);

  const handleDeleteIssue = async (issueId: string) => {
    try {
      // Remove the issue from the local state
      setIssues(issues.filter((issue) => issue.id !== issueId));
      setSelectedIssue(null);

      toast({
        title: "Issue Deleted",
        description: "The issue has been successfully deleted.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error handling issue deletion:", error);
    }
  };

  const handleCreateIssue = async (data: z.infer<typeof formSchema>) => {
    // Handle issue creation
    console.log("Creating issue:", data);

    // If connected to Supabase, create the issue in the database
    if (user && profile) {
      try {
        let thumbnail = "";

        // If an image was uploaded, store it in Supabase storage
        if ("image" in data && data.image) {
          const fileExt = data.image.name.split(".").pop();
          const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          const filePath = `issue-images/${fileName}`;

          // Upload the image
          const { supabase } = await import("@/lib/supabase");
          const { error: uploadError, data: uploadData } =
            await supabase.storage.from("issues").upload(filePath, data.image, {
              cacheControl: "3600",
              upsert: false,
            });

          if (uploadError) {
            console.error("Error uploading image:", uploadError);
            // Fall back to a default image if upload fails
            const category = data.category.toLowerCase();
            const thumbnailCategories = {
              infrastructure: "road,construction,building",
              environment: "nature,park,environment",
              safety: "safety,security,police",
              community: "community,people,gathering",
            };
            const searchTerm = thumbnailCategories[category] || "city";
            thumbnail = `https://source.unsplash.com/random/800x600/?${searchTerm}`;
          } else {
            // Get the public URL for the uploaded image
            const { data: publicUrlData } = supabase.storage
              .from("issues")
              .getPublicUrl(filePath);

            thumbnail = publicUrlData.publicUrl;
            console.log("Image uploaded successfully, URL:", thumbnail);

            // Verify the URL is valid
            const img = new Image();
            img.onload = () => console.log("Image URL is valid and loadable");
            img.onerror = () => console.error("Image URL failed to load");
            img.src = thumbnail;
          }
        } else {
          // Use reliable default images from Pixabay based on category
          const defaultImages = {
            infrastructure:
              "https://cdn.pixabay.com/photo/2018/01/10/18/49/city-3073958_1280.jpg",
            environment:
              "https://cdn.pixabay.com/photo/2015/12/01/20/28/green-1072828_1280.jpg",
            safety:
              "https://cdn.pixabay.com/photo/2019/04/13/00/47/police-4123365_1280.jpg",
            community:
              "https://cdn.pixabay.com/photo/2017/02/10/12/03/volunteer-2055010_1280.jpg",
          };

          const category = data.category.toLowerCase();
          thumbnail =
            defaultImages[category] ||
            "https://cdn.pixabay.com/photo/2018/01/10/18/49/city-3073958_1280.jpg";
        }

        // Check if a similar issue already exists to prevent duplicates
        const { supabase } = await import("@/lib/supabase");
        const { data: existingIssues, error: checkError } = await supabase
          .from("issues")
          .select("id")
          .eq("author_id", user.id)
          .eq("title", data.title)
          .limit(1);

        if (checkError) {
          console.error("Error checking for existing issues:", checkError);
        }

        if (existingIssues && existingIssues.length > 0) {
          toast({
            title: "Duplicate Issue",
            description:
              "You've already created an issue with this title. Please use a different title.",
            variant: "destructive",
            duration: 5000,
          });
          return;
        }

        // Create the issue in the database
        const { data: issueData, error } = await supabase
          .from("issues")
          .insert({
            title: data.title,
            description: data.description,
            category: data.category,
            location: data.location,
            constituency: data.constituency,
            author_id: user.id,
            author_name: profile.full_name,
            author_avatar: profile.avatar_url,
            status: "open",
            thumbnail: thumbnail,
            created_at: new Date().toISOString(),
            watchers_count: 1, // Start with 1 watcher (the creator)
          })
          .select()
          .single();

        if (error) throw error;

        // Automatically add the user as a watcher of their own issue
        // First check if the user is already watching this issue to prevent duplicates
        const { data: existingWatcher } = await supabase
          .from("issue_watchers")
          .select("*")
          .eq("issue_id", issueData.id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (!existingWatcher) {
          await supabase.from("issue_watchers").insert({
            issue_id: issueData.id,
            user_id: user.id,
          });
        } else {
          console.log("User already watching this issue, skipping insert");
        }

        // Add the new issue to the local state
        const newIssue = {
          id: issueData.id,
          title: issueData.title,
          description: issueData.description,
          category: issueData.category,
          status: issueData.status as "open",
          votes: 0,
          comments: [],
          date: issueData.created_at,
          author: {
            name: profile.full_name || "User",
            avatar:
              profile.avatar_url ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
          },
          thumbnail: issueData.thumbnail,
          location: issueData.location,
          constituency: issueData.constituency,
          watchers: 1, // Start with 1 watcher (the creator)
        };

        setIssues([newIssue, ...issues]);

        toast({
          title: "Issue Created",
          description: "Your issue has been successfully created.",
          variant: "default",
          duration: 3000,
        });
      } catch (error) {
        console.error("Error creating issue:", error);
        toast({
          title: "Error",
          description: "Failed to create issue. Please try again.",
          variant: "destructive",
          duration: 3000,
        });
      }
    }

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

      <main className="pt-[82px] px-6 pb-6">
        <div className="max-w-[1800px] mx-auto space-y-8 px-4 sm:px-6">
          <StatCards />
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 w-full">
              <IssueGrid
                issues={activeIssues}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
                onIssueClick={(issue) => setSelectedIssue(issue)}
              />
            </div>
            <div className="w-full lg:w-[420px] hidden lg:block sticky top-[88px]">
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
        onOpenChange={(open) => {
          if (!user && open) {
            setIsAuthDialogOpen(true);
            return;
          }
          setIsCreateDialogOpen(open);
        }}
        onSubmit={handleCreateIssue}
      />

      <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />

      {selectedIssue && (
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
