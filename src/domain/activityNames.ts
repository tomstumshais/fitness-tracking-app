export const timedActivityNames = [
  "Outdoor cycling",
  "Indoor cycling",
  "Swimming",
  "Physiotherapy",
] as const;

const activityNameAliases: Record<string, string> = {
  "Outdoor bicycle": "Outdoor cycling",
  "Indoor spin bike": "Indoor cycling",
};

export function normalizeActivityName(name: string) {
  return activityNameAliases[name] ?? name;
}
