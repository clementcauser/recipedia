"use client";

import { CommentItem } from "./comment-item";

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

interface CommentListProps {
  comments: Comment[];
  onReply: (commentId: string, authorName: string) => void;
  isReply?: boolean;
}

export function CommentList({
  comments,
  onReply,
  isReply = false,
}: CommentListProps) {
  if (comments.length === 0) return null;

  return (
    <div className="flex flex-col">
      {comments.map((comment) => (
        <div key={comment.id} className="flex flex-col">
          <CommentItem comment={comment} onReply={onReply} isReply={isReply} />
          {comment.replies && comment.replies.length > 0 && (
            <CommentList
              comments={comment.replies}
              onReply={onReply}
              isReply={true}
            />
          )}
        </div>
      ))}
    </div>
  );
}
