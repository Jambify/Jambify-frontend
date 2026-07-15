import Dexie from "dexie";
import { supabase } from "./supabase";

interface QueuedWrite {
    id?: number;
    type: "quiz_session" | "subject_progress" | "topic_progress";
    data: any;
    createdAt: Date;
    retries: number;
}

class WriteQueueDB extends Dexie {
    writes!: Dexie.Table<QueuedWrite, number>;

    constructor() {
        super("schooldra-write-queue");
        this.version(1).stores({
            writes: "++id, type, createdAt, retries",
        });
    }
}

const queueDB = new WriteQueueDB();

export async function enqueueWrite(
    type: QueuedWrite["type"],
    data: any
): Promise<void> {
    await queueDB.writes.add({
        type,
        data,
        createdAt: new Date(),
        retries: 0,
    });
    await processQueue();
}

async function processQueue(): Promise<void> {
    const writes = await queueDB.writes.orderBy("createdAt").toArray();

    for (const write of writes) {
        try {
            switch (write.type) {
                case "quiz_session":
                    await supabase.from("quiz_sessions").insert(write.data);
                    break;
                case "subject_progress":
                    await supabase.from("subject_progress").upsert(write.data);
                    break;
                case "topic_progress":
                    await supabase.from("topic_progress").upsert(write.data);
                    break;
            }
            await queueDB.writes.delete(write.id!);
        } catch (err) {
            console.error(`❌ Failed to process queued write ${write.id}:`, err);
            if (write.retries < 5) {
                await queueDB.writes.update(write.id!, {
                    retries: write.retries + 1,
                });
            } else {
                await queueDB.writes.delete(write.id!);
                console.error(`⚠️ Dropped write after ${write.retries} retries:`, write);
            }
        }
    }
}

if (typeof window !== "undefined") {
    window.addEventListener("online", () => {
        console.log("📡 Back online, processing queued writes...");
        processQueue();
    });
}

