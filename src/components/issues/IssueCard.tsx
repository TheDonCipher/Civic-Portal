import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ThumbsUp, MessageCircle, Calendar, Eye, LandPlot } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../ui/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { getCategoryDefaultImage } from "@/lib/utils/imageUpload";

interface IssueCardProps {
  id?: string;
  title?: string;
  description?: string;
  category?: string;
  status?: "open" | "in-progress" | "resolved";
  votes?: number;
  comments?: Array<{
    id: number;
    author: {
      name: string;
      avatar: string;
    };
    content: string;
    date: string;
  }>;
  date?: string;
  author?: {
    name: string;
    avatar: string;
  };
  thumbnail?: string;
  constituency?: string;
  isLiked?: boolean;
  isWatched?: boolean;
  watchers?: number;
}

const IssueCard = ({
  id = "1",
  title = "Road Maintenance Required",
  description = "Multiple potholes need attention along Serowe-Palapye road",
  category = "Infrastructure",
  status = "open",
  votes = 42,
  comments = [],
  date = "2024-03-20",
  author = {
    name: "John Doe",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
  },
  thumbnail = "https://cdn.pixabay.com/photo/2018/01/10/18/49/city-3073958_1280.jpg",
  constituency = "Gaborone central",
  isLiked = false,
  isWatched = false,
  watchers = 0,
}: IssueCardProps) => {
  const { toast } = useToast();
  const [liked, setLiked] = useState(isLiked);
  const [watched, setWatched] = useState(isWatched);
  const [localVotes, setLocalVotes] = useState(votes);
  const [localWatchers, setLocalWatchers] = useState(watchers);
  const [commentsCount, setCommentsCount] = useState(comments.length);
  const { user } = useAuth ? useAuth() : { user: null };

  // Format the date to a more readable format
  const formattedDate = (() => {
    try {
      if (!date) return "";
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return date; // If invalid date, return as is

      // Format as Month Day, Year
      return dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return date;
    }
  })();

  // Check if user has liked or is watching this issue
  useEffect(() => {
    const checkUserInteractions = async () => {
      if (!user) return;

      try {
        // Check if user has liked this issue
        const { data: likeData } = await supabase
          .from("issue_votes")
          .select("*")
          .eq("issue_id", id)
          .eq("user_id", user.id)
          .single();

        setLiked(!!likeData);

        // Check if user is watching this issue
        const { data: watchData } = await supabase
          .from("issue_watchers")
          .select("*")
          .eq("issue_id", id)
          .eq("user_id", user.id)
          .single();

        setWatched(!!watchData);

        // Get comments count
        const { count } = await supabase
          .from("issue_comments")
          .select("*", { count: "exact" })
          .eq("issue_id", id);

        if (count !== null) {
          setCommentsCount(count);
        }
      } catch (error) {
        console.error("Error checking user interactions:", error);
      }
    };

    checkUserInteractions();
  }, [id, user]);

  const statusColors = {
    open: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
    "in-progress":
      "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
    resolved:
      "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // If user is not authenticated, show a toast asking them to sign in
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to support this issue",
        action: (
          <a href="/?signin=true">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </a>
        ),
        variant: "default",
        duration: 5000,
      });
      return;
    }

    const newLiked = !liked;
    setLiked(newLiked);

    // Update the database
    try {
      if (newLiked) {
        // Add a vote
        await supabase.from("issue_votes").insert({
          issue_id: id,
          user_id: user.id,
        });

        // Increment the votes count in the issues table
        await supabase.rpc("increment_issue_votes", { issue_id: id });
      } else {
        // Remove the vote
        await supabase.from("issue_votes").delete().match({
          issue_id: id,
          user_id: user.id,
        });

        // Decrement the votes count in the issues table
        await supabase.rpc("decrement_issue_votes", { issue_id: id });
      }
    } catch (error) {
      console.error("Error updating vote:", error);
    }

    toast({
      title: newLiked ? "Added Support" : "Removed Support",
      description: (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            {newLiked
              ? "You are now supporting"
              : "You have removed your support from"}
            <span className="font-medium"> {title}</span>
            <div className="text-sm text-muted-foreground mt-1">
              {category} • {constituency}
            </div>
          </div>
        </div>
      ),
      action: (
        <div className="flex items-center gap-2">
          <ThumbsUp className="h-4 w-4" />
          <span>{localVotes} supporters</span>
        </div>
      ),
      variant: "default",
      duration: 3000,
    });
    setLocalVotes((prev) => (newLiked ? prev + 1 : prev - 1));
  };

  const handleWatch = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // If user is not authenticated, show a toast asking them to sign in
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to watch this issue",
        action: (
          <a href="/?signin=true">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </a>
        ),
        variant: "default",
        duration: 5000,
      });
      return;
    }

    const newWatched = !watched;
    setWatched(newWatched);

    // Update the database
    try {
      if (newWatched) {
        // Add a watcher
        await supabase.from("issue_watchers").insert({
          issue_id: id,
          user_id: user.id,
        });

        // Increment the watchers count in the issues table
        await supabase.rpc("increment_issue_watchers", { issue_id: id });
        setLocalWatchers((prev) => prev + 1);
      } else {
        // Remove the watcher
        await supabase.from("issue_watchers").delete().match({
          issue_id: id,
          user_id: user.id,
        });

        // Decrement the watchers count in the issues table
        await supabase.rpc("decrement_issue_watchers", { issue_id: id });
        setLocalWatchers((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error updating watcher:", error);
    }

    toast({
      title: newWatched ? "Now Watching" : "Stopped Watching",
      description: (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            {newWatched
              ? "You will receive notifications about"
              : "You will no longer receive notifications about"}
            <span className="font-medium"> {title}</span>
            <div className="text-sm text-muted-foreground mt-1">
              {category} • {constituency}
            </div>
          </div>
        </div>
      ),
      action: (
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <span>{newWatched ? "Watching" : "Not watching"}</span>
        </div>
      ),
      variant: "default",
      duration: 3000,
    });
  };

  return (
    <Card className="w-full h-auto min-h-[420px] sm:h-[380px] bg-background hover:shadow-lg transition-all duration-200 flex flex-col relative group">
      <CardHeader className="p-4 space-y-2 flex-none">
        <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between flex-wrap gap-2">
          <Badge variant="secondary" className={statusColors[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
          </Badge>
          <div className="flex gap-2">
            <Badge variant="outline">{category}</Badge>
            {constituency && (
              <Badge variant="secondary" className="bg-primary/10">
                <LandPlot className="h-3 w-3 mr-1" />
                {constituency}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {author.name}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4 flex-1 overflow-hidden">
        <motion.div
          className="h-32 w-full bg-cover bg-center rounded-md overflow-hidden"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
            loading="eager"
            onError={(e) => {
              console.log("Image failed to load:", thumbnail);
              // Fallback to a default image if the thumbnail fails to load
              const categoryLower = category?.toLowerCase() || "infrastructure";
              const fallbackImage = getCategoryDefaultImage(categoryLower);
              e.currentTarget.src = fallbackImage;
              // Log the fallback image used for debugging
              console.log(
                "Using fallback image for category:",
                categoryLower,
                fallbackImage,
              );
            }}
            style={{
              objectFit: "cover",
              width: "100%",
              height: "100%",
              minHeight: "100%",
              display: "block",
            }}
          />
        </motion.div>
        <div className="space-y-2">
          <h3 className="font-semibold text-lg md:truncate line-clamp-2 md:line-clamp-1">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 overflow-hidden">
            {description || "No description available"}
          </p>
        </div>
      </CardContent>
      <CardFooter className="p-4 flex flex-col xs:flex-row justify-between items-start xs:items-center border-t flex-wrap gap-2">
        <div className="flex space-x-4">
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="sm"
              className={cn("space-x-1", liked && "text-primary")}
              onClick={handleLike}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={liked ? "liked" : "unliked"}
                  initial={{ scale: 0.8, opacity: 0, rotate: -180 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    rotate: 0,
                    color: liked ? "#2563eb" : "currentColor",
                  }}
                  exit={{ scale: 0.8, opacity: 0, rotate: 180 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                >
                  <ThumbsUp className="h-4 w-4" />
                </motion.div>
              </AnimatePresence>
              <span>{localVotes}</span>
            </Button>
          </motion.div>
          <Button variant="ghost" size="sm" className="space-x-1">
            <MessageCircle className="h-4 w-4" />
            <span>{commentsCount}</span>
          </Button>
        </div>
        <div className="flex items-center space-x-4">
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="sm"
              className={cn("space-x-1", watched && "text-primary")}
              onClick={handleWatch}
              title={`${localWatchers} people watching`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={watched ? "watched" : "unwatched"}
                  initial={{ scale: 0.8, opacity: 0, y: 10 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{ scale: 0.8, opacity: 0, y: -10 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                >
                  <div className="relative">
                    <Eye
                      className={cn(
                        "h-4 w-4 transition-all duration-200",
                        watched
                          ? "text-primary stroke-[2.5px]"
                          : "text-muted-foreground",
                      )}
                    />
                    {watched && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
              <span className="ml-1">{localWatchers}</span>
            </Button>
          </motion.div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="h-4 w-4 mr-1" />
            {formattedDate}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default IssueCard;
