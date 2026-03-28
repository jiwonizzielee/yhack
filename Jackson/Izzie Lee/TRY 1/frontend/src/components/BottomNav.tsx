import { useLocation, useNavigate } from "react-router-dom";

const TABS = [
  { path: "/", label: "Home", icon: "⌂" },
  { path: "/search", label: "Search", icon: "◎" },
  { path: "/profile", label: "Profile", icon: "◯" },
];

export function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-[#E5E5EA] flex pb-safe">
      {TABS.map((tab) => {
        const active = pathname === tab.path;
        return (
          <button
            key={tab.path}
            type="button"
            onClick={() => navigate(tab.path)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
              active ? "text-black" : "text-[#C7C7CC]"
            }`}
          >
            <span className={`text-lg ${active ? "font-bold" : ""}`}>{tab.icon}</span>
            <span className={`text-xs ${active ? "font-semibold text-black" : "font-medium text-[#C7C7CC]"}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
