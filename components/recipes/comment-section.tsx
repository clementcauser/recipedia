"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CommentList } from "./comment-list";
import { CommentModal } from "./comment-modal";

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

interface CommentSectionProps {
  recipeId: string;
  comments: Comment[];
  totalCount: number;
}

export function CommentSection({
  recipeId,
  comments,
  totalCount,
}: CommentSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(
    null,
  );

  const handleOpenMainComment = () => {
    setReplyTo(null);
    setIsModalOpen(true);
  };

  const handleReply = (commentId: string, authorName: string) => {
    setReplyTo({ id: commentId, name: authorName });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setReplyTo(null);
  };

  return (
    <section className="mt-12 md:mt-16 bg-card border rounded-2xl p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground">Commentaires</h2>
          <p className="text-sm text-muted-foreground">
            {totalCount} {totalCount > 1 ? "commentaires" : "commentaire"} pour
            cette recette
          </p>
        </div>
        <Button onClick={handleOpenMainComment}>
          <Plus className="h-5 w-5 md:mr-2" />
          <span className="hidden md:inline">Ajouter</span>
        </Button>
      </div>

      {comments.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <div className="text-muted-foreground">
            Soyez le premier à commenter cette recette !
          </div>
          <Button variant="outline" onClick={handleOpenMainComment}>
            Écrire un commentaire
          </Button>
        </div>
      ) : (
        <CommentList comments={comments} onReply={handleReply} />
      )}

      {isModalOpen && (
        <CommentModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          recipeId={recipeId}
          parentId={replyTo?.id}
          parentName={replyTo?.name}
        />
      )}
    </section>
  );
}
