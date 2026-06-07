import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateMediationSession } from "@/hooks/use-mediation";
import { MediationPageShell } from "./MediationShared";

export const MediationNew = () => {
  const navigate = useNavigate();
  const createSession = useCreateMediationSession();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!title.trim()) {
      setValidationError("Title is required.");
      return;
    }

    setValidationError("");
    const session = await createSession.mutateAsync({
      title: title.trim(),
      ...(description.trim() ? { description: description.trim() } : {}),
    });
    navigate(`/mediation/${session.id}/perspective`);
  };

  return (
    <MediationPageShell title="New mediation session" backTo="/mediation">
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="What should we call this?"
                disabled={createSession.isPending}
              />
              {validationError ? <p className="text-sm text-red-600">{validationError}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Optional context for both of you"
                rows={4}
                disabled={createSession.isPending}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={createSession.isPending} className="bg-rose-500 hover:bg-rose-600">
                {createSession.isPending ? "Creating..." : "Create session"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </MediationPageShell>
  );
};
