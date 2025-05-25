import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Upload, X, Camera } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { constituencies } from '@/lib/constituencies';
import { handleApiError, showSuccess } from '@/lib/utils/errorHandler';
import { supabase } from '@/lib/supabase';

const formSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username is too long'),
  constituency: z.string().min(1, 'Constituency is required'),
  avatar: z.instanceof(File).optional(),
  banner: z.instanceof(File).optional(),
});

interface ProfileSettingsProps {
  onUpdate?: () => void;
}

const ProfileSettings = ({ onUpdate }: ProfileSettingsProps) => {
  const { user, profile, updateProfile, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Get the email from user object, with fallback handling
  const userEmail =
    user?.email || user?.user_metadata?.email || 'No email provided';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: profile?.username || '',
      constituency: profile?.constituency || '',
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!user) return;

    setIsLoading(true);
    try {
      let avatarUrl = profile?.avatar_url;
      let bannerUrl = profile?.banner_url;

      // Upload new avatar if provided
      if (data.avatar) {
        const fileExt = data.avatar.name.split('.').pop();
        const fileName = `${user.id}-avatar-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(filePath, data.avatar, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // Get the public URL
        const { data: publicUrlData } = supabase.storage
          .from('profiles')
          .getPublicUrl(filePath);

        avatarUrl = publicUrlData?.publicUrl || null;
      }

      // Upload new banner if provided
      if (data.banner) {
        const fileExt = data.banner.name.split('.').pop();
        const fileName = `${user.id}-banner-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;
        const filePath = `banners/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(filePath, data.banner, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // Get the public URL
        const { data: publicUrlData } = supabase.storage
          .from('profiles')
          .getPublicUrl(filePath);

        bannerUrl = publicUrlData?.publicUrl || null;
      }

      // Update profile
      const { error } = await updateProfile({
        username: data.username,
        constituency: data.constituency,
        avatar_url: avatarUrl,
        banner_url: bannerUrl,
      });

      if (error) throw error;

      showSuccess(
        'Profile Updated',
        'Your profile has been successfully updated.'
      );

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      handleApiError(error, {
        context: 'Profile update',
        toastTitle: 'Update Failed',
        toastDescription: "We couldn't update your profile. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Please sign in to manage your profile settings.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Update your personal information and preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Avatar className="h-24 w-24 border-2 border-border">
                  <AvatarImage
                    src={
                      avatarPreview ||
                      profile.avatar_url ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
                    }
                    alt={profile.full_name || 'User'}
                  />
                  <AvatarFallback>
                    {profile.full_name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <FormField
                  control={form.control}
                  name="avatar"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem className="mt-2">
                      <FormControl>
                        <div className="flex justify-center">
                          <label
                            htmlFor="avatar-upload"
                            className="flex items-center justify-center h-8 px-3 text-xs bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90"
                          >
                            <Upload className="h-3 w-3 mr-1" />
                            Change Avatar
                            <input
                              id="avatar-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  onChange(file);
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    if (event.target?.result) {
                                      setAvatarPreview(
                                        event.target.result as string
                                      );
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              {...field}
                              disabled={isLoading}
                            />
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex-1 space-y-4 w-full">
                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Full Name
                  </label>
                  <Input
                    value={profile?.full_name || 'Not set'}
                    disabled
                    className="mt-2 bg-muted"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Your full name cannot be changed. Contact support if you
                    need to update this.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Email
                  </label>
                  <Input
                    value={authLoading ? 'Loading...' : userEmail}
                    disabled
                    className="mt-2 bg-muted"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Your email address is managed through your account settings.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your username"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        This will be displayed on your profile and in comments.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Banner Upload Section */}
            <div className="space-y-4">
              <FormLabel>Profile Banner</FormLabel>
              <div className="space-y-4">
                {/* Banner Preview */}
                <div className="relative h-32 w-full rounded-lg overflow-hidden border-2 border-dashed border-border bg-muted">
                  {bannerPreview || profile?.banner_url ? (
                    <div className="relative h-full w-full">
                      <img
                        src={bannerPreview || profile?.banner_url || ''}
                        alt="Banner preview"
                        className="h-full w-full object-cover"
                      />
                      {bannerPreview && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setBannerPreview(null);
                            form.setValue('banner', undefined);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <Camera className="h-8 w-8 mb-2" />
                      <p className="text-sm">No banner image</p>
                    </div>
                  )}
                </div>

                {/* Banner Upload Button */}
                <FormField
                  control={form.control}
                  name="banner"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex justify-center">
                          <label
                            htmlFor="banner-upload"
                            className="flex items-center justify-center h-10 px-4 text-sm bg-secondary text-secondary-foreground rounded-md cursor-pointer hover:bg-secondary/80"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {bannerPreview ? 'Change Banner' : 'Upload Banner'}
                            <input
                              id="banner-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  onChange(file);
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    if (event.target?.result) {
                                      setBannerPreview(
                                        event.target.result as string
                                      );
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              {...field}
                              disabled={isLoading}
                            />
                          </label>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Upload a banner image for your profile. Recommended
                        size: 1200x300 pixels.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="constituency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Constituency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your constituency" />
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
                  <FormDescription>
                    Your constituency helps us show you relevant local issues.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export { ProfileSettings };
export default ProfileSettings;
