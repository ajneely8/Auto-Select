import "server-only";
import { dataDir } from "@/lib/data-dir";
import { createFileCallLogStore } from "./store";

/** One store instance for the whole process, so every write shares the same queue. */
export const callLogStore = createFileCallLogStore(dataDir());
