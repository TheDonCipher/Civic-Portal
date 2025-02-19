import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ThumbsUp, MessageCircle, Calendar, Eye, LandPlot } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../ui/use-toast";
import { cn } from "@/lib/utils";

interface IssueCardProps {
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
}

const IssueCard = ({
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
  thumbnail = "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&h=300&fit=crop",
  constituency = "Gaborone central",
  isLiked = false,
  isWatched = false,
}: IssueCardProps) => {
  const { toast } = useToast();
  const [liked, setLiked] = useState(isLiked);
  const [watched, setWatched] = useState(isWatched);
  const [localVotes, setLocalVotes] = useState(votes);

  const statusColors = {
    open: "bg-yellow-100 text-yellow-800",
    "in-progress": "bg-blue-100 text-blue-800",
    resolved: "bg-green-100 text-green-800",
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    toast({
      title: liked ? "Removed like" : "Added like",
      description: liked
        ? "You have removed your like from this issue"
        : "You have liked this issue",
    });
    setLocalVotes((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleWatch = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWatched(!watched);
    toast({
      title: watched ? "Unwatched issue" : "Watching issue",
      description: watched
        ? "You will no longer receive updates about this issue"
        : "You will receive updates about this issue",
    });
  };

  return (
    <Card className="w-full h-[380px] bg-background hover:shadow-lg transition-all duration-200 flex flex-col relative group">
      <CardHeader className="p-4 space-y-2 flex-none">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Badge variant="secondary" className={statusColors[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
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
          <span className="text-sm text-gray-600">{author.name}</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4 flex-1 overflow-hidden">
        <motion.div
          className="h-32 w-full bg-cover bg-center rounded-md"
          style={{ backgroundImage: `url(${thumbnail})` }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        />
        <div className="space-y-2">
          <h3 className="font-semibold text-lg truncate">{title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2 overflow-hidden">
            {description}
          </p>
        </div>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center border-t flex-wrap gap-2">
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
            <span>{comments.length}</span>
          </Button>
        </div>
        <div className="flex items-center space-x-4">
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="sm"
              className={cn("space-x-1", watched && "text-primary")}
              onClick={handleWatch}
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
            </Button>
          </motion.div>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            {date}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default IssueCard;
