
import { useState, useEffect } from "react";
import Navigation from "./Navigation";
import CountdownSection from "./CountdownSection";
import { AdventCalendarNew } from "./AdventCalendar";
import PhotoGallery from "./PhotoGallery";
import TodoList from "./TodoList";
import RelationshipStats from "./RelationshipStats";
import MessageForm from "./MessageForm";
import { Login } from "./Login";
import { isSessionValid } from "@/utils/cookies";

const Index = () => {
  const [activeSection, setActiveSection] = useState("countdown");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated on component mount
    setIsAuthenticated(isSessionValid());
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const renderSection = () => {
    switch (activeSection) {
      case "countdown":
        return <CountdownSection />;
      case "gallery":
        return <PhotoGallery />;
      case "todo":
        return <TodoList />;
      case "stats":
        return <RelationshipStats />;
      case "messages":
        return <MessageForm />;
      case "advent":
        return <AdventCalendarNew />;
      default:
        return <CountdownSection />;
    }
  };

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // If authenticated, show main content
  return (
    <div className="min-h-screen romantic-gradient">
      <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="container mx-auto px-4 py-8">
        <div className="animate-fade-in">
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default Index;
