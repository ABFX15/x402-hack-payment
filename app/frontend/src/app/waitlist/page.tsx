import { redirect } from "next/navigation";

// Legacy /waitlist URL - redirected permanently to /onboarding now that
// signup is open. Kept so external links and old emails still land somewhere.
export default function WaitlistRedirect(): never {
  redirect("/onboarding");
}
