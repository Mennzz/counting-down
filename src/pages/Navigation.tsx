import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Clock,
  Gift,
  HandHeart,
  Heart,
  Image,
  List,
  Menu,
  MessageCircleHeart,
  MessageSquare,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { shouldShowAdventCalendar } from "@/utils/advent-calendar";

interface NavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

interface NavSection {
  id: string;
  label: string;
  icon: LucideIcon;
  shouldShow?: boolean;
  route?: string;
}

const Navigation = ({ activeSection, setActiveSection }: NavigationProps) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const sections: NavSection[] = [
    { id: "countdown", label: "Countdown", icon: Clock },
    { id: "advent", label: "Advent", icon: Gift, shouldShow: shouldShowAdventCalendar() },
    { id: "gallery", label: "Our Photos", icon: Image },
    { id: "todo", label: "Together List", icon: List },
    { id: "stats", label: "Our Stats", icon: Heart },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "boundaries-agreements", label: "Boundaries & Agreements", icon: HandHeart, route: "/boundaries-agreements" },
    { id: "mediation", label: "Mediation", icon: MessageCircleHeart, route: "/mediation" },
  ];
  const visibleSections = sections.filter((section) => section.shouldShow !== false);

  const selectSection = (section: NavSection) => {
    setIsMenuOpen(false);
    if (section.route) {
      navigate(section.route);
      return;
    }
    setActiveSection(section.id);
  };

  const settingsLink = (
    <Button asChild variant="ghost" size="icon" className="text-gray-500 hover:bg-rose-50 hover:text-rose-600">
      <Link to="/relationship-context" aria-label="Relationship settings" title="Relationship settings">
        <Settings className="h-4 w-4" aria-hidden="true" />
      </Link>
    </Button>
  );

  return (
    <nav className="sticky top-0 z-50 glass-effect border-b">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between gap-2 py-2 xl:py-4">
          <Link
            to="/"
            onClick={() => setActiveSection("countdown")}
            className="flex min-w-0 items-center gap-2 transition-opacity hover:opacity-90"
          >
            <span className="text-xl sm:text-2xl" aria-hidden="true">🦄</span>
            <h1 className="truncate font-playfair text-xl font-semibold text-rose-600 sm:text-2xl">BIBI Dairy</h1>
          </Link>

          {/* Full navigation: only once all labels fit on one line */}
          <div className="hidden items-center gap-1 xl:flex">
            {visibleSections.map((section) => {
              const Icon = section.icon;
              const isActive = !section.route && activeSection === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => selectSection(section)}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 transition-all duration-200 ${
                    isActive
                      ? "bg-rose-100 text-rose-600 shadow-sm"
                      : "text-gray-600 hover:bg-rose-50 hover:text-rose-500"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span className="text-sm font-medium">{section.label}</span>
                </button>
              );
            })}
            {settingsLink}
          </div>

          {/* Compact navigation for phones and tablets */}
          <div className="flex shrink-0 items-center gap-1 xl:hidden">
            {settingsLink}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open menu"
                  className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(20rem,85vw)] bg-white/95 p-4 pt-12 backdrop-blur-sm">
                <SheetHeader className="mb-4 text-left">
                  <SheetTitle className="font-playfair text-rose-600">BIBI Dairy</SheetTitle>
                  <SheetDescription className="sr-only">Choose a section</SheetDescription>
                </SheetHeader>
                <ul className="flex flex-col gap-1">
                  {visibleSections.map((section) => {
                    const Icon = section.icon;
                    const isActive = !section.route && activeSection === section.id;
                    return (
                      <li key={section.id}>
                        <button
                          type="button"
                          onClick={() => selectSection(section)}
                          aria-current={isActive ? "page" : undefined}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition-colors ${
                            isActive ? "bg-rose-100 text-rose-600" : "text-gray-700 hover:bg-rose-50 hover:text-rose-500"
                          }`}
                        >
                          <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                          <span>{section.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
