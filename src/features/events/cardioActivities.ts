export const timedCardioActivities = [
  "Outdoor bicycle",
  "Indoor spin bike",
  "Swimming",
] as const;

export type LoggableEventType = "running" | "walking" | "cardio";

export const eventPickerOptions = [
  {
    type: "running" as const,
    icon: "🏃",
    title: "Running",
    description: "Log distance, duration and pace",
    tone: "running",
  },
  {
    type: "walking" as const,
    icon: "🚶",
    title: "Walking",
    description: "Log distance, duration and pace",
    tone: "walking",
  },
  {
    type: "cardio" as const,
    activityName: "Outdoor bicycle",
    icon: "🚴",
    title: "Outdoor bicycle",
    description: "Log duration and intensity",
    tone: "cycling",
  },
  {
    type: "cardio" as const,
    activityName: "Indoor spin bike",
    icon: "🚲",
    title: "Indoor spin bike",
    description: "Log duration and intensity",
    tone: "spinning",
  },
  {
    type: "cardio" as const,
    activityName: "Swimming",
    icon: "🏊",
    title: "Swimming",
    description: "Log duration and intensity",
    tone: "swimming",
  },
];
