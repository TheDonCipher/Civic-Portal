import React from "react";
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
import { Progress } from "../ui/progress";
import { Slider } from "../ui/slider";

const formSchema = z.object({
  progress: z.number().min(0).max(100),
  update: z.string().min(1, "Update description is required"),
});

interface UpdateSolutionProgressDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (data: z.infer<typeof formSchema>) => void;
  currentProgress?: number;
  solutionId: number;
}

const UpdateSolutionProgressDialog = ({
  open = false,
  onOpenChange = () => {},
  onSubmit = () => {},
  currentProgress = 0,
  solutionId,
}: UpdateSolutionProgressDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      progress: currentProgress,
      update: "",
    },
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    onSubmit({ ...data, solutionId });
    onOpenChange(false);
    form.reset();
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
              name="progress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Progress ({field.value}%)</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Progress value={field.value} className="h-2" />
                      <Slider
                        min={0}
                        max={100}
                        step={5}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="py-4"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="update"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Progress Update</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the progress made..."
                      className="min-h-[100px]"
                      {...field}
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
              >
                Cancel
              </Button>
              <Button type="submit">Update Progress</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateSolutionProgressDialog;
