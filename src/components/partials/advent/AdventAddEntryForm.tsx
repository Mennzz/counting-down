import { FC, useState, ChangeEvent, FormEvent } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import { AdventDay } from "@/types/advent";

interface AdventAddEntryFormProps {
  onAdd: (entry: AdventDay) => void;
}

const AdventAddEntryForm: FC<AdventAddEntryFormProps> = ({ onAdd }) => {
  const [formState, setFormState] = useState({ day: "", actor: "", note: "", imageData: "" });
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSubmit = (event: FormEvent) => {
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
    onAdd(newEntry);
    setFormState({ day: "", actor: "", note: "", imageData: "" });
    setIsSaving(false);
  };

  return (
    <div className="love-card">
      <div className="flex items-center space-x-2 mb-4">
        <Upload className="w-5 h-5 text-rose-500" />
        <h3 className="text-xl font-playfair font-medium text-gray-800">Add a new advent surprise</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Drop in a fresh treat for a specific day. Add who it's from and an optional image to reveal when it opens.
      </p>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
  );
};

export default AdventAddEntryForm;
