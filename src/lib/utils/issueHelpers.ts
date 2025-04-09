import { supabase } from "@/lib/supabase";

/**
 * Helper functions for issue-related operations
 */

// Default images for different categories
export const getCategoryDefaultImage = (category: string) => {
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

  return defaultImages[category?.toLowerCase()] || defaultImages.infrastructure;
};

// Validate and process thumbnail URL
export const validateThumbnailUrl = (url: string, category: string) => {
  if (!url) {
    return getCategoryDefaultImage(category);
  }

  try {
    // Check if the URL is valid
    new URL(url);
    // Make sure it starts with http or https
    if (!url.startsWith("http")) {
      console.warn(`Invalid thumbnail URL format: ${url}, using default`);
      return getCategoryDefaultImage(category);
    }
    return url;
  } catch (e) {
    console.warn(`Invalid thumbnail URL: ${url}, using default`, e);
    return getCategoryDefaultImage(category);
  }
};

// Format issue data for UI
export const formatIssueForUI = (issue: any) => {
  const category = issue.category?.toLowerCase() || "infrastructure";
  const thumbnailUrl = validateThumbnailUrl(issue.thumbnail, category);

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
    author_id: issue.author_id,
    thumbnail: thumbnailUrl,
    thumbnails: issue.thumbnails || [thumbnailUrl],
    location: issue.location,
    constituency: issue.constituency,
    watchers: issue.watchers_count || 0,
  };
};

// Toggle issue vote (like/unlike)
export const toggleIssueVote = async (
  issueId: string,
  userId: string,
  isLiked: boolean,
) => {
  try {
    console.log(
      `Toggling vote for issue ${issueId} by user ${userId}, current state: ${isLiked ? "liked" : "not liked"}`,
    );

    if (isLiked) {
      // Remove the vote
      const { error: deleteError } = await supabase
        .from("issue_votes")
        .delete()
        .match({
          issue_id: issueId,
          user_id: userId,
        });

      if (deleteError) {
        console.error("Error removing vote:", deleteError);
        throw deleteError;
      }

      // Decrement the votes count in the issues table
      const { error: decrementError } = await supabase.rpc(
        "decrement_issue_votes",
        { issue_id: issueId },
      );

      if (decrementError) {
        console.error("Error decrementing votes:", decrementError);
        throw decrementError;
      }

      console.log("Vote removed successfully");
      return false; // Now unliked
    } else {
      // Add a vote
      const { error: insertError } = await supabase.from("issue_votes").insert({
        issue_id: issueId,
        user_id: userId,
        created_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error("Error adding vote:", insertError);
        throw insertError;
      }

      // Increment the votes count in the issues table
      const { error: incrementError } = await supabase.rpc(
        "increment_issue_votes",
        { issue_id: issueId },
      );

      if (incrementError) {
        console.error("Error incrementing votes:", incrementError);
        throw incrementError;
      }

      console.log("Vote added successfully");
      return true; // Now liked
    }
  } catch (error) {
    console.error("Error toggling issue vote:", error);
    throw error;
  }
};

// Toggle issue watch status
export const toggleIssueWatch = async (
  issueId: string,
  userId: string,
  isWatched: boolean,
) => {
  try {
    console.log(
      `Toggling watch for issue ${issueId} by user ${userId}, current state: ${isWatched ? "watched" : "not watched"}`,
    );

    if (isWatched) {
      // Remove the watcher
      const { error: deleteError } = await supabase
        .from("issue_watchers")
        .delete()
        .match({
          issue_id: issueId,
          user_id: userId,
        });

      if (deleteError) {
        console.error("Error removing watcher:", deleteError);
        throw deleteError;
      }

      // Decrement the watchers count in the issues table
      const { error: decrementError } = await supabase.rpc(
        "decrement_issue_watchers",
        { issue_id: issueId },
      );

      if (decrementError) {
        console.error("Error decrementing watchers:", decrementError);
        throw decrementError;
      }

      console.log("Watcher removed successfully");
      return false; // Now unwatched
    } else {
      // Add a watcher
      const { error: insertError } = await supabase
        .from("issue_watchers")
        .insert({
          issue_id: issueId,
          user_id: userId,
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Error adding watcher:", insertError);
        throw insertError;
      }

      // Increment the watchers count in the issues table
      const { error: incrementError } = await supabase.rpc(
        "increment_issue_watchers",
        { issue_id: issueId },
      );

      if (incrementError) {
        console.error("Error incrementing watchers:", incrementError);
        throw incrementError;
      }

      console.log("Watcher added successfully");
      return true; // Now watched
    }
  } catch (error) {
    console.error("Error toggling issue watch:", error);
    throw error;
  }
};

// Add a comment to an issue
export const addComment = async (
  issueId: string,
  userId: string,
  content: string,
) => {
  try {
    console.log(`Adding comment to issue ${issueId} by user ${userId}`);
    console.log("Comment content:", content);

    // Prepare the comment data
    const commentData = {
      issue_id: issueId,
      author_id: userId,
      content,
      created_at: new Date().toISOString(),
    };

    console.log("Inserting comment with data:", commentData);

    const { data, error } = await supabase
      .from("comments")
      .insert(commentData)
      .select()
      .single();

    if (error) {
      console.error("Error adding comment:", error);
      throw error;
    }

    console.log("Comment added successfully:", data);

    // Verify the comment was added by fetching it back
    const { data: verifyData, error: verifyError } = await supabase
      .from("comments")
      .select("*")
      .eq("id", data.id)
      .single();

    if (verifyError) {
      console.warn("Could not verify comment was added:", verifyError);
    } else {
      console.log("Comment verified in database:", verifyData);
    }

    return data;
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

// Add an update to an issue
export const addUpdate = async (
  issueId: string,
  userId: string,
  content: string,
  type = "status",
) => {
  try {
    console.log(`Adding update to issue ${issueId} by user ${userId}`);
    console.log("Update content:", content);
    console.log("Update type:", type);

    // Prepare the update data
    const updateData = {
      issue_id: issueId,
      author_id: userId,
      content,
      type,
      created_at: new Date().toISOString(),
    };

    console.log("Inserting update with data:", updateData);

    const { data, error } = await supabase
      .from("updates")
      .insert(updateData)
      .select()
      .single();

    if (error) {
      console.error("Error adding update:", error);
      throw error;
    }

    console.log("Update added successfully:", data);

    // Verify the update was added by fetching it back
    const { data: verifyData, error: verifyError } = await supabase
      .from("updates")
      .select("*")
      .eq("id", data.id)
      .single();

    if (verifyError) {
      console.warn("Could not verify update was added:", verifyError);
    } else {
      console.log("Update verified in database:", verifyData);
    }

    return data;
  } catch (error) {
    console.error("Error adding update:", error);
    throw error;
  }
};

// Add a solution to an issue
export const addSolution = async (
  issueId: string,
  userId: string,
  title: string,
  description: string,
  estimatedCost: number,
) => {
  try {
    console.log(`Adding solution to issue ${issueId} by user ${userId}`);
    console.log("Solution title:", title);
    console.log("Solution description:", description);
    console.log("Estimated cost:", estimatedCost);

    const { data, error } = await supabase
      .from("solutions")
      .insert({
        issue_id: issueId,
        proposed_by: userId,
        title,
        description,
        estimated_cost: estimatedCost,
        status: "proposed",
        votes: 0,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding solution:", error);
      throw error;
    }

    console.log("Solution added successfully:", data);
    return data;
  } catch (error) {
    console.error("Error adding solution:", error);
    throw error;
  }
};

// Toggle solution vote
export const toggleSolutionVote = async (
  solutionId: string,
  userId: string,
) => {
  try {
    console.log(
      `Checking solution vote for solution ${solutionId} by user ${userId}`,
    );

    // Check if the user has already voted for this solution
    const { data: existingVote, error: checkError } = await supabase
      .from("solution_votes")
      .select("*")
      .eq("solution_id", solutionId)
      .eq("user_id", userId)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking for existing vote:", checkError);
      throw checkError;
    }

    if (existingVote) {
      console.log("User has already voted, removing vote");
      // Remove the vote
      const { error: deleteError } = await supabase
        .from("solution_votes")
        .delete()
        .match({
          solution_id: solutionId,
          user_id: userId,
        });

      if (deleteError) {
        console.error("Error removing solution vote:", deleteError);
        throw deleteError;
      }

      // Decrement the votes count in the solutions table
      const { error: decrementError } = await supabase.rpc(
        "decrement_solution_votes",
        {
          solution_id: solutionId,
        },
      );

      if (decrementError) {
        console.error("Error decrementing solution votes:", decrementError);
        throw decrementError;
      }

      console.log("Solution vote removed successfully");
      return false; // Vote removed
    } else {
      console.log("User has not voted yet, adding vote");
      // Add the vote
      const { error: insertError } = await supabase
        .from("solution_votes")
        .insert({
          solution_id: solutionId,
          user_id: userId,
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Error adding solution vote:", insertError);
        throw insertError;
      }

      // Increment the votes count in the solutions table
      const { error: incrementError } = await supabase.rpc(
        "increment_solution_votes",
        {
          solution_id: solutionId,
        },
      );

      if (incrementError) {
        console.error("Error incrementing solution votes:", incrementError);
        throw incrementError;
      }

      console.log("Solution vote added successfully");
      return true; // Vote added
    }
  } catch (error) {
    console.error("Error toggling solution vote:", error);
    throw error;
  }
};

// Update solution status
export const updateSolutionStatus = async (
  solutionId: string,
  userId: string,
  status: string,
  updateText: string,
  issueId: string,
) => {
  try {
    console.log(`Updating solution ${solutionId} status to ${status}`);
    console.log("Update text:", updateText);

    // Update the solution status
    const { error: updateError } = await supabase
      .from("solutions")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", solutionId);

    if (updateError) {
      console.error("Error updating solution status:", updateError);
      throw updateError;
    }

    // Add an update record
    const { data: updateData, error: logError } = await supabase
      .from("updates")
      .insert({
        issue_id: issueId,
        author_id: userId,
        content: `Solution status updated to ${status}: ${updateText}`,
        created_at: new Date().toISOString(),
        type: "solution",
      })
      .select()
      .single();

    if (logError) {
      console.error("Error adding solution update record:", logError);
      throw logError;
    }

    console.log("Solution status updated successfully");
    return updateData;
  } catch (error) {
    console.error("Error updating solution status:", error);
    throw error;
  }
};
