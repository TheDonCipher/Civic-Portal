import React from "react";
import { getAppInfo } from "@/lib/utils/info";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
}

const SEOHead = ({
  title,
  description = "A platform for citizens to report and track civic issues while engaging with government stakeholders.",
  keywords = "civic issues, government, citizen engagement, issue tracking, community",
  ogImage = "/og-image.jpg",
  ogUrl,
}: SEOHeadProps) => {
  const info = getAppInfo();
  const fullTitle = title ? `${title} | ${info.name}` : info.name;
  const currentUrl =
    ogUrl || typeof window !== "undefined" ? window.location.href : "";

  // Since we can't use react-helmet, we'll update the document directly
  React.useEffect(() => {
    // Update title
    document.title = fullTitle;

    // Update meta tags
    updateMetaTag("description", description);
    updateMetaTag("keywords", keywords);

    // Update Open Graph tags
    updateMetaTag("og:type", "website", "property");
    updateMetaTag("og:url", currentUrl, "property");
    updateMetaTag("og:title", fullTitle, "property");
    updateMetaTag("og:description", description, "property");
    updateMetaTag("og:image", ogImage, "property");

    // Update Twitter tags
    updateMetaTag("twitter:card", "summary_large_image", "name");
    updateMetaTag("twitter:url", currentUrl, "name");
    updateMetaTag("twitter:title", fullTitle, "name");
    updateMetaTag("twitter:description", description, "name");
    updateMetaTag("twitter:image", ogImage, "name");

    // Cleanup function to reset title when component unmounts
    return () => {
      document.title = info.name;
    };
  }, [
    title,
    description,
    keywords,
    ogImage,
    ogUrl,
    info.name,
    fullTitle,
    currentUrl,
  ]);

  // Helper function to update meta tags
  function updateMetaTag(
    name: string,
    content: string,
    attributeName: "name" | "property" = "name",
  ) {
    let element = document.querySelector(`meta[${attributeName}="${name}"]`);

    if (!element) {
      element = document.createElement("meta");
      element.setAttribute(attributeName, name);
      document.head.appendChild(element);
    }

    element.setAttribute("content", content);
  }

  // This component doesn't render anything visible
  return null;
};

export default SEOHead;
