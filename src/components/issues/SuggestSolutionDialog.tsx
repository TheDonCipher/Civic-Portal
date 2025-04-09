import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  estimatedCost: z
    .string()
    .min(1, "Estimated cost is required")
    .regex(/^\d+$/, "Please enter a valid amount"),
});

interface SuggestSolutionDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (data: any) => void;
  issueId?: string;
}

const SuggestSolutionDialog = ({
  open = false,
  onOpenChange = () => {},
  onSubmit = () => {},
  issueId, // Remove default value to ensure proper validation
}: SuggestSolutionDialogProps) => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      estimatedCost: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (!user || !profile) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to suggest a solution",
          variant: "destructive",
        });
        onOpenChange(false);
        return;
      }

      // Validate issueId is present and valid
      if (!issueId || issueId.trim() === "") {
        console.error("Issue ID is missing or invalid:", issueId);
        toast({
          title: "Error",
          description: "Issue ID is missing. Please try again.",
          variant: "destructive",
        });
        onOpenChange(false);
        return;
      }

      // Log the issue ID for debugging
      console.log("Confirmed valid issueId:", issueId);

      console.log("Submitting solution for issue:", issueId);
      console.log("Solution data:", data);

      // Sanitize input to prevent XSS
      const sanitizedTitle = data.title
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;");

      const sanitizedDescription = data.description
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;");

      // Insert the solution into the database
      console.log("Inserting solution into database:", {
        issue_id: issueId,
        title: sanitizedTitle,
        description: sanitizedDescription,
        estimated_cost: parseInt(data.estimatedCost),
        proposed_by: user.id,
      });

      const { data: solutionData, error } = await supabase
        .from("solutions")
        .insert({
          issue_id: issueId,
          title: sanitizedTitle,
          description: sanitizedDescription,
          estimated_cost: parseInt(data.estimatedCost),
          proposed_by: user.id,
          status: "proposed",
          votes: 0,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error inserting solution:", error);
        throw error;
      }

      console.log("Solution inserted successfully:", solutionData);

      // Also add an update to notify about the new solution
      const updateContent = `New solution proposed: ${sanitizedTitle}`;

      const { data: updateData, error: updateError } = await supabase
        .from("updates")
        .insert({
          issue_id: issueId,
          author_id: user.id,
          content: updateContent,
          type: "solution",
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (updateError) {
        console.warn("Error adding solution update:", updateError);
        // Continue even if the update fails
      } else {
        console.log("Solution update added successfully:", updateData);
      }

      console.log("Solution submission result:", solutionData || error);

      if (error) throw error;

      // Format the solution for the UI
      const formattedSolution = {
        id: solutionData.id,
        title: sanitizedTitle,
        description: sanitizedDescription,
        estimatedCost: solutionData.estimated_cost,
        proposedBy: {
          name: profile.full_name || "User",
          avatar:
            profile.avatar_url ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
        },
        votes: 0,
        status: "proposed",
        date: solutionData.created_at,
      };

      // Call the onSubmit callback with the formatted solution
      onSubmit(formattedSolution);
      onOpenChange(false);
      form.reset();

      toast({
        title: "Solution Suggested",
        description: "Your solution has been submitted successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error submitting solution:", error);
      toast({
        title: "Error",
        description: "Failed to submit solution. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px] bg-background">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Suggest Solution
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Solution Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter a clear title for the solution"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide detailed information about the solution"
                      className="min-h-[100px]"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimatedCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Cost (BWP)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter estimated cost"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex justify-end gap-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Solution"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SuggestSolutionDialog;
