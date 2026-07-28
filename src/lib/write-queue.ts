import Dexie from "dexie";
import { supabase } from "./supabase";
import type { QuizSession, SubjectProgress } from "../Types/database";

interface TopicProgressDB {
    user_id: string;
    subject: string;
    topic: string;
    correct: number;
    incorrect: number;
    total: number;
    accuracy: number;
    last_attempt_at: string;
    id?: string;
}

type QuizSessionInsert = Omit<QuizSession, "id" | "created_at"> & { created_at?: string };
type SubjectProgressUpsert = Omit<SubjectProgress, "id"> & { id?: string };
type TopicProgressUpsert = Omit<TopicProgressDB, "id"> & { id?: string };

type QueuedWriteType = "quiz_session" | "subject_progress" | "topic_progress";

interface QueuedWrite<T = unknown> {
    id?: number;
    type: QueuedWriteType;
    data: T;
    createdAt: Date;
    retries: number;
}

type QueuedWriteDataMap = {
    quiz_session: QuizSessionInsert;
    subject_progress: SubjectProgressUpsert;
    topic_progress: TopicProgressUpsert;
};

class WriteQueueDB extends Dexie {
    writes!: Dexie.Table<QueuedWrite<unknown>, number>;

    constructor() {
        super("schooldra-write-queue");
        this.version(1).stores({
            writes: "++id, type, createdAt, retries",
        });
    }
}

const queueDB = new WriteQueueDB();

export async function enqueueWrite<T extends QueuedWriteType>(
    type: T,
    data: QueuedWriteDataMap[T]
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
                    await supabase.from("quiz_sessions").insert(write.data as QueuedWriteDataMap["quiz_session"]);
                    break;
                case "subject_progress":
                    await supabase.from("subject_progress").upsert(write.data as QueuedWriteDataMap["subject_progress"]);
                    break;
                case "topic_progress":
                    await supabase.from("topic_progress").upsert(write.data as QueuedWriteDataMap["topic_progress"]);
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
