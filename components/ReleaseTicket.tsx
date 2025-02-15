"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { XCircle } from "lucide-react";
import { useState } from "react";

const ReleaseTicket = ({
  eventId,
  waitingListId,
}: {
  eventId: Id<"events">;
  waitingListId: Id<"waitingList">;
}) => {
  const [isReleasing, setIsReleasing] = useState(false);
  const releaseTicket = useMutation(api.waitingList.releaseTicket);

  const handleRelease = async () => {
    if (!confirm("Are you sure you want to release this ticket?")) return;

    try {
      setIsReleasing(true);
      await releaseTicket({ eventId, waitingListId });
    } catch (e) {
      console.error(e);
    } finally {
      setIsReleasing(false);
    }
  };

  return (
    <button
      className="mt-2 w-full flex items-center justify-center gap-2 py-2 px-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition disabled:opacity-50 disabeld:cursor-not-allowed"
      onClick={handleRelease}
      disabled={isReleasing}
    >
      <XCircle className="size-4" />
      {isReleasing ? "Releasing..." : "Release Ticket Offer"}
    </button>
  );
};

export default ReleaseTicket;
