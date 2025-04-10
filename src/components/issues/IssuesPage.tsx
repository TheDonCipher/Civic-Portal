import React, { useState, useEffect } from "react";
import Header from "../layout/Header";
import IssueGrid from "./IssueGrid";
import IssueDetailDialog from "./IssueDetailDialog";
import CreateIssueDialog from "./CreateIssueDialog";
import type { Issue } from "./IssueGrid";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast-enhanced";
import { useAuth } from "@/lib/auth";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  location: z.string().min(1, "Location is required"),
  constituency: z.string().min(1, "Constituency is required"),
});

export const IssuesPage = () => {
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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, profile } = useAuth() || { user: null, profile: null };

  // Prevent duplicate issues by ensuring we only fetch once
  const [hasFetched, setHasFetched] = useState(false);

  // Fetch issues from the database when the component mounts
  useEffect(() => {
    if (hasFetched) return;

    const fetchIssues = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("issues")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          // Format the issues to match our Issue type
          const formattedIssues = data.map((issue) => {
            console.log("Issue thumbnail:", issue.thumbnail);

            // Validate and process the thumbnail URL
            let thumbnailUrl = issue.thumbnail;
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
            const defaultThumbnail =
              defaultImages[category] || defaultImages.infrastructure;

            // Validate the thumbnail URL
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
              thumbnail: thumbnailUrl,
              location: issue.location,
              constituency: issue.constituency,
              watchers: issue.watchers_count || 0,
            };
          });

          setIssues(formattedIssues);
        }
      } catch (error) {
        console.error("Error fetching issues:", error);
        toast({
          title: "Error",
          description: "Failed to load issues. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setHasFetched(true);
      }
    };

    fetchIssues();
  }, [hasFetched]);

  const handleCreateIssue = async (data: z.infer<typeof formSchema>) => {
    // Check if user is already authenticated
    if (!user || !profile) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create an issue",
        variant: "destructive",
      });
      return;
    }

    // Handle issue creation
    if (user && profile) {
      try {
        let thumbnail = "";

        // If an image was uploaded, store it in Supabase storage
        if (
          "image" in data &&
          data.image &&
          typeof data.image === "object" &&
          "name" in data.image &&
          data.image instanceof File
        ) {
          const fileExt = data.image.name.split(".").pop();
          const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          const filePath = `issue-images/${fileName}`;

          try {
            console.log(`Starting image upload for ${filePath}...`);
            // Upload the image
            const { error: uploadError, data: uploadData } =
              await supabase.storage
                .from("issues")
                .upload(filePath, data.image as File, {
                  cacheControl: "3600",
                  upsert: false,
                });

            if (uploadError) {
              console.error(
                "Upload error details:",
                JSON.stringify(uploadError),
              );
              throw uploadError;
            } else {
              console.log("Upload successful, data:", uploadData);
            }

            if (uploadError) {
              console.error("Error uploading image:", uploadError);
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
              thumbnail =
                defaultImages[category] || defaultImages.infrastructure;
              console.log(
                "Using fallback image due to upload error:",
                thumbnail,
              );
            } else {
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
            }
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
            console.log("Using fallback image due to exception:", thumbnail);
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
    if (!term) {
      // If search term is empty, reset to all issues
      const fetchIssues = async () => {
        try {
          const { data, error } = await supabase
            .from("issues")
            .select("*")
            .order("created_at", { ascending: false });

          if (error) throw error;

          if (data && data.length > 0) {
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
                  return (
                    defaultImages[category] || defaultImages.infrastructure
                  );
                })(),
              location: issue.location,
              constituency: issue.constituency,
              watchers: issue.watchers_count || 0,
            }));

            setIssues(formattedIssues);
          }
        } catch (error) {
          console.error("Error fetching issues:", error);
        }
      };

      fetchIssues();
      return;
    }

    // Search in title and description
    const searchIssues = async () => {
      try {
        const { data, error } = await supabase
          .from("issues")
          .select("*")
          .or(`title.ilike.%${term}%,description.ilike.%${term}%`)
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (data) {
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
        console.error("Error searching issues:", error);
      }
    };

    searchIssues();
  };

  const handleFilterChange = (filters: any) => {
    // Handle filter changes
    const filterIssues = async () => {
      try {
        let query = supabase.from("issues").select("*");

        // Apply category filter
        if (filters.category && filters.category !== "all") {
          query = query.eq("category", filters.category);
        }

        // Apply status filter
        if (filters.status && filters.status !== "all") {
          query = query.eq("status", filters.status);
        }

        // Apply sorting
        if (filters.sortBy) {
          switch (filters.sortBy) {
            case "newest":
              query = query.order("created_at", { ascending: false });
              break;
            case "oldest":
              query = query.order("created_at", { ascending: true });
              break;
            case "most-votes":
              query = query.order("votes", { ascending: false });
              break;
            case "least-votes":
              query = query.order("votes", { ascending: true });
              break;
            default:
              query = query.order("created_at", { ascending: false });
          }
        } else {
          query = query.order("created_at", { ascending: false });
        }

        const { data, error } = await query;

        if (error) throw error;

        if (data) {
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
        console.error("Error filtering issues:", error);
      }
    };

    filterIssues();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onCreateIssue={() => setIsCreateDialogOpen(true)}
        onSearch={handleSearch}
      />

      <main className="pt-[82px] px-6 pb-6">
        <div className="max-w-[1800px] mx-auto">
          <IssueGrid
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            issues={issues}
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
          onDelete={handleDeleteIssue}
        />
      )}
    </div>
  );
};
