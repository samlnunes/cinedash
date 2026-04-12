import { useState, useRef, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { useAllProfiles } from "../hooks/use-feed";

interface MentionDropdownProps {
  query: string;
  show: boolean;
  selectedIndex: number;
  onSelect: (profile: { id: string; display_name: string }) => void;
}

function MentionDropdown({
  query,
  show,
  selectedIndex,
  onSelect,
}: MentionDropdownProps) {
  const { data: profiles } = useAllProfiles();

  const filtered = query
    ? (profiles ?? []).filter((p) =>
        p.display_name.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  if (!show || filtered.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-1 max-h-40 overflow-y-auto rounded-md border bg-popover p-1 shadow-md z-10">
      {filtered.slice(0, 6).map((p, i) => (
        <button
          key={p.id}
          className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm ${
            i === selectedIndex ? "bg-accent" : ""
          }`}
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(p);
          }}
        >
          <Avatar className="size-5">
            <AvatarImage src={p.avatar_url ?? undefined} />
            <AvatarFallback className="text-[8px]">
              {p.display_name[0]}
            </AvatarFallback>
          </Avatar>
          <span>{p.display_name}</span>
        </button>
      ))}
    </div>
  );
}

function useMentionLogic(
  value: string,
  onChange: (value: string) => void,
  onMention: (userId: string) => void,
  getCursor: () => number,
) {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { data: profiles } = useAllProfiles();

  const filtered = mentionQuery
    ? (profiles ?? []).filter((p) =>
        p.display_name.toLowerCase().includes(mentionQuery.toLowerCase()),
      )
    : [];

  const handleTextChange = useCallback(
    (val: string, cursor: number) => {
      onChange(val);
      const before = val.slice(0, cursor);
      const match = before.match(/@(\S*)$/);
      if (match) {
        setMentionQuery(match[1]);
        setShowMentions(true);
        setSelectedIndex(0);
      } else {
        setShowMentions(false);
      }
    },
    [onChange],
  );

  const insertMention = useCallback(
    (profile: { id: string; display_name: string }) => {
      const cursor = getCursor();
      const before = value.slice(0, cursor);
      const after = value.slice(cursor);
      const atIndex = before.lastIndexOf("@");
      const newValue =
        before.slice(0, atIndex) + `@${profile.display_name} ` + after;
      onChange(newValue);
      onMention(profile.id);
      setShowMentions(false);
    },
    [value, onChange, onMention, getCursor],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (showMentions && filtered.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((i) => (i + 1) % filtered.length);
          return true;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length);
          return true;
        }
        if (e.key === "Enter") {
          e.preventDefault();
          insertMention(filtered[selectedIndex]);
          return true;
        }
        if (e.key === "Escape") {
          setShowMentions(false);
          return true;
        }
      }
      return false;
    },
    [showMentions, filtered, selectedIndex, insertMention],
  );

  return {
    showMentions,
    mentionQuery,
    selectedIndex,
    handleTextChange,
    insertMention,
    handleKeyDown,
  };
}

export function MentionInput({
  value,
  onChange,
  onKeyDown,
  onMention,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onMention: (userId: string) => void;
  placeholder: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    showMentions,
    mentionQuery,
    selectedIndex,
    handleTextChange,
    insertMention,
    handleKeyDown,
  } = useMentionLogic(
    value,
    onChange,
    onMention,
    () => inputRef.current?.selectionStart ?? value.length,
  );

  return (
    <div className="relative flex-1">
      <MentionDropdown
        query={mentionQuery}
        show={showMentions}
        selectedIndex={selectedIndex}
        onSelect={(p) => {
          insertMention(p);
          inputRef.current?.focus();
        }}
      />
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={value}
        onChange={(e) =>
          handleTextChange(
            e.target.value,
            e.target.selectionStart ?? value.length,
          )
        }
        onKeyDown={(e) => {
          if (!handleKeyDown(e)) onKeyDown(e);
        }}
        onFocus={(e) =>
          setTimeout(
            () =>
              e.target.scrollIntoView({
                behavior: "smooth",
                block: "center",
              }),
            300,
          )
        }
        className="h-9 text-base sm:text-sm"
      />
    </div>
  );
}

export function MentionTextarea({
  value,
  onChange,
  onMention,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (value: string) => void;
  onMention: (userId: string) => void;
  placeholder: string;
  rows?: number;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    showMentions,
    mentionQuery,
    selectedIndex,
    handleTextChange,
    insertMention,
    handleKeyDown,
  } = useMentionLogic(
    value,
    onChange,
    onMention,
    () => textareaRef.current?.selectionStart ?? value.length,
  );

  return (
    <div className="relative">
      <MentionDropdown
        query={mentionQuery}
        show={showMentions}
        selectedIndex={selectedIndex}
        onSelect={(p) => {
          insertMention(p);
          textareaRef.current?.focus();
        }}
      />
      <Textarea
        ref={textareaRef}
        placeholder={placeholder}
        value={value}
        onChange={(e) =>
          handleTextChange(
            e.target.value,
            e.target.selectionStart ?? value.length,
          )
        }
        onKeyDown={(e) => handleKeyDown(e)}
        rows={rows}
      />
    </div>
  );
}
