import React, { useState, useMemo } from "react";
import AppLayout from "../components/Layout/AppLayout";
import { useUserStore } from "../Store/UseUserStore";
import Button from "../components/ui/Button";
import { Users, Calendar, Star, Search, CheckCircle2 } from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface StudyGroup {
  id: string;
  name: string;
  subjectCombo: string;
  description: string;
  members: number;
  maxMembers: number;
  meetingTime: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  rating: number;
  tags: string[];
}

const SAMPLE_GROUPS: StudyGroup[] = [
  {
    id: "1",
    name: "Medicine Masters 2025",
    subjectCombo: "medicine",
    description:
      "Focused group for medical school aspirants covering Biology, Chemistry, and Physics.",
    members: 12,
    maxMembers: 15,
    meetingTime: "Mon, Wed, Fri - 4:00 PM",
    difficulty: "Advanced",
    rating: 4.8,
    tags: ["Biology", "Chemistry", "Physics"],
  },
  {
    id: "2",
    name: "Engineering Elite",
    subjectCombo: "engineering",
    description: "Math and Physics intensive group for engineering candidates.",
    members: 8,
    maxMembers: 12,
    meetingTime: "Tue, Thu - 5:30 PM",
    difficulty: "Advanced",
    rating: 4.6,
    tags: ["Mathematics", "Physics"],
  },
  {
    id: "3",
    name: "Commerce Champions",
    subjectCombo: "social-sci",
    description:
      "Economics and Government focused study group for business students.",
    members: 15,
    maxMembers: 20,
    meetingTime: "Sat - 10:00 AM",
    difficulty: "Intermediate",
    rating: 4.5,
    tags: ["Economics", "Government"],
  },
];

const SUBJECT_COMBO_LABELS: Record<string, string> = {
  medicine: "Medicine",
  engineering: "Engineering",
  "social-sci": "Social Sci",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Intermediate: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Advanced: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

const StudyGroups: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { subjectCombo: userSubjectCombo } = useUserStore();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [joinedGroups, setJoinedGroups] = useState<string[]>([]);

  const filteredGroups = useMemo(() => {
    if (selectedFilter === "all") return SAMPLE_GROUPS;
    if (selectedFilter === "my-combo" && userSubjectCombo) {
      return SAMPLE_GROUPS.filter((g) => g.subjectCombo === userSubjectCombo);
    }
    return SAMPLE_GROUPS.filter((g) => g.subjectCombo === selectedFilter);
  }, [selectedFilter, userSubjectCombo]);

  const handleJoinGroup = (id: string) => {
    setJoinedGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );
  };

  return (
    <AppLayout
      currentPage="study-groups"
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
    >
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
            Study Squads
          </h1>
          <p className="text-textDim text-xs sm:text-sm max-w-md">
            Connect with students preparing for your exams.
          </p>
        </div>

        {/* Filter (scrollable + mobile friendly) */}
        <div className="sticky top-0 z-20 bg-bgMain/95 backdrop-blur px-2 py-3 mb-6 border-b border-borderMuted">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <FilterBtn
              active={selectedFilter === "all"}
              onClick={() => setSelectedFilter("all")}
              label="All"
            />
            {Object.entries(SUBJECT_COMBO_LABELS).map(([key, label]) => (
              <FilterBtn
                key={key}
                active={selectedFilter === key}
                onClick={() => setSelectedFilter(key)}
                label={label}
              />
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredGroups.map((group) => (
              <motion.div
                key={group.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-bgCard border border-borderMuted rounded-xl p-4 sm:p-6 flex flex-col min-w-0"
              >
                <div className="flex justify-between mb-3">
                  <h3 className="text-sm sm:text-lg font-bold text-white truncate">
                    {group.name}
                  </h3>
                  <div className="flex items-center text-xs">
                    <Star className="w-3 h-3 text-yellow-500" />
                    {group.rating}
                  </div>
                </div>

                <p className="text-textDim text-xs sm:text-sm mb-4 line-clamp-2">
                  {group.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-4">
                  <div className="flex items-center gap-1">
                    <Users size={14} /> {group.members}/{group.maxMembers}
                  </div>
                  <div>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px]",
                        DIFFICULTY_COLORS[group.difficulty],
                      )}
                    >
                      {group.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 col-span-2">
                    <Calendar size={14} /> {group.meetingTime}
                  </div>
                </div>

                <button
                  onClick={() => handleJoinGroup(group.id)}
                  className={cn(
                    "w-full py-3 rounded-lg text-sm font-bold flex justify-center items-center gap-2",
                    joinedGroups.includes(group.id)
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-brand text-white",
                  )}
                >
                  {joinedGroups.includes(group.id) ? (
                    <>
                      <CheckCircle2 size={16} /> Joined
                    </>
                  ) : (
                    "Join"
                  )}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty */}
        {filteredGroups.length === 0 && (
          <div className="text-center py-16">
            <Search size={28} className="mx-auto mb-3" />
            <p className="text-sm text-textDim">No groups found</p>
            <Button onClick={() => setSelectedFilter("all")}>Reset</Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

const FilterBtn = ({ active, onClick, label }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "px-4 py-2 text-[11px] rounded-lg whitespace-nowrap border",
      active ? "bg-brand text-white" : "bg-bgDeep text-textDim",
    )}
  >
    {label}
  </button>
);

export default StudyGroups;
