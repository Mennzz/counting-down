
import { Heart, Calendar, Image, MessageSquare, List, Clock, Music } from "lucide-react";

interface NavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const Navigation = ({ activeSection, setActiveSection }: NavigationProps) => {
  const sections = [
    { id: "countdown", label: "Countdown", icon: Clock },
    { id: "gallery", label: "Our Photos", icon: Image },
    { id: "notes", label: "Love Notes", icon: MessageSquare },
    { id: "todo", label: "Together List", icon: List },
    { id: "stats", label: "Our Stats", icon: Heart },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "playlist", label: "Our Songs", icon: Music },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-effect border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🦄</span>
            <h1 className="text-2xl font-playfair font-semibold text-rose-600">BIBI Dairy</h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                    activeSection === section.id
                      ? "bg-rose-100 text-rose-600 shadow-sm"
                      : "text-gray-600 hover:bg-rose-50 hover:text-rose-500"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{section.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile menu - simplified */}
          <div className="md:hidden">
            <select
              value={activeSection}
              onChange={(e) => setActiveSection(e.target.value)}
              className="bg-white/80 border border-rose-200 rounded-lg px-3 py-2 text-sm"
            >
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
