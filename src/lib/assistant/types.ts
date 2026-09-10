/** Wire format between /api/assistant and the chat widget (newline-delimited JSON events). */

export interface AssistantCard {
  stockNumber: string;
  title: string;
  price: number | null;
  mileage: number;
  url: string;
  photo: string | null;
  photoAlt: string;
}

export type AssistantEvent =
  | { type: "text"; delta: string }
  | { type: "vehicles"; vehicles: AssistantCard[] }
  | { type: "status"; message: string }
  | { type: "done"; mode: "claude" | "local" }
  | { type: "error"; message: string };

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}
