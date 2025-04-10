import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../layout/Header";
import UserProfile from "./UserProfile";
import IssueDetailDialog from "../issues/IssueDetailDialog";
import CreateIssueDialog from "../issues/CreateIssueDialog";
import type { Issue } from "../issues/IssueGrid";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast-enhanced";
import { handleApiError, showSuccess } from "@/lib/utils/errorHandler";
import { sanitizeInput } from "@/lib/utils/validationUtils";
import { z } from "zod";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  location: z.string().min(1, "Location is required"),
  constituency: z.string().min(1, "Constituency is required"),
  image: z.instanceof(File).optional(),
});

const ProfilePage = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [userIssues, setUserIssues] = useState<{
    created: Issue[];
    watching: Issue[];
    solved: Issue[];
  }>({
    created: [],
    watching: [],
    solved: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // For demo purposes, we'll show mock data even if not authenticated
  // Only redirect to sign in if explicitly requested
  useEffect(() => {
    // Skip authentication check for demo purposes
    // if (!authLoading && !user) {
    //   navigate("/?signin=true");
    // }
    setIsLoading(false); // Always set loading to false to ensure the demo profile shows
  }, [user, authLoading, navigate]);

  // Fetch user's issues
  useEffect(() => {
    const fetchUserIssues = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        console.log("Fetching issues for user:", user.id);

        // Fetch issues created by the user
        const { data: createdIssues, error: createdError } = await supabase
          .from("issues")
          .select("*")
          .eq("author_id", user.id)
          .order("created_at", { ascending: false });

        if (createdError) throw createdError;

        console.log("Fetched created issues:", createdIssues?.length || 0);

        // Get IDs of issues created by the user for filtering
        const createdIds = new Set(
          (createdIssues || []).map((issue) => issue.id),
        );

        // Fetch issues the user is watching
        const { data: watchingData, error: watchingError } = await supabase
          .from("issue_watchers")
          .select("issue_id")
          .eq("user_id", user.id);

        if (watchingError) throw watchingError;

        console.log("Fetched watching data:", watchingData?.length || 0);

        let watchingIssues = [];
        if (watchingData && watchingData.length > 0) {
          // Filter out issues that the user created to avoid duplicates
          const uniqueWatchingIds = watchingData
            .map((w) => w.issue_id)
            .filter((id) => !createdIds.has(id)); // Only include issues the user didn't create

          if (uniqueWatchingIds.length > 0) {
            const { data: issues, error } = await supabase
              .from("issues")
              .select("*")
              .in("id", uniqueWatchingIds)
              .order("created_at", { ascending: false });

            if (error) throw error;
            watchingIssues = issues || [];
          }
        }

        // Fetch issues the user has solved (if they're an official)
        const { data: solvedIssues, error: solvedError } = await supabase
          .from("issues")
          .select("*")
          .eq("resolved_by", user.id)
          .order("resolved_at", { ascending: false });

        if (solvedError) throw solvedError;

        // Format the issues to match our Issue type
        const formatIssue = (issue) => {
          console.log("Profile - Issue thumbnail:", issue.thumbnail);
          // Select a default image based on category if thumbnail is missing
          let defaultThumbnail;
          const category = issue.category?.toLowerCase() || "infrastructure";
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
          defaultThumbnail =
            defaultImages[category] || defaultImages.infrastructure;

          // Validate thumbnail URL
          let thumbnailUrl = issue.thumbnail;
          if (thumbnailUrl) {
            try {
              // Check if the URL is valid
              new URL(thumbnailUrl);
              // Make sure it starts with http or https
              if (!thumbnailUrl.startsWith("http")) {
                console.warn(
                  `Invalid thumbnail URL format: ${thumbnailUrl}, using default`,
                );
                thumbnailUrl = defaultThumbnail;
              }
            } catch (e) {
              console.warn(
                `Invalid thumbnail URL: ${thumbnailUrl}, using default`,
                e,
              );
              thumbnailUrl = defaultThumbnail;
            }
          } else {
            thumbnailUrl = defaultThumbnail;
          }

          return {
            id: issue.id,
            title: issue.title,
            description: issue.description,
            category: issue.category,
            status: issue.status,
            votes: issue.votes || 0,
            comments: [],
            date: issue.created_at,
            author: {
              name: issue.author_name || "Unknown",
              avatar:
                issue.author_avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${issue.author_id}`,
            },
            author_id: issue.author_id, // Store the author ID for filtering
            thumbnail: thumbnailUrl,
            location: issue.location,
            constituency: issue.constituency,
            watchers: issue.watchers_count || 0,
          };
        };

        // Format all issues
        const formattedCreatedIssues = (createdIssues || []).map(formatIssue);
        const formattedWatchingIssues = watchingIssues.map(formatIssue);
        const formattedSolvedIssues = (solvedIssues || []).map(formatIssue);

        // Create a Set of created issue IDs for efficient lookup
        const createdIssueIds = new Set(
          formattedCreatedIssues.map((issue) => issue.id),
        );

        // Filter watching issues to exclude any that are also in created issues
        const uniqueWatchingIssues = formattedWatchingIssues.filter(
          (issue) => !createdIssueIds.has(issue.id),
        );

        console.log("ProfilePage - Fetched issues:", {
          created: formattedCreatedIssues.length,
          watching: uniqueWatchingIssues.length,
          solved: formattedSolvedIssues.length,
        });

        // Clear any previous mock data and set only real user issues
        setUserIssues({
          created: formattedCreatedIssues,
          watching: uniqueWatchingIssues,
          solved: formattedSolvedIssues,
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user issues:", error);
        handleApiError(error, {
          context: "Loading user issues",
          toastTitle: "Failed to Load Issues",
          toastDescription:
            "We couldn't load your issues. Please try again later.",
        });
        setIsLoading(false);
      }
    };

    if (user && profile) {
      fetchUserIssues();
    }
  }, [user, profile, toast]);

  const handleDeleteIssue = async (issueId: string) => {
    try {
      // Remove the issue from the local state
      setUserIssues((prev) => ({
        ...prev,
        created: prev.created.filter((issue) => issue.id !== issueId),
      }));
      setSelectedIssue(null);

      showSuccess(
        "Issue Deleted",
        "Your issue has been successfully deleted.",
        [{ label: "Issue", value: issueId }],
      );
    } catch (error) {
      console.error("Error handling issue deletion:", error);
    }
  };

  const handleCreateIssue = async (data: z.infer<typeof formSchema>) => {
    if (!user || !profile) {
      handleApiError(new Error("Authentication required"), {
        context: "Creating issue",
        toastTitle: "Authentication Required",
        toastDescription: "Please sign in to create an issue",
        toastVariant: "warning",
        action: () => navigate("/?signin=true"),
        actionLabel: "Sign In",
      });
      return;
    }

    try {
      let thumbnail = "";

      // If an image was uploaded, store it in Supabase storage
      if (data.image) {
        const fileExt = data.image.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `issue-images/${fileName}`;

        try {
          console.log(`Starting image upload for ${filePath}...`);
          // Upload the image
          const { error: uploadError, data: uploadData } =
            await supabase.storage.from("issues").upload(filePath, data.image, {
              cacheControl: "3600",
              upsert: false,
              onUploadProgress: (progress) => {
                const percent = Math.round(
                  (progress.loaded / progress.total) * 100,
                );
                console.log(`Upload progress: ${percent}%`);
              },
            });

          if (uploadError) {
            console.error("Upload error details:", JSON.stringify(uploadError));
            throw uploadError;
          } else {
            console.log("Upload successful, data:", uploadData);
          }

          // Get the public URL for the uploaded image
          const { data: publicUrlData } = supabase.storage
            .from("issues")
            .getPublicUrl(filePath);

          if (!publicUrlData || !publicUrlData.publicUrl) {
            console.error("Failed to get public URL for uploaded image");
            throw new Error("Failed to get public URL");
          }

          thumbnail = publicUrlData.publicUrl;
          console.log("Image uploaded successfully, URL:", thumbnail);

          // Verify the URL is valid
          const img = new Image();
          img.onload = () => console.log("Image URL is valid and loadable");
          img.onerror = (e) => {
            console.error("Image URL failed to load:", e);
            // Log additional details about the URL
            console.log("URL protocol:", new URL(thumbnail).protocol);
            console.log("URL hostname:", new URL(thumbnail).hostname);
          };
          img.src = thumbnail;
        } catch (uploadErr) {
          console.error("Exception during image upload:", uploadErr);
          console.log(
            "Upload error details:",
            JSON.stringify(uploadErr, null, 2),
          );
          // Fall back to a default image if upload fails
          const category = data.category.toLowerCase();
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
          thumbnail = defaultImages[category] || defaultImages.infrastructure;
          console.log("Using fallback image:", thumbnail);
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

      console.log("Created issue with thumbnail:", thumbnail);

      // Validate the thumbnail URL to ensure it's properly formatted
      if (thumbnail && !thumbnail.startsWith("http")) {
        console.error("Invalid thumbnail URL format:", thumbnail);
        // Fall back to a reliable default image
        const category = data.category.toLowerCase();
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
        thumbnail = defaultImages[category] || defaultImages.infrastructure;
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

      // Format the new issue to match our Issue type
      // Ensure thumbnail is properly set with a category-specific fallback
      const category = issueData.category?.toLowerCase() || "infrastructure";
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
      const defaultThumbnail =
        defaultImages[category] || defaultImages.infrastructure;

      // Log the thumbnail URL for debugging
      console.log("Issue created with thumbnail URL:", issueData.thumbnail);

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
        thumbnail: issueData.thumbnail || defaultThumbnail,
        location: issueData.location,
        constituency: issueData.constituency,
        watchers: 1, // Start with 1 watcher (the creator)
      };

      // Update the user issues state - only add to created, not to watching
      // Also ensure we don't add duplicate issues
      setUserIssues((prev) => {
        // Check if this issue already exists in the created list
        const issueExists = prev.created.some(
          (issue) => issue.id === newIssue.id,
        );

        if (issueExists) {
          console.log(
            "Issue already exists in created list, not adding duplicate",
          );
          return prev;
        }

        return {
          ...prev,
          created: [newIssue, ...prev.created],
          // Don't add to watching since it's already in created
          // Also remove from watching if it exists there
          watching: prev.watching.filter((issue) => issue.id !== newIssue.id),
        };
      });

      showSuccess(
        "Issue Created",
        "Your issue has been successfully created.",
        [
          { label: "Title", value: data.title },
          { label: "Category", value: data.category },
          { label: "Location", value: data.location },
        ],
      );
    } catch (error) {
      console.error("Error creating issue:", error);
      handleApiError(error, {
        context: "Creating issue",
        toastTitle: "Issue Creation Failed",
        toastDescription: "We couldn't create your issue. Please try again.",
        details: [
          { label: "Title", value: data.title },
          { label: "Category", value: data.category },
        ],
      });
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onCreateIssue={() => setIsCreateDialogOpen(true)} />
        <main className="pt-[72px] p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-[600px] w-full rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  // Show mock data for demo purposes if user is not authenticated
  if (!user || !profile) {
    // Create mock user data for demonstration
    const mockUser = {
      id: "demo-user-id",
      email: "demo.user@example.com",
      created_at: new Date().toISOString(),
    };

    const mockProfile = {
      id: "demo-user-id",
      full_name: "Demo User",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
      role: "citizen",
      constituency: "Gaborone central",
    };

    // Create a mock issue for the demo user
    const mockIssue = {
      id: "demo-1",
      title: "Road Maintenance Required",
      description:
        "Multiple potholes need attention along the Serowe-Palapye road.",
      category: "Infrastructure",
      status: "open" as "open",
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
        name: mockProfile.full_name,
        avatar: mockProfile.avatar_url,
      },
      thumbnail:
        "https://cdn.pixabay.com/photo/2018/01/10/18/49/city-3073958_1280.jpg",
      location: "Serowe-Palapye Road",
      constituency: mockProfile.constituency,
      watchers: 1,
    };

    // Create a mock issue that the demo user is watching but didn't create
    const mockWatchedIssue = {
      id: "demo-2",
      title: "Park Cleanup Initiative",
      description:
        "Community park needs volunteers for cleanup and maintenance.",
      category: "Environment",
      status: "open" as "open",
      votes: 28,
      comments: [],
      date: "2024-03-18",
      author: {
        name: "Environmental Team",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=env",
      },
      thumbnail:
        "https://cdn.pixabay.com/photo/2015/12/01/20/28/green-1072828_1280.jpg",
      location: "Central Park",
      constituency: "Gaborone south",
      watchers: 15,
    };

    const userData = {
      name: mockProfile.full_name,
      avatar: mockProfile.avatar_url,
      email: mockUser.email,
      role: "Citizen",
      joinDate: mockUser.created_at,
      issuesCreated: [mockIssue],
      issuesWatching: [mockWatchedIssue],
      issuesSolved: [],
      isRealUser: false, // Flag to indicate this is a demo user
    };

    return (
      <div className="min-h-screen bg-background">
        <Header onCreateIssue={() => setIsCreateDialogOpen(true)} />
        <div className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 p-4 text-center sticky top-[82px] z-10 text-sm sm:text-base">
          <p>
            Demo Profile: You are viewing a mock citizen profile.{" "}
            <a href="/?signin=true" className="underline">
              Sign in
            </a>{" "}
            to see your actual profile.
          </p>
        </div>
        <main className="pt-4">
          <UserProfile
            user={userData}
            onIssueClick={setSelectedIssue}
            onCreateIssue={() => setIsCreateDialogOpen(true)}
          />
        </main>

        {selectedIssue && (
          <IssueDetailDialog
            open={true}
            onOpenChange={() => setSelectedIssue(null)}
            issue={selectedIssue}
            onDelete={handleDeleteIssue}
          />
        )}

        <CreateIssueDialog
          open={isCreateDialogOpen}
          onOpenChange={(open) => {
            if (!user && open) {
              navigate("/?signin=true");
              return;
            }
            setIsCreateDialogOpen(open);
          }}
          onSubmit={handleCreateIssue}
        />
      </div>
    );
  }

  // Filter out seed issues from the user's created issues
  // Seed issues have IDs that start with numbers 1, 2, etc. or don't match the user's profile
  const filteredCreatedIssues = userIssues.created.filter((issue) => {
    // Check multiple conditions to determine if this is a user-created issue
    // 1. Check if the ID is not a simple number (seed issues often have numeric IDs)
    const isNotNumericId = isNaN(Number(issue.id));

    // 2. Check if the author name matches the current user's name
    const isAuthorMatch = issue.author.name === profile.full_name;

    // 3. Check if the author ID matches the current user's ID (if available)
    const isAuthorIdMatch = issue.author_id === user.id;

    // An issue is considered user-created if it has a non-numeric ID OR the author matches the current user
    const isUserCreated = isNotNumericId || isAuthorMatch || isAuthorIdMatch;

    if (!isUserCreated) {
      console.log("Filtering out seed issue:", {
        id: issue.id,
        title: issue.title,
        author: issue.author.name,
        currentUser: profile.full_name,
        isNumeric: !isNotNumericId,
        authorMatch: isAuthorMatch,
      });
    }

    return isUserCreated;
  });

  console.log(
    "Filtered created issues:",
    filteredCreatedIssues.length,
    "from",
    userIssues.created.length,
  );

  const userData = {
    name: profile.full_name || "User",
    avatar:
      profile.avatar_url ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
    email: user.email || "",
    role: profile.role === "official" ? "Official" : "Citizen",
    joinDate: user.created_at || new Date().toISOString(),
    issuesCreated: filteredCreatedIssues,
    issuesWatching: userIssues.watching,
    issuesSolved: userIssues.solved,
    isRealUser: true, // Flag to indicate this is a real user, not a demo
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onCreateIssue={() => setIsCreateDialogOpen(true)} />
      <main className="pt-4">
        <UserProfile
          user={userData}
          onIssueClick={setSelectedIssue}
          onCreateIssue={() => setIsCreateDialogOpen(true)}
        />
      </main>

      {selectedIssue && (
        <IssueDetailDialog
          open={true}
          onOpenChange={() => setSelectedIssue(null)}
          issue={selectedIssue}
          onDelete={handleDeleteIssue}
        />
      )}

      <CreateIssueDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateIssue}
      />
    </div>
  );
};

export default ProfilePage;
