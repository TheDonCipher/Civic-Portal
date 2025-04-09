import React from "react";

const TestingBanner = () => {
  return (
    <div className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 p-4 text-center fixed top-0 left-0 right-0 z-[100]">
      <p className="text-sm font-medium">
        Testing Mode: This website is currently in testing. Some features may
        not be fully functional.
      </p>
    </div>
  );
};

export default TestingBanner;
