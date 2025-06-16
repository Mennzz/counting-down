
import { useState } from "react";
import CountdownSection from "../components/CountdownSection";
import PhotoGallery from "../components/PhotoGallery";
import LoveNotes from "../components/LoveNotes";
import TodoList from "../components/TodoList";
import RelationshipStats from "../components/RelationshipStats";
import MessageForm from "../components/MessageForm";
import PlaylistSection from "../components/PlaylistSection";
import Navigation from "../components/Navigation";

const Index = () => {
  const [activeSection, setActiveSection] = useState("countdown");

  const renderSection = () => {
    switch (activeSection) {
      case "countdown":
        return <CountdownSection />;
      case "gallery":
        return <PhotoGallery />;
      case "notes":
        return <LoveNotes />;
      case "todo":
        return <TodoList />;
      case "stats":
        return <RelationshipStats />;
      case "messages":
        return <MessageForm />;
      case "playlist":
        return <PlaylistSection />;
      default:
        return <CountdownSection />;
    }
  };

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
