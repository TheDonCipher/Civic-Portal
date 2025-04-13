import React from "react";
import Breadcrumbs, { BreadcrumbItem } from "./Breadcrumbs";

interface PageTitleProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export const PageTitle = ({
  title,
  description,
  breadcrumbs,
  actions,
}: PageTitleProps) => {
  return (
    <div className="bg-background border-b border-border py-6 px-6">
      <div className="max-w-[1800px] mx-auto">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} className="mb-4" />}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            {description && (
              <p className="text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
};

export default PageTitle;
