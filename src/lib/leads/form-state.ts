/** Shared (client + server) shape returned by the lead server action. */
export interface FormState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  reference?: string;
  /** Appointment requests: whether the scheduling provider actually confirmed the slot. */
  confirmed?: boolean;
}

export const initialFormState: FormState = { status: "idle" };
