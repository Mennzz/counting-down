import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { HeartHandshake, Loader2, MapPin, Save, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useRelationshipProfile,
  useSaveRelationshipProfile,
} from "@/hooks/use-relationship-profile";
import type {
  RelationshipMode,
  RelationshipPersonProfile,
  RelationshipProfileInput,
} from "@/types/relationship-profile";

const emptyProfile: RelationshipProfileInput = {
  relationshipMode: "LONG_DISTANCE",
  currentlyTogether: false,
  togetherThrough: null,
  relationshipNotes: "",
  practicalNotes: "",
  people: [],
};

export default function RelationshipProfilePage() {
  const profileQuery = useRelationshipProfile();
  const saveProfile = useSaveRelationshipProfile();
  const [draft, setDraft] = useState<RelationshipProfileInput>(emptyProfile);

  useEffect(() => {
    if (!profileQuery.data) return;
    const { relationshipMode, currentlyTogether, togetherThrough, relationshipNotes, practicalNotes, people } = profileQuery.data;
    setDraft({
      relationshipMode,
      currentlyTogether,
      togetherThrough,
      relationshipNotes,
      practicalNotes,
      people: people.map((person) => ({ ...person })),
    });
  }, [profileQuery.data]);

  const updatePerson = (
    userType: RelationshipPersonProfile["userType"],
    field: keyof RelationshipPersonProfile,
    value: string,
  ) => {
    setDraft((current) => ({
      ...current,
      people: current.people.map((person) =>
        person.userType === userType ? { ...person, [field]: value } : person,
      ),
    }));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    saveProfile.mutate({
      ...draft,
      togetherThrough: draft.currentlyTogether ? draft.togetherThrough : null,
    });
  };

  return (
    <div className="min-h-screen romantic-gradient">
      <main className="container mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-rose-600">
              <HeartHandshake className="h-7 w-7" aria-hidden="true" />
              <h1 className="text-3xl font-playfair font-semibold">Relationship settings</h1>
            </div>
            <p className="mt-2 max-w-2xl text-gray-600">
              Shared details that help BIBI Dairy fit your relationship and daily life.
            </p>
          </div>
          <Button asChild variant="outline"><Link to="/">Home</Link></Button>
        </div>

        {profileQuery.isLoading ? (
          <div className="space-y-5"><Skeleton className="h-48" /><Skeleton className="h-80" /></div>
        ) : profileQuery.isError ? (
          <Card><CardContent className="p-6 text-red-700">{profileQuery.error.message}</CardContent></Card>
        ) : (
          <form className="space-y-6" onSubmit={submit}>
            <Card className="border-rose-100 bg-white/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800"><MapPin className="h-5 w-5 text-rose-500" />How life works right now</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="relationship-mode">Usual setup</Label>
                  <Select
                    value={draft.relationshipMode}
                    onValueChange={(value: RelationshipMode) => setDraft((current) => ({ ...current, relationshipMode: value }))}
                  >
                    <SelectTrigger id="relationship-mode"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LONG_DISTANCE">Long distance</SelectItem>
                      <SelectItem value="SAME_LOCATION">Usually in the same place</SelectItem>
                      <SelectItem value="HYBRID">A mix of both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <Label htmlFor="currently-together">Currently together</Label>
                      <p className="mt-1 text-xs text-gray-600">Lets the app account for an in-person visit.</p>
                    </div>
                    <Switch
                      id="currently-together"
                      checked={draft.currentlyTogether}
                      onCheckedChange={(checked) => setDraft((current) => ({ ...current, currentlyTogether: checked }))}
                    />
                  </div>
                  {draft.currentlyTogether ? (
                    <div className="mt-4 space-y-2">
                      <Label htmlFor="together-through">Together through (optional)</Label>
                      <Input
                        id="together-through"
                        type="date"
                        value={draft.togetherThrough ?? ""}
                        onChange={(event) => setDraft((current) => ({ ...current, togetherThrough: event.target.value || null }))}
                      />
                    </div>
                  ) : null}
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="relationship-notes">About your relationship</Label>
                  <Textarea id="relationship-notes" rows={3} maxLength={4000} value={draft.relationshipNotes} onChange={(event) => setDraft((current) => ({ ...current, relationshipNotes: event.target.value }))} placeholder="The rhythm, values, or history that makes your relationship yours." />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="practical-notes">Practical constraints</Label>
                  <Textarea id="practical-notes" rows={3} maxLength={4000} value={draft.practicalNotes} onChange={(event) => setDraft((current) => ({ ...current, practicalNotes: event.target.value }))} placeholder="Travel, schedules, accessibility, budget, or other everyday constraints." />
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              {draft.people.map((person) => (
                <Card key={person.userType} className="border-rose-100 bg-white/80">
                  <CardHeader><CardTitle className="text-gray-800">{person.preferredName || person.userType}</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2"><Label htmlFor={`${person.userType}-name`}>Preferred name</Label><Input id={`${person.userType}-name`} maxLength={80} value={person.preferredName} onChange={(event) => updatePerson(person.userType, "preferredName", event.target.value)} required /></div>
                    <div className="space-y-2"><Label htmlFor={`${person.userType}-location`}>Location</Label><Input id={`${person.userType}-location`} maxLength={160} value={person.location} onChange={(event) => updatePerson(person.userType, "location", event.target.value)} /></div>
                    <div className="space-y-2"><Label htmlFor={`${person.userType}-timezone`}>Time zone</Label><Input id={`${person.userType}-timezone`} maxLength={80} value={person.timezone} onChange={(event) => updatePerson(person.userType, "timezone", event.target.value)} placeholder="Europe/Amsterdam" /></div>
                    <div className="space-y-2"><Label htmlFor={`${person.userType}-personality`}>Personality notes</Label><Textarea id={`${person.userType}-personality`} rows={4} maxLength={3000} value={person.personalityNotes} onChange={(event) => updatePerson(person.userType, "personalityNotes", event.target.value)} placeholder="Helpful context about this person, without reducing them to a label." /></div>
                    <div className="space-y-2"><Label htmlFor={`${person.userType}-preferences`}>Preferences and dislikes</Label><Textarea id={`${person.userType}-preferences`} rows={4} maxLength={3000} value={person.preferencesNotes} onChange={(event) => updatePerson(person.userType, "preferencesNotes", event.target.value)} placeholder="Activities, communication styles, food, routines, or things to avoid." /></div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex gap-2 text-sm text-amber-900"><Sparkles className="mt-0.5 h-4 w-4 shrink-0" />Everything here is shared: both of you can see and edit it. Relevant BIBI Dairy features may use these details to tailor their suggestions.</p>
              <Button type="submit" disabled={saveProfile.isPending || draft.people.length !== 2} className="bg-rose-500 hover:bg-rose-600">
                {saveProfile.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save context
              </Button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
