import { timedActivityNames } from "../../domain/activityNames.ts";

export const timedCardioActivities = timedActivityNames;

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
    activityName: "Outdoor cycling",
    icon: "🚴",
    title: "Outdoor cycling",
    description: "Log duration and intensity",
    tone: "cycling",
  },
  {
    type: "cardio" as const,
    activityName: "Indoor cycling",
    icon: "🚲",
    title: "Indoor cycling",
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
  {
    type: "cardio" as const,
    activityName: "Physiotherapy",
    icon: "🩺",
    title: "Physiotherapy",
    description: "Log duration and intensity",
    tone: "physiotherapy",
  },
];

export function getActivityIcon(name: string) {
  return eventPickerOptions.find((option) =>
    option.type === "cardio" && option.activityName === name
  )?.icon ?? "⚡";
}
