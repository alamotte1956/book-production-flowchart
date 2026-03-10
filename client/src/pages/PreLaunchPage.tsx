import { useState } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { BookOpen, Mail, Calendar, Tag, CheckCircle2, Loader2 } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";

export default function PreLaunchPage() {
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id || "0", 10);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const { data: book, isLoading } = trpc.preLaunch.getPublicBook.useQuery(
    { projectId },
    { enabled: projectId > 0 }
  );

  const subscribeMutation = trpc.preLaunch.subscribe.useMutation({
    onSuccess: () => {
      setSubscribed(true);
      toast.success("You'll be notified when this book launches!");
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f3efe6] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#c9a96e] animate-spin" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-[#f3efe6] flex items-center justify-center">
        <Card className="max-w-md w-full border-[#e8dfd0]">
          <CardContent className="p-8 text-center">
            <BookOpen className="w-12 h-12 text-[#c9a96e] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#1a1008] font-serif mb-2">Book Not Found</h2>
            <p className="text-sm text-[#7a6e60]">This book preview is not available or has not been made public yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3efe6]">
      <div className="bg-gradient-to-b from-[#1a1008] to-[#2c1a00] text-white">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-[#c9a96e] text-sm font-medium uppercase tracking-widest mb-6">Coming Soon</p>

          {book.coverImageUrl && (
            <div className="mb-8">
              <img
                src={book.coverImageUrl}
                alt={book.title}
                className="max-h-80 mx-auto rounded-lg shadow-2xl border-2 border-[#c9a96e]/30"
              />
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-bold font-serif text-[#f3efe6] mb-3">{book.title}</h1>
          {book.author && (
            <p className="text-lg text-[#c9a96e] font-serif mb-6">by {book.author}</p>
          )}

          <div className="flex items-center justify-center gap-4 flex-wrap mb-8">
            {book.genre && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c9a96e]/15 text-[#c9a96e] text-sm border border-[#c9a96e]/30">
                <Tag className="w-3 h-3" />
                {book.genre}
              </span>
            )}
            {book.publicationDate && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c9a96e]/15 text-[#c9a96e] text-sm border border-[#c9a96e]/30">
                <Calendar className="w-3 h-3" />
                {book.publicationDate}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-8">
        {book.blurb && (
          <Card className="border-[#e8dfd0] shadow-lg mb-8">
            <CardContent className="p-8">
              <h2 className="text-lg font-bold text-[#1a1008] font-serif mb-4">About This Book</h2>
              <p className="text-[#3d2b1f] leading-relaxed whitespace-pre-wrap">{book.blurb}</p>
            </CardContent>
          </Card>
        )}

        <Card className="border-[#c9a96e]/30 shadow-lg bg-gradient-to-br from-[#fdf9f3] to-white">
          <CardContent className="p-8 text-center">
            <Mail className="w-10 h-10 text-[#c9a96e] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#1a1008] font-serif mb-2">Get Notified on Launch Day</h2>
            <p className="text-sm text-[#7a6e60] mb-6">
              Be the first to know when this book is available. We'll send you one email — no spam.
            </p>

            {subscribed ? (
              <div className="flex items-center justify-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg p-4">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">You're on the list! We'll notify you at launch.</span>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (email.trim()) {
                    subscribeMutation.mutate({ projectId, email: email.trim() });
                  }
                }}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 rounded-lg border border-[#d4b896] bg-white px-4 py-3 text-sm text-[#3d2b1f] placeholder:text-[#b09880] focus:outline-none focus:ring-2 focus:ring-[#c9a96e] focus:border-transparent"
                />
                <Button
                  type="submit"
                  className="bg-[#c9a96e] hover:bg-[#b8944f] text-[#1a1008] font-semibold px-6"
                  disabled={subscribeMutation.isPending}
                >
                  {subscribeMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Notify Me"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center py-12">
          <p className="text-xs text-[#a09080]">
            Published with <span className="text-[#c9a96e] font-semibold">Easy Book Publishers</span>
          </p>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
