import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProfileNotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-gradient-to-b from-rose-50 to-white px-6 py-24 text-center">
      <p className="font-display text-3xl font-semibold text-[#2d2424]">
        This page isn’t here
      </p>
      <p className="mt-3 max-w-md text-muted-foreground">
        We couldn’t find a profile for that username. Double-check the link, or
        create your own page.
      </p>
      <Button className="mt-8" asChild>
        <Link href="/">Go home</Link>
      </Button>
    </div>
  );
}
