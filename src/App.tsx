import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import { IssuesPage } from "./components/issues/IssuesPage";
import { ReportsPage } from "./components/reports/ReportsPage";
import ProfilePage from "./components/profile/ProfilePage";
import routes from "tempo-routes";

function App() {
  const tempoRoutes =
    import.meta.env.VITE_TEMPO === "true" ? useRoutes(routes) : null;

  return (
    <Suspense fallback={<p>Loading...</p>}>
      {tempoRoutes}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/issues" element={<IssuesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        {import.meta.env.VITE_TEMPO === "true" && (
          <Route path="/tempobook/*" element={null} />
        )}
      </Routes>
    </Suspense>
  );
}

export default App;
