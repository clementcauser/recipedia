"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquareReply } from "lucide-react";

interface CommentUser {
  id: string;
  displayName: string | null;
  image: string | null;
  firstName: string;
  lastName: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  user: CommentUser;
  replies?: Comment[];
}

interface CommentItemProps {
  comment: Comment;
  onReply: (commentId: string, authorName: string) => void;
  isReply?: boolean;
}

export function CommentItem({
  comment,
  onReply,
  isReply = false,
}: CommentItemProps) {
  const displayName =
    comment.user.displayName ||
    `${comment.user.firstName} ${comment.user.lastName}`;
  const initials = `${comment.user.firstName[0]}${comment.user.lastName[0]}`;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <div
      className={`flex gap-4 py-4 ${isReply ? "ml-8 md:ml-12 border-l pl-4 md:pl-6 border-muted" : ""}`}
    >
      <Avatar className="h-10 w-10 shrink-0 border mt-1">
        <AvatarImage src={comment.user.image || ""} alt={displayName} />
        <AvatarFallback className="bg-primary/10 text-primary font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-800">
              {displayName}
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">
              {formatDate(comment.createdAt)}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onReply(comment.id, displayName)}
          >
            <MessageSquareReply className="h-3.5 w-3.5 mr-1.5" />
            Répondre
          </Button>
        </div>
        <div className="bg-slate-100/80 text-slate-700 text-sm leading-relaxed px-4 py-3 rounded-2xl rounded-tl-none inline-block max-w-[90%] whitespace-pre-wrap">
          {comment.content}
        </div>
      </div>
    </div>
  );
}
