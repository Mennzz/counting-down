import { useEffect, useMemo, useState } from "react";
import AdventHeader from "./partials/advent/AdventHeader";
import AdventProgress from "./partials/advent/AdventProgress";
import AdventGrid from "./partials/advent/AdventGrid";
import AdventAddEntryForm from "./partials/advent/AdventAddEntryForm";
import AdventFooterQuote from "./partials/advent/AdventFooterQuote";
import { AdventDay } from "@/types/advent";

const baseEntries: AdventDay[] = [
  { day: 1, title: "Voice Note Morning", description: "Start the day with a 30-second voice note telling the other your favorite thing about them right now.", type: "ritual", actor: "Us" },
  { day: 2, title: "Memory Lane", description: "Pick one photo from our gallery and write a sentence about why that moment matters so much.", type: "memory", actor: "Us" },
  { day: 3, title: "Mini Game Night", description: "Play one quick round of any online game together tonight. Winner chooses tomorrow's snack!", type: "play", actor: "Us" },
  { day: 4, title: "Song Swap", description: "Add one song to our playlist that captures today's mood. Listen together while messaging.", type: "surprise", actor: "Us" },
  { day: 5, title: "Tea Break", description: "Make a warm drink at the same time and jump on a 10-minute call to savor it together.", type: "care", actor: "Us" },
  { day: 6, title: "Future Date Sketch", description: "Write three lines about a dream date we'll do when we're reunited. No rules, only cozy plans.", type: "surprise", actor: "Us" },
  { day: 7, title: "Compliment Avalanche", description: "Send three oddly specific compliments throughout the day. The more playful, the better.", type: "ritual", actor: "Us" },
  { day: 8, title: "Shared Sunset", description: "Take a photo of your sky at the same hour and send it. Two skies, one team.", type: "memory", actor: "Us" },
  { day: 9, title: "Cuddle Playlist", description: "Queue our favorite slow song and stay on call for one song-length of quiet togetherness.", type: "care", actor: "Us" },
  { day: 10, title: "Inside Joke Drop", description: "Drop an inside joke into every chat you have today. Keep them guessing, keep us smiling.", type: "play", actor: "Us" },
  { day: 11, title: "Tiny Love Letter", description: "Write a four-line note that starts with \"Because of you...\" and send it before bed.", type: "memory", actor: "Us" },
  { day: 12, title: "Midweek Stretch", description: "Do a quick stretch together on video, then take a screenshot of the goofiest pose.", type: "care", actor: "Us" },
  { day: 13, title: "Dream Board Minute", description: "Share one picture of a place you want us to visit. Why there?", type: "surprise", actor: "Us" },
  { day: 14, title: "Snack Twins", description: "Buy or make the same snack and eat it together while watching a short video.", type: "play", actor: "Us" },
  { day: 15, title: "Story Time", description: "Tell a 60-second story from your childhood you've never shared before.", type: "memory", actor: "Us" },
  { day: 16, title: "Kindness Quest", description: "Do a tiny kindness for someone nearby and text me what happened.", type: "ritual", actor: "Us" },
  { day: 17, title: "Future Playlist", description: "Pick a song that should play when we see each other at the airport and send it with why.", type: "surprise", actor: "Us" },
  { day: 18, title: "Movie Trailer Night", description: "Send a trailer for a movie you want to watch together and plan the watch date.", type: "play", actor: "Us" },
  { day: 19, title: "Gratitude Swap", description: "Share two things the other did this year that you're grateful for.", type: "care", actor: "Us" },
  { day: 20, title: "Digital Hug", description: "Send a selfie hug; I'll reply with mine. Screens can't stop warmth.", type: "ritual", actor: "Us" },
  { day: 21, title: "Bucket List Bite", description: "Pick one todo from our Together List and set a date to make it real.", type: "surprise", actor: "Us" },
  { day: 22, title: "Cozy Read", description: "Read a paragraph from your current book/article aloud to me. Nerd out together.", type: "memory", actor: "Us" },
  { day: 23, title: "Late Night Affirmations", description: "Before sleep, swap three affirmations about who we are together.", type: "care", actor: "Us" },
  { day: 24, title: "Holiday Eve Cheer", description: "Write a wish for our next year and save it in your notes. Share it tomorrow.", type: "ritual", actor: "Us" },
  { day: 25, title: "Big Reveal", description: "Plan a surprise for our reunion day - no spoilers, just hype!", type: "surprise", actor: "Us" },
];

const AdventSection = () => {
  const [items, setItems] = useState<AdventDay[]>(baseEntries);
  const [openedKeys, setOpenedKeys] = useState<string[]>([]);

  // Restore saved calendar + opened state.
  useEffect(() => {
    const storedItems = typeof window !== "undefined" ? localStorage.getItem("advent-items") : null;
    const storedOpened = typeof window !== "undefined" ? localStorage.getItem("advent-opened") : null;

    if (storedItems) {
      try {
        setItems(JSON.parse(storedItems));
      } catch {
        setItems(baseEntries);
      }
    }

    if (storedOpened) {
      try {
        setOpenedKeys(JSON.parse(storedOpened));
      } catch {
        setOpenedKeys([]);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("advent-items", JSON.stringify(items));
    }
  }, [items]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("advent-opened", JSON.stringify(openedKeys));
    }
  }, [openedKeys]);

  const today = new Date();
  const isDecember = today.getMonth() === 11;
  const currentDay = today.getDate();

  const sortedItems = useMemo(() => [...items].sort((a, b) => a.day - b.day), [items]);

  const progress = useMemo(
    () => Math.round((openedKeys.length / sortedItems.length) * 100),
    [openedKeys.length, sortedItems.length]
  );

  const handleOpen = (key: string, available: boolean) => {
    if (!available) return;
    if (!openedKeys.includes(key)) {
      setOpenedKeys((prev) => [...prev, key]);
    }
  };

  const nextLockedDay = useMemo(() => {
    if (!isDecember) return null;
    return sortedItems.find((entry) => entry.day > currentDay)?.day ?? null;
  }, [currentDay, isDecember, sortedItems]);

  const handleAddEntry = (entry: AdventDay) => {
    setItems((prev) => [...prev, entry]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <AdventHeader />
      <AdventProgress
        openedCount={openedKeys.length}
        totalCount={sortedItems.length}
        progressPercent={progress}
        isDecember={isDecember}
        nextLockedDay={nextLockedDay}
      />
      <AdventGrid
        items={items}
        openedKeys={openedKeys}
        isDecember={isDecember}
        currentDay={currentDay}
        onOpen={handleOpen}
      />
      <AdventAddEntryForm onAdd={handleAddEntry} />
      <AdventFooterQuote />
    </div>
  );
};

export default AdventSection;
