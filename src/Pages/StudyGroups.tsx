import React, { useState, useEffect } from "react";
import AppLayout from "../components/Layout/AppLayout";
import { useGroupStore } from "../Store/useGroupStore";
import GroupCard from "../components/StudyGroups/GroupCard";
import GroupChat from "../components/StudyGroups/GroupChat";
import CreateGroupModal from "../components/StudyGroups/CreateGroupModal";
import Button from "../components/ui/Button";
import { cn } from "../lib/utils";
import {
  Users,
  Plus,
  Search,
  TriangleAlert,
  Filter,
  Beaker,
  Cpu,
  Palette,
  Hash,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  { id: "all", name: "All", icon: Filter },
  {
    id: "science",
    name: "Science",
    icon: Beaker,
    subjects: ["Physics", "Chemistry", "Biology", "Mathematics"],
  },
  {
    id: "engineering",
    name: "Engineering",
    icon: Cpu,
    subjects: ["Mathematics", "Physics"],
  },
  {
    id: "arts",
    name: "Arts",
    icon: Palette,
    subjects: ["English", "Literature", "Economics", "Government", "CRS/IRS"],
  },
];

const StudyGroups: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab] = useState<"discover" | "my-groups">("discover");
  const [category, setCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState(""); // 👈 New Search State
  const [leaveId, setLeaveId] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joining, setJoining] = useState(false);

  const {
    groups,
    myGroupIds,
    loading,
    loadGroups,
    loadMyGroups,
    joinGroup,
    leaveGroup,
    joinByCode,
  } = useGroupStore();

  useEffect(() => {
    loadGroups();
    loadMyGroups();
  }, []);

  const myGroups = groups.filter((g) => myGroupIds.includes(g.id));
  const discoverGroups = groups.filter((g) => !myGroupIds.includes(g.id));
  const activeGroup = groups.find((g) => g.id === activeGroupId);

  const filterAndSortGroups = (list: typeof groups, isDiscoverTab: boolean) => {
    // 1. First filter by Category
    let result = list;
    if (category !== "all") {
      const cat = CATEGORIES.find((c) => c.id === category);
      if (cat?.subjects) {
        result = result.filter(
          (g) => cat.subjects!.includes(g.subject) || g.subject === "Mixed",
        );
      }
    }

    // 2. Next, apply search criteria if text exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      return result.filter(
        (g) =>
          g.name.toLowerCase().includes(query) ||
          g.subject.toLowerCase().includes(query),
      );
    }

    // 3. If on Discover tab and NOT searching, sort by popularity and return the top 6
    if (isDiscoverTab) {
      return [...result]
        .sort((a, b) => {
          // Sort by member count (highest first). Fallback to interaction metric if present on group model
          //  TO THIS:
          const countA = a.member_count || 0;
          const countB = b.member_count || 0;
          return countB - countA;
        })
        .slice(0, 6); // 👈 Limit to top 6
    }

    return result;
  };

  const handleJoinByCode = async () => {
    if (!joinCode.trim()) return;
    setJoinError("");
    setJoining(true);
    const { error } = await joinByCode(joinCode);
    setJoining(false);
    if (error) setJoinError(error);
    else {
      setJoinCode("");
      setTab("my-groups");
    }
  };

  if (activeGroup) {
    return (
      <AppLayout
        currentPage="groups"
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      >
        <div className="fixed inset-0 lg:left-60 top-14 bg-bgMain z-40 flex flex-col">
          <GroupChat group={activeGroup} onBack={() => setActiveGroupId(null)} />
        </div>
      </AppLayout>
    );
  }

  const displayedDiscover = filterAndSortGroups(discoverGroups, true);
  const displayedMyGroups = filterAndSortGroups(myGroups, false);

  return (
    <AppLayout
      currentPage="groups"
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Study Groups
          </h2>
          <p className="text-sm text-textMuted mt-1">
            Study with peers, share strategies, challenge each other.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowCreate(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Create group
        </Button>
      </div>

      {/* Utilities Container: Join By Code & Discover Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Join by code */}
        <div className="bg-bgCard border border-borderMuted rounded-brand-lg p-4">
          <p className="text-xs text-textDim mb-2 font-medium uppercase tracking-widest">
            Join by code
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-textDim" />
              <input
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.toUpperCase());
                  setJoinError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleJoinByCode()}
                placeholder="Enter 8-character code"
                maxLength={8}
                style={{ fontSize: "16px" }}
                className="w-full pl-8 pr-3 py-2 bg-bgSurface border border-borderMuted rounded-brand text-sm font-mono text-textMain placeholder:text-textDim focus:outline-none focus:border-brand/40 transition-colors"
              />
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleJoinByCode}
              disabled={!joinCode.trim() || joining}
            >
              {joining ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "Join"
              )}
            </Button>
          </div>
          {joinError && <p className="text-xs text-danger mt-2">{joinError}</p>}
        </div>

        {/* Dynamic Search Box */}
        <div className="bg-bgCard border border-borderMuted rounded-brand-lg p-4 flex flex-col justify-end">
          <p className="text-xs text-textDim mb-2 font-medium uppercase tracking-widest">
            Find Other Squads
          </p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textDim" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by squad name or subject..."
              className="w-full pl-9 pr-3 py-2 bg-bgSurface border border-borderMuted rounded-brand text-sm text-textMain placeholder:text-textDim focus:outline-none focus:border-brand/40 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-bgSurface border border-borderMuted rounded-brand p-1 mb-4 w-fit">
        {(["discover", "my-groups"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-1.5 rounded-brand text-xs font-medium transition-all",
              tab === t
                ? "bg-bgCard text-textMain border border-borderMuted shadow-sm"
                : "text-textMuted hover:text-textMain",
            )}
          >
            {t === "discover" ? (
              <>
                <Search className="w-3 h-3" /> Discover Hot Squads
              </>
            ) : (
              <>
                <Users className="w-3 h-3" /> My groups
                {myGroups.length > 0 && ` (${myGroups.length})`}
              </>
            )}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-brand text-xs font-medium transition-all shrink-0 border",
                category === c.id
                  ? "bg-bgCard text-textMain border-borderMuted shadow-sm"
                  : "border-transparent text-textMuted hover:text-textMain",
              )}
            >
              <Icon className="w-3 h-3" /> {c.name}
            </button>
          );
        })}
      </div>

      {/* Header Label for Context */}
      {!loading && tab === "discover" && !searchQuery && (
        <p className="text-xs font-semibold text-textMuted tracking-wide uppercase mb-3">
          🔥 Top Trending Squads
        </p>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-brand animate-spin" />
        </div>
      )}

      {/* Groups grid */}
      {!loading &&
        (tab === "discover" ? (
          displayedDiscover.length === 0 ? (
            <div className="text-center py-12 text-textDim text-sm">
              No squads found matching your filters or search.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedDiscover.map((g, i) => (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <GroupCard
                    group={g}
                    isMember={false}
                    onJoin={() => joinGroup(g.id)}
                    onOpen={() => setActiveGroupId(g.id)}
                  />
                </motion.div>
              ))}
            </div>
          )
        ) : displayedMyGroups.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-textDim text-sm mb-4">
              {myGroups.length === 0
                ? "You haven't joined any groups yet."
                : "No groups found in this selection."}
            </p>
            {myGroups.length === 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setTab("discover")}
              >
                Browse groups
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedMyGroups.map((g, i) => (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <GroupCard
                  group={g}
                  isMember={true}
                  onLeave={() => setLeaveId(g.id)}
                  onOpen={() => setActiveGroupId(g.id)}
                />
              </motion.div>
            ))}
          </div>
        ))}

      {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} />}

      {/* Leave confirm */}
      <AnimatePresence>
        {leaveId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setLeaveId(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-bgCard border border-borderMuted rounded-brand-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <TriangleAlert className="w-7 h-7 text-amber-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-2">
                Leave this Squad?
              </h3>
              <p className="text-sm text-textMuted text-center mb-6">
                You will lose access to the group chat and resources.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => setLeaveId(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  className="bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20"
                  onClick={() => {
                    leaveGroup(leaveId!);
                    setLeaveId(null);
                  }}
                >
                  Yes, Leave
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default StudyGroups;
