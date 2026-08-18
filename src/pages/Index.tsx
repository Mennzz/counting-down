import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { AppColdStartLoader } from "@/components/loading/AppColdStartLoader";
import { FLIGHTS_QUERY_KEY } from "@/hooks/use-flights";
import { flightApi } from "@/services/flight";
import Navigation from "./Navigation";
import CountdownSection from "./CountdownSection";
import { AdventCalendarNew } from "./AdventCalendar";
import PhotoGallery from "./PhotoGallery";
import TodoList from "./TodoList";
import RelationshipStats from "./RelationshipStats";
import MessageForm from "./MessageForm";

const Index = () => {
  const [activeSection, setActiveSection] = useState("countdown");
  const [hasCompletedStartup, setHasCompletedStartup] = useState(false);

  const startupQuery = useQuery({
    queryKey: [...FLIGHTS_QUERY_KEY, "nextFlight"],
    queryFn: flightApi.getNextFlight,
    staleTime: 60_000,
    retry: 0,
    enabled: !hasCompletedStartup,
  });

  useEffect(() => {
    if (startupQuery.status === "success" || startupQuery.status === "error") {
      setHasCompletedStartup(true);
    }
  }, [startupQuery.status]);

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

  if (!hasCompletedStartup && startupQuery.fetchStatus === "fetching") {
    return <AppColdStartLoader />;
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
