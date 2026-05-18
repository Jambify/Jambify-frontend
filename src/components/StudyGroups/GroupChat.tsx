import React, { useState, useRef, useEffect } from "react";
import { useGroupStore } from "../../Store/useGroupStore";
import { useUserStore } from "../../Store/UseUserStore";
import type { StudyGroup } from "../../Store/useGroupStore";
import { cn } from "../../lib/utils";
import {
  ArrowLeft,
  Send,
  Users,
  Copy,
  Check,
  Loader2,
  Wifi,
  WifiOff,
} from "lucide-react";

interface Props {
  group: StudyGroup;
  onBack: () => void;
}

const GroupChat: React.FC<Props> = ({ group, onBack }) => {
  const { id: myId, name } = useUserStore();
  const {
    myGroupIds,
    loadMessages,
    sendMessage,
    subscribeToChat,
    getMessages,
    msgLoading,
    joinGroup,
  } = useGroupStore();

  const messages = getMessages(group.id);
  const isMember = myGroupIds.includes(group.id);

  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages(group.id);
  }, [group.id, loadMessages]);

  // USE THE STORE'S subscribeToChat INSTEAD OF DIRECT supabase.channel
  useEffect(() => {
    const unsubscribe = subscribeToChat(group.id);

    // Note: If your store's subscribeToChat doesn't return connection status,
    // you might need to add that. For now, just set connected to true.
    setConnected(true);

    return () => {
      if (unsubscribe) unsubscribe();
      setConnected(false);
    };
  }, [group.id, subscribeToChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = () => {
    if (!text.trim() || !isMember) return;
    sendMessage(group.id, text);
    setText("");
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="flex flex-col h-[calc(100dvh-112px)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 mb-4 border-b border-borderMuted shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-textMuted hover:text-textMain transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="text-xl">{group.icon}</div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold text-sm tracking-tight truncate">
            {group.name}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-textDim">
            <Users className="w-3 h-3" />
            <span>{group.member_count}</span>
            <span>·</span>
            <span>{group.subject}</span>
            <span>·</span>
            <span
              className={cn(
                "flex items-center gap-1",
                connected ? "text-success" : "text-textDim",
              )}
            >
              {connected ? (
                <>
                  <Wifi className="w-3 h-3" /> Live
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3" /> Connecting…
                </>
              )}
            </span>
          </div>
        </div>

        {isMember && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(group.join_code);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            title={`Join code: ${group.join_code}`}
            className="flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-1.5 bg-bgSurface border border-borderMuted rounded-brand hover:border-brand/40 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-success" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" /> {group.join_code}
              </>
            )}
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-4">
        {msgLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 text-brand animate-spin" />
          </div>
        )}
        {!msgLoading && messages.length === 0 && (
          <div className="text-center py-10 text-textDim">
            <div className="text-3xl mb-2">💬</div>
            <p className="text-xs">No messages yet. Start the conversation!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.user_id === myId;
          const isTemp = msg.id.startsWith("temp-");
          return (
            <div
              key={msg.id}
              className={cn(
                "flex gap-2.5 max-w-[80%]",
                isMe && "ml-auto flex-row-reverse",
              )}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                style={{
                  background: isMe ? "rgb(91,59,255)" : "rgb(30,30,39)",
                  color: isMe ? "#fff" : "rgb(152,150,176)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {(isMe ? name || "Y" : msg.author).slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p
                  className={cn(
                    "text-[11px] mb-1",
                    isMe ? "text-right text-textDim" : "text-textDim",
                  )}
                >
                  {isMe ? "You" : msg.author}
                  <span className="ml-1.5 text-[10px] opacity-60">
                    {isTemp ? "Sending…" : formatTime(msg.created_at)}
                  </span>
                </p>
                <div
                  className={cn(
                    "px-3 py-2 rounded-brand text-sm leading-relaxed",
                    isMe
                      ? "bg-brand text-white rounded-tr-sm"
                      : "bg-bgSurface border border-borderMuted text-textMain rounded-tl-sm",
                    isTemp && "opacity-60",
                  )}
                >
                  {msg.message}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {isMember ? (
        <div className="flex gap-2 pt-3 border-t border-borderMuted shrink-0">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message…"
            style={{ fontSize: "16px" }}
            className="flex-1 px-4 py-2.5 bg-bgSurface border border-borderMuted rounded-brand text-sm text-textMain placeholder:text-textDim focus:outline-none focus:border-brand/40 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="px-4 py-2.5 bg-brand hover:bg-brand-light disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-brand text-sm font-medium transition-all active:scale-[0.97]"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="pt-3 border-t border-borderMuted shrink-0">
          <div className="flex items-center justify-between p-3 bg-bgSurface rounded-brand border border-borderMuted">
            <p className="text-xs text-textMuted">
              Join this group to send messages
            </p>
            <button
              onClick={() => joinGroup(group.id)}
              className="text-xs font-medium text-brand-light hover:underline"
            >
              Join now →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupChat;
