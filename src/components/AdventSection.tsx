import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Calendar, Gift, Heart, Image as ImageIcon, Lock, Sparkles, Star, Unlock, Upload } from "lucide-react";

type AdventType = "ritual" | "memory" | "surprise" | "play" | "care";

interface AdventDay {
  day: number;
  title: string;
  description: string;
  type: AdventType;
  actor?: string;
  imageData?: string;
}

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

const typeStyles: Record<AdventType, string> = {
  ritual: "bg-rose-100 text-rose-700 border border-rose-200",
  memory: "bg-amber-100 text-amber-700 border border-amber-200",
  surprise: "bg-purple-100 text-purple-700 border border-purple-200",
  play: "bg-blue-100 text-blue-700 border border-blue-200",
  care: "bg-green-100 text-green-700 border border-green-200",
};

const AdventSection = () => {
  const [items, setItems] = useState<AdventDay[]>(baseEntries);
  const [openedKeys, setOpenedKeys] = useState<string[]>([]);
  const [formState, setFormState] = useState({ day: "", actor: "", note: "", imageData: "" });
  const [isSaving, setIsSaving] = useState(false);

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

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFormState((prev) => ({ ...prev, imageData: "" }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormState((prev) => ({ ...prev, imageData: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddEntry = async (event: FormEvent) => {
    event.preventDefault();
    if (!formState.day || !formState.actor) return;

    setIsSaving(true);
    const newEntry: AdventDay = {
      day: Number(formState.day),
      title: `Surprise from ${formState.actor}`,
      description: formState.note.trim() || "A brand-new treat awaits you here.",
      type: "surprise",
      actor: formState.actor.trim(),
      imageData: formState.imageData,
    };

    setItems((prev) => [...prev, newEntry]);
    setFormState({ day: "", actor: "", note: "", imageData: "" });
    setIsSaving(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Calendar className="w-6 h-6 text-rose-500" />
          <h2 className="text-4xl font-playfair font-semibold text-rose-600">Advent of Us</h2>
          <Calendar className="w-6 h-6 text-rose-500" />
        </div>
        <p className="text-lg text-gray-600 font-inter">
          A cozy little countdown of love, surprises, and together moments
        </p>
      </div>

      <div className="love-card flex flex-col md:flex-row items-center md:items-start md:justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg">
            <Heart className="w-8 h-8 text-white animate-heart-beat" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Opened surprises</p>
            <p className="text-2xl font-semibold text-gray-800">
              {openedKeys.length} / {sortedItems.length}
            </p>
          </div>
        </div>

        <div className="flex-1 w-full md:w-auto">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-3 bg-rose-50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-400 via-pink-500 to-orange-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {isDecember
              ? nextLockedDay
                ? `Next gift unlocks on Dec ${nextLockedDay}`
                : "Everything is unlocked - enjoy them all!"
              : "Open any card early; December rules don't apply yet."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedItems.map((entry) => {
          const cardKey = `${entry.day}-${entry.title}`;
          const available = !isDecember || entry.day <= currentDay;
          const opened = openedKeys.includes(cardKey);

          return (
            <div
              key={cardKey}
              className={`love-card relative overflow-hidden ${opened ? "ring-2 ring-rose-200" : ""}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-semibold">
                    {entry.day}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Day {entry.day}</p>
                    <p className="font-medium text-gray-800">{entry.title}</p>
                    {entry.actor && (
                      <p className="text-xs text-gray-500">From {entry.actor}</p>
                    )}
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${typeStyles[entry.type]}`}>
                  {entry.type}
                </div>
              </div>

              <p className={`font-inter text-gray-600 mb-4 ${!opened ? "line-clamp-2" : ""}`}>
                {entry.description}
              </p>

              {opened && entry.imageData && (
                <div className="mb-4 overflow-hidden rounded-xl border border-rose-100">
                  <img
                    src={entry.imageData}
                    alt={entry.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              {!opened && entry.imageData && (
                <div className="flex items-center text-xs text-gray-500 mb-4">
                  <ImageIcon className="w-4 h-4 mr-2 text-rose-400" />
                  <span>Secret image attached</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  {opened ? (
                    <>
                      <Unlock className="w-4 h-4 text-emerald-500" />
                      <span>Opened</span>
                    </>
                  ) : available ? (
                    <>
                      <Gift className="w-4 h-4 text-rose-500" />
                      <span>Ready to open</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-gray-400" />
                      <span>Opens on Dec {entry.day}</span>
                    </>
                  )}
                </div>
                <button
                  onClick={() => handleOpen(cardKey, available)}
                  disabled={!available}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    opened
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      : available
                        ? "bg-rose-500 text-white hover:bg-rose-600 shadow-md"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {opened ? "Reopen" : "Open"}
                </button>
              </div>

              {!opened && (
                <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center rotate-12">
                  <Star className="w-6 h-6 text-rose-200" />
                </div>
              )}
              {opened && (
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-rose-50/60 via-transparent to-amber-50/60" />
              )}
            </div>
          );
        })}
      </div>

      <div className="love-card">
        <div className="flex items-center space-x-2 mb-4">
          <Upload className="w-5 h-5 text-rose-500" />
          <h3 className="text-xl font-playfair font-medium text-gray-800">Add a new advent surprise</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Drop in a fresh treat for a specific day. Add who it's from and an optional image to reveal when it opens.
        </p>

        <form onSubmit={handleAddEntry} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Day (1-31)</label>
            <input
              type="number"
              min={1}
              max={31}
              value={formState.day}
              onChange={(e) => setFormState((prev) => ({ ...prev, day: e.target.value }))}
              required
              className="w-full px-3 py-2 rounded-lg border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
              placeholder="15"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Who is this from?</label>
            <input
              type="text"
              value={formState.actor}
              onChange={(e) => setFormState((prev) => ({ ...prev, actor: e.target.value }))}
              required
              className="w-full px-3 py-2 rounded-lg border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
              placeholder="Bibi"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Optional note</label>
            <textarea
              value={formState.note}
              onChange={(e) => setFormState((prev) => ({ ...prev, note: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
              placeholder="What should happen when this gift opens?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload an image (optional)</label>
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-lg cursor-pointer border border-rose-200 hover:bg-rose-100">
                <Upload className="w-4 h-4" />
                <span className="text-sm font-medium">Choose file</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
              {formState.imageData && (
                <span className="text-xs text-gray-500 flex items-center space-x-1">
                  <ImageIcon className="w-4 h-4 text-rose-400" />
                  <span>Preview ready</span>
                </span>
              )}
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving || !formState.day || !formState.actor}
              className="px-5 py-2 rounded-lg bg-rose-500 text-white font-medium hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? "Adding..." : "Add to calendar"}
            </button>
          </div>
        </form>
      </div>

      <div className="text-center">
        <div className="love-card inline-block">
          <Sparkles className="w-6 h-6 text-rose-500 mx-auto mb-2" />
          <p className="text-gray-600 font-inter italic">
            Tiny rituals now, big celebrations soon. Each day is a step closer to you.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdventSection;
