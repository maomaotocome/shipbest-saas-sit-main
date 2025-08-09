import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Message } from "ai";
import { useCopyToClipboard } from "usehooks-ts";

import type { Vote } from "@/db/generated/prisma";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import equal from "fast-deep-equal";
import { memo } from "react";
import { toast } from "react-hot-toast";
import { CopyIcon, ThumbDownIcon, ThumbUpIcon } from "./icons";

export function PureMessageActions({
  chatId,
  message,
  vote,
  isLoading,
}: {
  chatId: string;
  message: Message;
  vote: Vote | undefined;
  isLoading: boolean;
}) {
  const queryClient = useQueryClient();
  const [, copyToClipboard] = useCopyToClipboard();

  const voteMutation = useMutation({
    mutationFn: async (type: "up" | "down") => {
      const response = await fetch("/api/playground/vote", {
        method: "PATCH",
        body: JSON.stringify({
          chatId,
          messageId: message.id,
          type,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to vote");
      }
      return response.json();
    },
    onSuccess: (_, type) => {
      queryClient.setQueryData<Array<Vote>>(["votes", chatId], (currentVotes = []) => {
        const votesWithoutCurrent = currentVotes.filter((vote) => vote.messageId !== message.id);

        return [
          ...votesWithoutCurrent,
          {
            chatId,
            messageId: message.id,
            isUpvoted: type === "up",
          },
        ];
      });
      toast.success(type === "up" ? "Upvoted Response!" : "Downvoted Response!");
    },
    onError: () => {
      toast.error("Failed to vote response.");
    },
  });

  if (isLoading) return null;
  if (message.role === "user") return null;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-row gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="text-muted-foreground h-fit px-2 py-1"
              variant="outline"
              onClick={async () => {
                const textFromParts = message.parts
                  ?.filter((part) => part.type === "text")
                  .map((part) => part.text)
                  .join("\n")
                  .trim();

                if (!textFromParts) {
                  toast.error("There's no text to copy!");
                  return;
                }

                await copyToClipboard(textFromParts);
                toast.success("Copied to clipboard!");
              }}
            >
              <CopyIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              data-testid="message-upvote"
              className="text-muted-foreground !pointer-events-auto h-fit px-2 py-1"
              disabled={vote?.isUpvoted}
              variant="outline"
              onClick={() => voteMutation.mutate("up")}
            >
              <ThumbUpIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Upvote Response</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              data-testid="message-downvote"
              className="text-muted-foreground !pointer-events-auto h-fit px-2 py-1"
              variant="outline"
              disabled={vote && !vote.isUpvoted}
              onClick={() => voteMutation.mutate("down")}
            >
              <ThumbDownIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Downvote Response</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

export const MessageActions = memo(PureMessageActions, (prevProps, nextProps) => {
  if (!equal(prevProps.vote, nextProps.vote)) return false;
  if (prevProps.isLoading !== nextProps.isLoading) return false;

  return true;
});
