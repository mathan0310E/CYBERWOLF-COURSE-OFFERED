import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function AboutPage() {
  return (
    <div className="container max-w-3xl py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">About CyberWolf 360</h1>
      <div className="mt-6 space-y-4 text-muted">
        <p>
          CyberWolf 360 offers courses in Cyber Security, AI &amp; Web Development, and Ethical Hacking. Our aim is
          to help learners develop practical knowledge and a stronger understanding of modern digital technologies.
        </p>
        <p>
          We keep our descriptions general and honest. We do not publish course durations, detailed syllabi, trainer
          biographies, certifications, placement promises or testimonials unless they have been verified.
        </p>
        <p className="font-semibold text-foreground">Learn. Secure. Build.</p>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/courses">Explore courses</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/enroll">Enroll now</Link>
        </Button>
      </div>
    </div>
  );
}
