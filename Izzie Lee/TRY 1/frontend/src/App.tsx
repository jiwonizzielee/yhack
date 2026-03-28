import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { BottomNav } from "./components/BottomNav";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Results from "./pages/Results";
import Profile from "./pages/Profile";

const NO_NAV = ["/login", "/onboarding"];

function Layout() {
  const { pathname } = useLocation();
  const showNav = !NO_NAV.includes(pathname);

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
        <Route path="/search" element={<RequireAuth><Search /></RequireAuth>} />
        <Route path="/results" element={<RequireAuth><Results /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showNav && <BottomNav />}
    </>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuthStore();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="max-w-md mx-auto min-h-screen bg-black">
        <Layout />
      </div>
    </BrowserRouter>
  );
}