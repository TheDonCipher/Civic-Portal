import React, { useState, useEffect } from "react";
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
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  status: z.enum(["proposed", "approved", "in-progress", "completed"]),
  update: z.string().min(1, "Update description is required"),
});

interface UpdateSolutionProgressDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (data: any) => void;
  solutionId?: number | string;
}

const UpdateSolutionProgressDialog = ({
  open = false,
  onOpenChange = () => {},
  onSubmit = () => {},
  solutionId,
}: UpdateSolutionProgressDialogProps) => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [solution, setSolution] = useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "proposed",
      update: "",
    },
  });

  // Fetch the solution details when the dialog opens
  useEffect(() => {
    const fetchSolution = async () => {
      if (!solutionId || !open) return;

      try {
        const { data, error } = await supabase
          .from("solutions")
          .select("*")
          .eq("id", solutionId)
          .single();

        if (error) throw error;

        setSolution(data);
        form.setValue("status", data.status);
      } catch (error) {
        console.error("Error fetching solution:", error);
        toast({
          title: "Error",
          description: "Failed to load solution details.",
          variant: "destructive",
        });
      }
    };

    fetchSolution();
  }, [solutionId, open, form, toast]);

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (!user || !profile) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to update solution progress",
          variant: "destructive",
        });
        onOpenChange(false);
        return;
      }

      if (!solutionId) {
        toast({
          title: "Error",
          description: "Solution ID is missing. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Check if the user is authorized (officials or solution proposer)
      if (profile.role !== "official" && solution?.proposed_by !== user.id) {
        toast({
          title: "Permission Denied",
          description: "You don't have permission to update this solution.",
          variant: "destructive",
        });
        return;
      }

      // Update the solution status
      const { error: updateError } = await supabase
        .from("solutions")
        .update({
          status: data.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", solutionId);

      if (updateError) throw updateError;

      // Add an update record
      const { error: logError } = await supabase.from("updates").insert({
        issue_id: solution.issue_id,
        author_id: user.id,
        content: `Solution status updated to ${data.status}: ${data.update}`,
        created_at: new Date().toISOString(),
        type: "solution",
      });

      if (logError) throw logError;

      // Call the onSubmit callback with the updated data
      onSubmit({
        solutionId,
        status: data.status,
        update: data.update,
      });

      onOpenChange(false);
      form.reset();

      toast({
        title: "Solution Updated",
        description: "The solution progress has been updated successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating solution:", error);
      toast({
        title: "Error",
        description: "Failed to update solution. Please try again.",
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
            Update Solution Progress
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="proposed">Proposed</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="update"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Update Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide details about this status update"
                      className="min-h-[100px]"
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
                    Updating...
                  </>
                ) : (
                  "Update Solution"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateSolutionProgressDialog;
