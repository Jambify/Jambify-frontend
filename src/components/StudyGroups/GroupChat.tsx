// src/components/StudyGroups/GroupChat.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useGroupStore } from "../../Store/useGroupStore";
import type { ChatMessage, ReplyPreview } from "../../Store/useGroupStore";
import { useUserStore } from "../../Store/useUserStore";
import type { StudyGroup } from "../../Store/useGroupStore";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import MessageStatusIndicator from "./MessageStatusIndicator";
import { cn } from "../../lib/utils/utils";
import { motion, useAnimation } from "framer-motion";
import type { PanInfo } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Users,
  Copy,
  Check,
  Loader2,
  Wifi,
  WifiOff,
  X,
  CornerDownRight,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

interface Props {
  group: StudyGroup;
  onBack: () => void;
}

// ── Palette helper ──────────────────────────────────────
const SUBJECT_COLORS: Record<string, string> = {
  English: "#7B5FFF",
  Mathematics: "#00C896",
  Physics: "#FFB020",
  Chemistry: "#FF4D6D",
  Biology: "#00C896",
  Mixed: "#7B5FFF",
  Economics: "#FFB020",
  Government: "#EC4899",
  Literature: "#F97316",
};

function subjectColor(subject: string) {
  return SUBJECT_COLORS[subject] ?? "#7B5FFF";
}

// ── Reply Banner ────────────────────────────────────────
interface ReplyBannerProps {
  reply: ReplyPreview;
  onCancel: () => void;
}
const ReplyBanner: React.FC<ReplyBannerProps> = ({ reply, onCancel }) => (
  <div className="flex items-center gap-3 px-4 py-2.5 bg-bgSurface/95 backdrop-blur-sm border-t border-l-4 border-brand mb-1 animate-in slide-in-from-bottom-2 duration-200 shadow-lg">
    <div className="p-1.5 rounded-lg bg-brand/10 text-brand shrink-0">
      <CornerDownRight className="w-4 h-4" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <p className="text-[11px] font-black text-brand uppercase tracking-wider">
          Replying to {reply.author}
        </p>
      </div>
      <p className="text-xs text-textDim truncate mt-0.5 opacity-80 italic">
        "{reply.message}"
      </p>
    </div>
    <button
      onClick={onCancel}
      className="w-8 h-8 flex items-center justify-center rounded-full bg-bgDeep/50 text-textDim hover:text-white hover:bg-bgDeep transition-all shrink-0"
    >
      <X className="w-4 h-4" />
    </button>
  </div>
);

// ── Quoted message bubble ───────────────────────────────
interface QuotedMsgProps {
  reply: ReplyPreview;
  isMe: boolean;
}
const QuotedMsg: React.FC<QuotedMsgProps> = ({ reply, isMe }) => (
  <div
    className={cn(
      "px-2.5 py-1.5 rounded mb-1 border-l-2 text-[11px] w-full max-w-full overflow-hidden",
      isMe ? "bg-brand/10 border-brand/20" : "bg-bgMain border-borderMuted",
    )}
  >
    <p
      className={cn(
        "font-bold mb-0.5 truncate",
        isMe ? "text-brand-light" : "text-brand",
      )}
    >
      {reply.author}
    </p>
    <p
      className={cn("truncate", isMe ? "text-brand-light/70" : "text-textDim")}
    >
      {reply.message}
    </p>
  </div>
);

// ── Network Banner ──────────────────────────────────────
interface NetworkBannerProps {
  quality: "good" | "slow" | "offline";
  wasOffline: boolean;
  pendingCount: number;
  onRetryAll: () => void;
}
const NetworkBanner: React.FC<NetworkBannerProps> = ({
  quality,
  wasOffline,
  pendingCount,
  onRetryAll,
}) => {
  if (quality === "good" && !wasOffline) return null;

  if (wasOffline && quality === "good") {
    return (
      <div className="flex items-center justify-between gap-2 px-4 py-2 bg-success/10 border-b border-success/20 text-success-light dark:text-success text-xs font-medium animate-in slide-in-from-top-2 duration-300">
        <span className="flex items-center gap-1.5">
          <Wifi className="w-3.5 h-3.5" /> Back online
        </span>
        {pendingCount > 0 && (
          <button
            onClick={onRetryAll}
            className="flex items-center gap-1 underline hover:no-underline"
          >
            <RefreshCw className="w-3 h-3" /> Retry {pendingCount} failed
          </button>
        )}
      </div>
    );
  }

  if (quality === "offline") {
    return (
      <div className="flex items-center justify-between gap-2 px-4 py-2 bg-danger/10 border-b border-danger/20 text-danger-light dark:text-danger text-xs font-medium">
        <span className="flex items-center gap-1.5">
          <WifiOff className="w-3.5 h-3.5" /> No connection — messages will retry
          when online
        </span>
      </div>
    );
  }

  if (quality === "slow") {
    return (
      <div className="flex items-center justify-between gap-2 px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium">
        <span className="flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" /> Slow connection — messages may
          be delayed
        </span>
      </div>
    );
  }

  return null;
};

// ── Swipeable Message Bubble ────────────────────────────
interface SwipeableBubbleProps {
  msg: ChatMessage;
  isMe: boolean;
  color: string;
  onReply: (msg: ChatMessage) => void;
  children: React.ReactNode;
}

const SwipeableBubble: React.FC<SwipeableBubbleProps> = ({
  msg,
  isMe,
  onReply,
  children,
}) => {
  const controls = useAnimation();
  const [swipeTriggered, setSwipeTriggered] = useState(false);

  const handleDragEnd = async (_: any, info: PanInfo) => {
    // If swiped more than 60px to the right (for others) or left (for me)
    const threshold = 60;
    const isSwipeRight = info.offset.x > threshold;
    const isSwipeLeft = info.offset.x < -threshold;

    if (isSwipeRight && !isMe) {
      onReply(msg);
    } else if (isSwipeLeft && isMe) {
      onReply(msg);
    }

    // Reset position
    controls.start({ x: 0 });
    setSwipeTriggered(false);
  };

  const handleDrag = (_: any, info: PanInfo) => {
    const threshold = 60;
    const currentX = info.offset.x;

    if ((!isMe && currentX > threshold) || (isMe && currentX < -threshold)) {
      if (!swipeTriggered) {
        setSwipeTriggered(true);
        // Haptic feedback could go here if available
      }
    } else {
      setSwipeTriggered(false);
    }
  };

  return (
    <div className="relative flex items-center w-full group/bubble">
      {/* Reply indicator that shows behind the bubble when swiping */}
      <div
        className={cn(
          "absolute inset-y-0 flex items-center transition-opacity duration-200",
          isMe ? "right-10" : "left-10",
          swipeTriggered ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="p-2 rounded-full bg-brand/20 text-brand">
          <CornerDownRight className="w-5 h-5" />
        </div>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: isMe ? -100 : 0, right: isMe ? 0 : 100 }}
        dragElastic={0.2}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="w-full cursor-grab active:cursor-grabbing relative"
      >
        {children}

        {/* Desktop Hover Reply Button */}
        {!msg.id.startsWith("temp-") && msg.status !== "failed" && (
          <button
            onClick={() => onReply(msg)}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 p-2 rounded-full bg-bgSurface border border-borderMuted shadow-xl text-textMuted hover:text-brand hover:border-brand/40 transition-all opacity-0 group-hover/bubble:opacity-100 scale-75 group-hover/bubble:scale-100 z-10 hidden md:flex",
              isMe ? "-left-12" : "-right-12",
            )}
          >
            <CornerDownRight className="w-4 h-4" />
          </button>
        )}
      </motion.div>
    </div>
  );
};

// ── Main component ──────────────────────────────────────
const GroupChat: React.FC<Props> = ({ group, onBack }) => {
  const { id: myId, name } = useUserStore();
  const {
    myGroupIds,
    loadMessages,
    sendMessage,
    retryMessage,
    subscribeToChat,
    getMessages,
    msgLoading,
    joinGroup,
  } = useGroupStore();

  const { isOnline, wasOffline, quality } = useNetworkStatus();

  // Safety check: if group is missing, don't crash
  // Move all hooks ABOVE this line to satisfy React rules
  const groupId = group?.id || "";
  const groupSubject = group?.subject || "Mixed";
  const groupName = group?.name || "";
  const groupIcon = group?.icon || "💬";
  const groupMemberCount = group?.member_count || 0;
  const groupJoinCode = group?.join_code || "";

  const messages = getMessages(groupId);
  const isMember = myGroupIds.includes(groupId);

  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const [connected, setConnected] = useState(false);
  const [replyTo, setReplyTo] = useState<ReplyPreview | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const color = subjectColor(groupSubject);

  const failedInGroup = messages.filter((m) => m.status === "failed");

  // ── Load + subscribe ──────────────────────────────────
  useEffect(() => {
    if (!groupId) return;
    loadMessages(groupId);
    const unsub = subscribeToChat(groupId);
    setConnected(true);

    return () => {
      unsub?.();
      setConnected(false);
    };
  }, [groupId, loadMessages, subscribeToChat]);

  // ── Auto-retry failed messages when back online ───────
  useEffect(() => {
    if (wasOffline && isOnline && failedInGroup.length > 0 && groupId) {
      failedInGroup.forEach((msg) => {
        retryMessage(groupId, msg.id);
      });
    }
  }, [wasOffline, isOnline, failedInGroup, groupId, retryMessage]);

  // ── Auto-scroll ───────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, replyTo]); // Also scrolls when reply container renders

  // ── Handlers ──────────────────────────────────────────
  const handleSend = useCallback(() => {
    if (!text.trim() || !isMember || !isOnline || !groupId) return;

    // Explicitly pass replyTo parameters through the action layer
    sendMessage(groupId, text, replyTo);

    setText("");
    setReplyTo(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [text, isMember, isOnline, replyTo, groupId, sendMessage]);

  const handleReply = useCallback(
    (msg: ChatMessage) => {
      setReplyTo({
        id: msg.id,
        author: msg.user_id === myId ? name || "You" : msg.author,
        message: msg.message,
      });
      inputRef.current?.focus();
    },
    [myId, name],
  );

  const handleRetryAll = useCallback(() => {
    if (!groupId) return;
    failedInGroup.forEach((msg) => retryMessage(groupId, msg.id));
  }, [failedInGroup, groupId, retryMessage]);

  const copyJoinCode = useCallback(() => {
    if (!groupJoinCode) return;
    navigator.clipboard.writeText(groupJoinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [groupJoinCode]);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

  if (!group) return null;

  return (
    // FIXED Layout: Removed restrictive max-height to allow chat to fill available viewport space
    // The parent container in StudyGroups.tsx already handles the fixed positioning and sidebar offset.
    <div className="flex flex-col h-full overflow-hidden relative w-full bg-bgMain">
      {/* ── Fixed group info header ────────────────────────── */}
      <div className="shrink-0 border-b border-borderMuted bg-bgCard/95 backdrop-blur-md z-30 shadow-sm">
        <div className="flex items-center gap-3 px-3 py-2 md:py-2.5">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-xl bg-bgSurface hover:bg-bgDeep text-textMuted hover:text-white transition-all shrink-0 border border-borderMuted active:scale-90"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          <div
            className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-lg md:text-xl shrink-0 shadow-inner"
            style={{ background: `${color}15`, border: `1px solid ${color}30` }}
          >
            {groupIcon}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-sm tracking-tight truncate">
              {groupName}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-textDim mt-0.5 font-semibold">
              <Users className="w-3 h-3 text-brand" />
              <span>{groupMemberCount} members</span>
              <span className="opacity-20 text-textDim">|</span>
              <span
                className={cn(
                  "flex items-center gap-1",
                  connected ? "text-success" : "text-amber-500",
                )}
              >
                {connected ? (
                  <>
                    <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />{" "}
                    Live
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" /> Syncing
                  </>
                )}
              </span>
            </div>
          </div>

          {isMember && (
            <button
              onClick={copyJoinCode}
              className={cn(
                "flex items-center gap-2 text-[10px] font-mono font-bold px-3 py-2 rounded-xl border transition-all shrink-0 active:scale-95",
                copied
                  ? "bg-success/10 border-success/30 text-success"
                  : "bg-bgSurface border-borderMuted text-textMuted hover:border-brand/40 hover:text-textMain",
              )}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{groupJoinCode}</span>
            </button>
          )}
        </div>

        <NetworkBanner
          quality={quality}
          wasOffline={wasOffline}
          pendingCount={failedInGroup.length}
          onRetryAll={handleRetryAll}
        />
      </div>

      {/* ── Scrollable Messages Area ─────────────────────── */}
      <div className="flex-1 overflow-y-auto w-full flex flex-col px-4 py-4 custom-scrollbar bg-bgMain/40 space-y-1">
        {msgLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-8 h-8 text-brand animate-spin" />
            <p className="text-xs text-textDim font-medium">
              Fetching messages...
            </p>
          </div>
        )}

        {!msgLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center my-auto py-12 text-textDim gap-4 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-bgSurface rounded-3xl flex items-center justify-center text-3xl border border-borderMuted shadow-xl">
              💬
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-textMain">
                No conversation yet
              </p>
              <p className="text-xs mt-1">Be the first to break the ice!</p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isMe = msg.user_id === myId;
          const isTemp = msg.id.startsWith("temp-");
          const isFailed = msg.status === "failed";
          const prevMsg = messages[idx - 1];

          // Grouping logic: check if message is part of a run
          const isFirstInGroup = !prevMsg || prevMsg.user_id !== msg.user_id;

          return (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3 group w-full transition-all duration-200",
                isMe ? "flex-row-reverse" : "flex-row",
                isFirstInGroup ? "mt-4" : "mt-1",
              )}
            >
              {/* Avatar: Only show on first message of group */}
              <div className="w-8 h-8 flex items-end justify-center shrink-0">
                {isFirstInGroup ? (
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black text-white shadow-sm border border-borderMuted"
                    style={{ background: isMe ? color : "rgb(40,40,50)" }}
                  >
                    {(isMe ? name || "Me" : msg.author || "U")
                      .slice(0, 1)
                      .toUpperCase()}
                  </div>
                ) : (
                  <div className="w-8" /> // Spacer
                )}
              </div>

              {/* Message Content */}
              <div
                className={cn(
                  "flex flex-col max-w-[80%] min-w-15",
                  isMe ? "items-end" : "items-start",
                )}
              >
                {/* Name: ALWAYS show above each message as per requirements */}
                <p
                  className={cn(
                    "text-[10px] font-bold mb-1 px-1 tracking-wide",
                    isMe ? "text-brand-light" : "text-textDim",
                  )}
                >
                  {msg.author}
                </p>

                {/* Quoted Message (Reply) */}
                {msg.reply_to && (
                  <div className="w-full mb-1">
                    <QuotedMsg reply={msg.reply_to} isMe={isMe} />
                  </div>
                )}

                {/* Message Bubble */}
                <SwipeableBubble
                  msg={msg}
                  isMe={isMe}
                  color={color}
                  onReply={handleReply}
                >
                  <div
                    className={cn(
                      "px-4 py-2.5 text-sm leading-relaxed wrap-break-word whitespace-pre-wrap shadow-sm transition-all",
                      isMe
                        ? "bg-brand text-white rounded-2xl rounded-tr-sm"
                        : "bg-bgCard border border-borderMuted text-textMain rounded-2xl rounded-tl-sm",
                      isFirstInGroup &&
                        (isMe ? "rounded-tr-sm" : "rounded-tl-sm"),
                      (isTemp || isFailed) && "opacity-60 grayscale-[0.5]",
                      isFailed && "border-danger/40 bg-danger/5",
                    )}
                  >
                    {msg.message}
                  </div>
                </SwipeableBubble>

                {/* Status & Time */}
                <div
                  className={cn(
                    "flex items-center gap-2 mt-1 px-1",
                    isMe ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  <span className="text-[9px] text-textDim/60 font-medium">
                    {isTemp ? "Sending…" : formatTime(msg.created_at)}
                  </span>

                  {isMe && (
                    <div className="flex items-center">
                      <MessageStatusIndicator
                        status={
                          msg.status ||
                          (msg.id.startsWith("temp-") ? "sending" : "delivered")
                        }
                        onRetry={
                          isFailed
                            ? () => retryMessage(groupId, msg.id)
                            : undefined
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} className="h-4 shrink-0" />
      </div>

      {/* ── Fixed Input Area ─────────────────────────────── */}
      <div
        className={cn(
          "shrink-0 border-t bg-bgCard/95 backdrop-blur-sm z-20 pb-safe transition-colors duration-300",
          isOnline ? "border-borderMuted" : "border-danger/50 bg-danger/2",
        )}
      >
        {isMember ? (
          <div className="flex flex-col w-full p-2 md:p-3 gap-2">
            {replyTo && (
              <ReplyBanner reply={replyTo} onCancel={() => setReplyTo(null)} />
            )}

            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef as any}
                  rows={1}
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                    if (e.key === "Escape") setReplyTo(null);
                  }}
                  placeholder={
                    !isOnline
                      ? "Connection lost..."
                      : replyTo
                        ? `Reply to ${replyTo.author}…`
                        : "Type a message…"
                  }
                  disabled={!isOnline}
                  style={{ fontSize: "16px", minHeight: "40px" }}
                  className={cn(
                    "w-full px-3 md:px-4 py-2 md:py-3 bg-bgSurface border rounded-2xl text-sm text-textMain placeholder:text-textDim focus:outline-none focus:border-brand/50 transition-all resize-none custom-scrollbar",
                    isOnline
                      ? "border-borderMuted"
                      : "border-danger/30 opacity-60 cursor-not-allowed bg-danger/5",
                  )}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!text.trim() || !isOnline}
                className={cn(
                  "w-10 h-10 md:w-11 md:h-11 rounded-2xl flex items-center justify-center transition-all active:scale-90 shrink-0 shadow-lg",
                  isOnline
                    ? "bg-brand hover:bg-brand-light text-white shadow-brand/20"
                    : "bg-danger/20 text-danger/50 cursor-not-allowed shadow-none",
                )}
              >
                <Send className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            {!isOnline && (
              <div className="flex flex-col items-center gap-1.5 py-3 px-4 bg-danger/10 rounded-xl border border-danger/20 mt-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 text-danger">
                  <WifiOff className="w-4 h-4 animate-pulse" />
                  <span className="text-[11px] font-black uppercase tracking-widest">
                    No Active Connection
                  </span>
                </div>
                <p className="text-[10px] text-danger/90 text-center leading-tight font-bold">
                  You are currently offline. Please check your network.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-bgCard">
            <button
              onClick={() => joinGroup(groupId)}
              className="w-full py-3 bg-brand/10 border border-brand/20 text-brand-light rounded-xl text-sm font-bold hover:bg-brand/20 transition-all"
            >
              Join Group to Participate
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupChat;
