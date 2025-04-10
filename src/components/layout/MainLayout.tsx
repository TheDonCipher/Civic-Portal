import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast-enhanced";

interface MainLayoutProps {
  children: React.ReactNode;
  onCreateIssue?: () => void;
  onSearch?: (term: string) => void;
  hideFooter?: boolean;
}

const MainLayout = ({
  children,
  onCreateIssue,
  onSearch,
  hideFooter = false,
}: MainLayoutProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSearch = (term: string) => {
    if (onSearch) {
      onSearch(term);
    } else {
      // Default search behavior if no custom handler provided
      navigate(`/issues?search=${encodeURIComponent(term)}`);
    }
  };

  const handleCreateIssue = () => {
    if (onCreateIssue) {
      onCreateIssue();
    } else {
      // Default create issue behavior
      navigate("/issues?create=true");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header onCreateIssue={handleCreateIssue} onSearch={handleSearch} />
      <main className="flex-1 pt-[82px] w-full overflow-x-hidden">
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
