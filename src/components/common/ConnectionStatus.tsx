import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    // Skip connection check in production unless explicitly enabled
    const isProduction = import.meta.env.MODE === "production";
    const showConnectionStatus =
      import.meta.env.VITE_SHOW_CONNECTION_STATUS === "true";

    if (isProduction && !showConnectionStatus) {
      return;
    }

    const checkConnection = async () => {
      try {
        // Simple ping to check if Supabase is accessible
        // Use a try-catch to handle network errors
        try {
          // First check if we have valid credentials
          if (!supabase || !supabase.from) {
            console.error("Supabase client not properly initialized");
            setIsConnected(false);
            setIsVisible(true);
            return;
          }

          const { data, error } = await supabase
            .from("issues")
            .select("count")
            .limit(1);

          if (error) {
            console.error("Supabase connection error:", error);
            setIsConnected(false);
            setIsVisible(true);

            // Retry logic
            if (retryCount < maxRetries) {
              console.log(
                `Connection failed. Retrying (${retryCount + 1}/${maxRetries})...`,
              );
              setRetryCount((prev) => prev + 1);
              // Exponential backoff
              setTimeout(checkConnection, 1000 * Math.pow(2, retryCount));
            }
          } else {
            console.log("Supabase connection successful");
            setIsConnected(true);
            // Only show success briefly
            setIsVisible(true);
            setTimeout(() => setIsVisible(false), 3000);
            // Reset retry count on success
            setRetryCount(0);
          }
        } catch (networkErr) {
          console.error("Network error connecting to Supabase:", networkErr);
          setIsConnected(false);
          setIsVisible(true);

          // Retry logic for network errors
          if (retryCount < maxRetries) {
            console.log(
              `Network error. Retrying (${retryCount + 1}/${maxRetries})...`,
            );
            setRetryCount((prev) => prev + 1);
            setTimeout(checkConnection, 1000 * Math.pow(2, retryCount));
          }
        }
      } catch (err) {
        console.error("Connection check failed:", err);
        setIsConnected(false);
        setIsVisible(true);
      }
    };

    checkConnection();

    // Set up periodic connection checks
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [retryCount]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isConnected === false && (
        <Alert variant="destructive" className="w-[300px]">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Database connection error. Some features may not work.
            {retryCount > 0 && retryCount < maxRetries && (
              <span className="block mt-1 text-xs">Retrying connection...</span>
            )}
          </AlertDescription>
        </Alert>
      )}
      {isConnected === true && (
        <Alert
          variant="default"
          className="w-[300px] bg-green-50 border-green-200"
        >
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700">
            Connected to database successfully.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
