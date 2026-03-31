"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2 } from "lucide-react";
import { format } from "date-fns";

interface FacebookPostButtonProps {
  bookingId: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  unitName: string;
}

export default function FacebookPostButton({ bookingId, checkIn, checkOut, unitName }: FacebookPostButtonProps) {
  const defaultMessage = `New booking confirmed!\n\nUnit: ${unitName}\nCheck-in: ${format(new Date(checkIn), "MMM d, yyyy")}\nCheck-out: ${format(new Date(checkOut), "MMM d, yyyy")}\n\nThank you for choosing Bitara Residence! 🏠`;

  const [message, setMessage] = useState(defaultMessage);
  const [posting, setPosting] = useState(false);

  async function handlePost() {
    setPosting(true);
    try {
      const res = await fetch("/api/facebook/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, message, postType: "new_booking" }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error ?? "Failed to post to Facebook");
        return;
      }

      toast.success("Posted to Facebook successfully");
    } catch {
      toast.error("Failed to post to Facebook");
    } finally {
      setPosting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Share2 className="h-4 w-4" /> Post to Facebook
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea rows={6} value={message} onChange={(e) => setMessage(e.target.value)} />
        <Button onClick={handlePost} disabled={posting} size="sm">
          <Share2 className="h-4 w-4 mr-1" />
          {posting ? "Posting…" : "Post to Facebook"}
        </Button>
      </CardContent>
    </Card>
  );
}
