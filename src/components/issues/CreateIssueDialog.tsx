import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { constituencies } from '@/lib/constituencies';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import {
  useIssueCreationRateLimit,
  formatTimeRemaining,
} from '@/hooks/useRateLimit';
import { sanitizeText, sanitizeFormData } from '@/lib/utils';
import {
  getAllCategories,
  getCategoriesByDepartment,
} from '@/lib/api/categoriesApi';
import {
  Image,
  Loader2,
  Upload,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react';
import {
  uploadImageToStorage,
  resizeImageBeforeUpload,
  getCategoryDefaultImage,
} from '@/lib/utils/imageUpload';

interface Department {
  id: string;
  name: string;
  description?: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  department_id?: string;
  icon?: string;
  color?: string;
}

const formSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters')
    .refine((val) => !/[<>"'&]/.test(val), {
      message: 'Title contains invalid characters',
    }),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be less than 2000 characters')
    .refine((val) => !/[<>"'&]/.test(val), {
      message: 'Description contains invalid characters',
    }),
  department_id: z.string().min(1, 'Department is required'),
  category: z.string().min(1, 'Category is required'),
  location: z
    .string()
    .min(1, 'Location is required')
    .max(200, 'Location must be less than 200 characters')
    .refine((val) => !/[<>"'&]/.test(val), {
      message: 'Location contains invalid characters',
    }),
  constituency: z.string().min(1, 'Constituency is required'),
  images: z
    .array(
      z
        .instanceof(File)
        .refine((file) => file.size <= 5 * 1024 * 1024, {
          message: 'Each image must be less than 5MB',
        })
        .refine(
          (file) =>
            ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(
              file.type
            ),
          {
            message: 'Only JPEG, PNG, GIF and WebP images are supported',
          }
        )
    )
    .optional()
    .default([]),
});

interface CreateIssueDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (data: z.infer<typeof formSchema>) => void;
}

const CreateIssueDialog = ({
  open = false,
  onOpenChange = () => {},
  onSubmit = () => {},
}: CreateIssueDialogProps) => {
  const { user, profile } = useAuth() || { user: null, profile: null };
  const { toast } = useToast();
  const rateLimit = useIssueCreationRateLimit();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const supabaseUrl = import.meta.env['VITE_SUPABASE_URL'] || '';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      department_id: '',
      category: '',
      location: '',
      constituency: profile?.constituency || '',
      images: [],
    },
  });

  // Watch for department changes to filter categories
  const selectedDepartmentId = form.watch('department_id');

  // Fetch departments and categories when the dialog opens
  useEffect(() => {
    const fetchDepartmentsAndCategories = async () => {
      setIsLoading(true);
      try {
        // Fetch departments
        const { data: departmentsData, error: departmentsError } =
          await supabase
            .from('departments' as any)
            .select('*')
            .order('name');

        if (departmentsError) {
          console.error('Error fetching departments:', departmentsError);
          throw departmentsError;
        }
        setDepartments((departmentsData as Department[]) || []);

        // Fetch categories using the new API
        const categoriesData = await getAllCategories();
        setCategories(categoriesData as Category[]);

        // Set initial filtered categories
        setFilteredCategories(categoriesData as Category[]);
      } catch (error) {
        console.error('Error fetching departments and categories:', error);

        // Show error message
        toast({
          title: 'Error',
          description:
            'Failed to load departments and categories. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchDepartmentsAndCategories();
    }
  }, [open, toast]);

  // Filter categories when department changes
  useEffect(() => {
    const filterCategories = async () => {
      if (selectedDepartmentId) {
        try {
          // Fetch department-specific categories
          const departmentCategories = await getCategoriesByDepartment(
            selectedDepartmentId
          );
          setFilteredCategories(departmentCategories as Category[]);

          // Reset category selection if the current category doesn't belong to the selected department
          const currentCategory = form.getValues('category');
          const categoryExists = departmentCategories.some(
            (cat) => cat.name === currentCategory
          );
          if (currentCategory && !categoryExists) {
            form.setValue('category', '');
          }
        } catch (error) {
          console.error('Error fetching department categories:', error);
          // Fall back to filtering from all categories
          const filtered = categories.filter(
            (category) => category.department_id === selectedDepartmentId
          );
          setFilteredCategories(filtered);
        }
      } else {
        setFilteredCategories(categories);
      }
    };

    filterCategories();
  }, [selectedDepartmentId, categories, form]);

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!user || !profile) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to report an issue',
        variant: 'destructive',
      });
      onOpenChange(false);
      return;
    }

    // Check rate limiting
    if (rateLimit.isRateLimited) {
      toast({
        title: 'Too Many Issues Created',
        description: `Please wait ${formatTimeRemaining(
          rateLimit.timeUntilReset
        )} before creating another issue.`,
        variant: 'destructive',
      });
      return;
    }

    // Record the attempt
    if (!rateLimit.recordAttempt()) {
      return; // Rate limited
    }

    // Prevent duplicate submissions
    if (isSubmitting) {
      console.log('Submission already in progress, preventing duplicate');
      return;
    }

    setIsSubmitting(true);

    // Sanitize form data
    const sanitizedData = sanitizeFormData({
      title: sanitizeText(data.title, 100),
      description: sanitizeText(data.description, 2000),
      location: sanitizeText(data.location, 200),
      category: data.category,
      constituency: data.constituency,
      department_id: data.department_id,
      images: data.images,
    });

    try {
      let thumbnails: string[] = [];

      // If images were uploaded, process and store them in Supabase storage
      if (sanitizedData.images && sanitizedData.images.length > 0) {
        try {
          // Process each image sequentially
          for (let i = 0; i < sanitizedData.images.length; i++) {
            const image = sanitizedData.images[i];
            if (!image) continue; // Skip if image is undefined

            setUploadProgress(0); // Reset progress for each image

            // First resize the image to reduce storage usage and improve loading performance
            const resizedImage = await resizeImageBeforeUpload(image);
            console.log(
              `Image ${i + 1}/${
                sanitizedData.images.length
              } resized successfully`,
              {
                originalSize: image.size,
                resizedSize: resizedImage.size,
                reduction: `${Math.round(
                  (1 - resizedImage.size / image.size) * 100
                )}%`,
              }
            );

            // Upload the resized image to Supabase storage
            const imageUrl = await uploadImageToStorage(
              resizedImage,
              'issues',
              'issue-images',
              (progress) => {
                console.log(
                  `Upload progress for image ${i + 1}/${
                    sanitizedData.images.length
                  }: ${progress}%`
                );
                setUploadProgress(progress);
              }
            );

            console.log(
              `Image ${i + 1}/${
                sanitizedData.images.length
              } uploaded successfully, URL:`,
              imageUrl
            );
            thumbnails.push(imageUrl);
          }

          console.log('All images uploaded successfully:', thumbnails);
        } catch (uploadErr) {
          console.error('Exception during image upload:', uploadErr);

          // If we have some successful uploads, continue with those
          if (thumbnails.length === 0) {
            // Fall back to a default image if all uploads fail
            const category = sanitizedData.category.toLowerCase();
            const defaultImageUrl = getCategoryDefaultImage(category);
            thumbnails = [defaultImageUrl];
            console.log('Using fallback image:', defaultImageUrl);

            // Show a warning toast but continue with the submission
            toast({
              title: 'Image Upload Failed',
              description:
                "We couldn't upload your images, but your issue will still be created with a default image.",
              variant: 'warning',
              duration: 5000,
            });
          } else {
            // Some images uploaded successfully
            toast({
              title: 'Some Images Failed to Upload',
              description: `${thumbnails.length} out of ${sanitizedData.images.length} images were uploaded successfully.`,
              variant: 'warning',
              duration: 5000,
            });
          }
        }
      } else {
        // Use reliable default image from Pixabay based on category
        const category = sanitizedData.category.toLowerCase();
        const defaultImageUrl = getCategoryDefaultImage(category);
        thumbnails = [defaultImageUrl];
        console.log(
          'Using default image for category:',
          category,
          defaultImageUrl
        );
      }

      console.log('Creating issue with thumbnails:', thumbnails);

      // Ensure all thumbnail URLs are absolute and valid
      thumbnails = thumbnails.map((url) => {
        if (url && !url.startsWith('http')) {
          console.warn('Thumbnail URL is not absolute, fixing it:', url);
          // If it's a relative URL from Supabase storage, convert to absolute
          if (url.startsWith('/')) {
            return `${supabaseUrl}${url}`;
          } else {
            // Fall back to a category-specific default image
            const category = sanitizedData.category.toLowerCase();
            const defaultImageUrl = getCategoryDefaultImage(category);
            return defaultImageUrl;
          }
        }
        return url;
      });

      console.log('Fixed thumbnail URLs:', thumbnails);

      // Ensure we have at least one thumbnail
      if (thumbnails.length === 0) {
        const category = sanitizedData.category.toLowerCase();
        const defaultImageUrl = getCategoryDefaultImage(category);
        thumbnails = [defaultImageUrl];
      }

      // Check if a similar issue already exists to prevent duplicates
      const { data: existingIssues, error: checkError } = await supabase
        .from('issues')
        .select('id')
        .eq('author_id', user.id)
        .eq('title', sanitizedData.title)
        .limit(1);

      if (checkError) {
        console.error('Error checking for existing issues:', checkError);
      }

      if (existingIssues && existingIssues.length > 0) {
        toast({
          title: 'Duplicate Issue',
          description:
            "You've already created an issue with this title. Please use a different title.",
          variant: 'destructive',
          duration: 5000,
        });
        setIsSubmitting(false);
        return;
      }

      // Create the issue in the database with proper error handling
      // Note: We no longer store author_name and author_avatar directly in the database
      // Instead, we rely on the profiles table join for dynamic avatar fetching
      const issuePayload = {
        title: sanitizedData.title,
        description: sanitizedData.description,
        category: sanitizedData.category,
        location: sanitizedData.location,
        constituency: sanitizedData.constituency,
        department_id: sanitizedData.department_id || null,
        author_id: user.id,
        status: 'open',
        thumbnail: thumbnails[0], // Main thumbnail for backward compatibility
        watchers_count: 1, // Start with 1 watcher (the creator)
        vote_count: 0,
        comment_count: 0,
        view_count: 0,
        created_at: new Date().toISOString(),
      };

      console.log('Creating issue with payload:', issuePayload);

      const { data: issueData, error } = await supabase
        .from('issues')
        .insert(issuePayload)
        .select()
        .single();

      if (error) {
        console.error('Database error creating issue:', error);
        throw new Error(`Failed to create issue: ${error.message}`);
      }

      if (!issueData) {
        throw new Error('Issue was not created successfully');
      }

      console.log('Issue created successfully:', issueData);

      // Automatically add the user as a watcher of their own issue
      // Use the unified watchers table
      try {
        const { error: watcherError } = await supabase.from('watchers').insert({
          issue_id: issueData.id,
          user_id: user.id,
        });

        if (watcherError) {
          console.warn('Failed to add user as watcher:', watcherError);
          // Don't fail the entire operation if watcher creation fails
        }
      } catch (watcherErr) {
        console.warn('Error adding watcher:', watcherErr);
      }

      // Call the onSubmit callback with the created issue data instead of form data
      // This prevents the parent component from trying to create the issue again
      if (onSubmit) {
        onSubmit({
          ...data,
          // Pass additional data that parent components might need
          created_at: issueData.created_at,
          thumbnails: thumbnails,
        } as any); // Type assertion for additional properties
      }

      // Show success toast
      toast({
        title: 'Issue Reported Successfully',
        description:
          'Your issue has been submitted and is now visible to the community.',
        variant: 'default',
      });

      // Close the dialog and reset the form
      onOpenChange(false);
      form.reset();
      setImagePreview([]);
      setUploadProgress(0);
    } catch (error) {
      console.error('Error creating issue:', error);
      toast({
        title: 'Error',
        description: 'Failed to create issue. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] bg-background overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Report New Issue
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
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter a clear title for the issue"
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
                      placeholder="Provide detailed information about the issue"
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
              name="department_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsible Department</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting || isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the government department responsible for this issue
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={
                      isSubmitting || isLoading || !selectedDepartmentId
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            selectedDepartmentId
                              ? 'Select a category'
                              : 'Select a department first'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name.charAt(0).toUpperCase() +
                              category.name.slice(1)}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-categories" disabled>
                          {selectedDepartmentId
                            ? 'No categories available for this department'
                            : 'Please select a department first'}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {selectedDepartmentId
                      ? 'Select a specific category for your issue'
                      : 'Please select a department first'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter the specific location"
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
              name="constituency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Constituency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select constituency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {constituencies.map((constituency) => (
                        <SelectItem
                          key={constituency}
                          value={constituency.toLowerCase()}
                        >
                          {constituency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="images"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel>Images (Optional)</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={isSubmitting}
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length > 0) {
                              onChange(files);

                              // Create previews for all selected files
                              const newPreviews: string[] = [];
                              let loadedCount = 0;

                              files.forEach((file) => {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  if (event.target && event.target.result) {
                                    newPreviews.push(
                                      event.target.result as string
                                    );
                                    loadedCount++;

                                    // When all files are loaded, update the preview state
                                    if (loadedCount === files.length) {
                                      setImagePreview(newPreviews);
                                    }
                                  }
                                };
                                reader.readAsDataURL(file);
                              });
                            }
                          }}
                          {...rest}
                        />
                        {imagePreview.length > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              onChange([]);
                              setImagePreview([]);
                            }}
                            disabled={isSubmitting}
                          >
                            Remove All
                          </Button>
                        )}
                      </div>

                      {imagePreview.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {imagePreview.map((preview, index) => (
                            <div
                              key={index}
                              className="relative border rounded-md overflow-hidden group"
                            >
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-[150px] object-cover"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => {
                                  const newPreviews = [...imagePreview];
                                  newPreviews.splice(index, 1);
                                  setImagePreview(newPreviews);

                                  const newFiles = [...(value || [])];
                                  newFiles.splice(index, 1);
                                  onChange(newFiles);
                                }}
                                disabled={isSubmitting}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-full max-w-[300px] h-[200px] border border-dashed rounded-md bg-muted/20">
                          <div className="flex flex-col items-center text-muted-foreground">
                            <Image className="h-10 w-10 mb-2 opacity-50" />
                            <p className="text-sm">No images selected</p>
                            <p className="text-xs">
                              A default image will be used
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Upload multiple images of the issue (optional). If no images
                    are provided, a default one will be used.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {rateLimit.isRateLimited && (
              <div
                className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive"
                role="alert"
                aria-live="polite"
              >
                Too many issues created. Please wait{' '}
                {formatTimeRemaining(rateLimit.timeUntilReset)} before creating
                another issue.
              </div>
            )}

            <DialogFooter className="flex justify-end gap-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || rateLimit.isRateLimited}
                aria-describedby={
                  rateLimit.isRateLimited ? 'rate-limit-message' : undefined
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {uploadProgress > 0 && uploadProgress < 100
                      ? `Uploading ${uploadProgress}%`
                      : 'Submitting...'}
                  </>
                ) : (
                  'Submit Issue'
                )}
              </Button>
            </DialogFooter>

            {rateLimit.attemptsRemaining < 3 &&
              rateLimit.attemptsRemaining > 0 && (
                <p
                  className="text-sm text-muted-foreground text-center mt-2"
                  role="status"
                  aria-live="polite"
                >
                  {rateLimit.attemptsRemaining} issue
                  {rateLimit.attemptsRemaining !== 1 ? 's' : ''} remaining this
                  hour
                </p>
              )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateIssueDialog;
