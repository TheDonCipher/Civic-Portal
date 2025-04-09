import { supabase } from "@/lib/supabase";

/**
 * Security utility functions for the issue tracking system
 */

// Verify user authentication
export const verifyAuthentication = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) {
    console.error("Authentication error:", error);
    return false;
  }
  return !!session;
};

// Check if user has permission to modify content
export const hasPermission = async (
  resourceType: string,
  resourceId: string,
  action: "update" | "delete",
) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    // Get user profile to check role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Officials can modify any content
    if (profile?.role === "official") return true;

    // For regular users, check if they own the resource
    let query;
    switch (resourceType) {
      case "issue":
        query = supabase
          .from("issues")
          .select("author_id")
          .eq("id", resourceId)
          .single();
        break;
      case "comment":
        query = supabase
          .from("comments")
          .select("author_id")
          .eq("id", resourceId)
          .single();
        break;
      case "update":
        query = supabase
          .from("updates")
          .select("author_id")
          .eq("id", resourceId)
          .single();
        break;
      case "solution":
        query = supabase
          .from("solutions")
          .select("proposed_by")
          .eq("id", resourceId)
          .single();
        break;
      default:
        return false;
    }

    const { data: resource } = await query;

    // Check if user is the author/owner of the resource
    return resource?.author_id === user.id || resource?.proposed_by === user.id;
  } catch (error) {
    console.error(
      `Error checking permission for ${resourceType} ${resourceId}:`,
      error,
    );
    return false;
  }
};

// Sanitize user input to prevent XSS attacks
export const sanitizeInput = (input: string): string => {
  if (!input) return "";

  // Replace potentially dangerous characters
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

// Validate storage access permissions
export const validateStorageAccess = async (
  bucket: string,
  path: string,
  operation: "read" | "write" | "delete",
) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    // For development, we're allowing all authenticated users to access storage
    // In production, you would implement more granular permissions
    return true;
  } catch (error) {
    console.error(
      `Error validating storage access for ${bucket}/${path}:`,
      error,
    );
    return false;
  }
};

// Create a secure audit log for sensitive operations
export const auditLog = async (
  action: string,
  resourceType: string,
  resourceId: string,
  userId: string,
  details?: any,
) => {
  try {
    await supabase.from("audit_logs").insert({
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      user_id: userId,
      details: details ? JSON.stringify(details) : null,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error creating audit log:", error);
  }
};
