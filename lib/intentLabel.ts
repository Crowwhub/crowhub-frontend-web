// Display-only label overrides for findMeFor / intent values.
//
// The stored value stays canonical (it must equal what's in User.findMeFor for
// backend matching). This only changes what users SEE — e.g. the stored
// "Hire me" reads as "Hiring". Keep this as the single source of truth and use
// intentLabel() anywhere an intent/findMeFor value is shown to the user.
export const INTENT_LABELS: Record<string, string> = {
  "Hire me": "Hiring",
  "Project Collab": "Project Collaboration",
};

export function intentLabel(value: string | null | undefined): string {
  if (!value) return "";
  return INTENT_LABELS[value] ?? value;
}
