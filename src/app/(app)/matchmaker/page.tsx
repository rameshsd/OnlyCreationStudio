import { MatchmakerForm } from "./matchmaker-form";

export default function AiMatchmakerPage() {
  return (
    <div className="mx-auto max-w-6xl">
       <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">AI Matchmaker</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Describe your project, and our AI will find the perfect creators to bring your vision to life.
        </p>
      </div>
      <MatchmakerForm />
    </div>
  );
}
