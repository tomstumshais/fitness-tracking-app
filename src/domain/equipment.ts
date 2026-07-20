import type { Equipment } from "./fitness.ts";

const labels: Record<Equipment, string> = {
  dumbbell: "Dumbbells",
  "resistance-band": "Resistance band",
  bodyweight: "Bodyweight",
};

const abbreviations: Record<Equipment, string> = {
  dumbbell: "DB",
  "resistance-band": "RB",
  bodyweight: "BW",
};

export function equipmentLabel(equipment: Equipment) {
  return labels[equipment];
}

export function equipmentAbbreviation(equipment: Equipment) {
  return abbreviations[equipment];
}

export function equipmentSetLabel(equipment: Equipment) {
  if (equipment === "bodyweight") return "BW";
  if (equipment === "resistance-band") return "Band";
  return null;
}

export function requiresWeight(equipment: Equipment) {
  return equipment === "dumbbell";
}
