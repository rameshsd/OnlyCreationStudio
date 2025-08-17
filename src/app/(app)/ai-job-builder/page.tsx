import { JobDescriptionForm } from "./job-description-form";

export default function AiJobBuilderPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">AI Job Builder</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Describe your ideal candidate in a few words, and let our AI craft the perfect job description.
        </p>
      </div>
      <JobDescriptionForm />
    </div>
  );
}
