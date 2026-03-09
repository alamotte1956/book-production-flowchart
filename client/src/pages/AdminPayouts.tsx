import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Shield, DollarSign, Users, Mail, ExternalLink, Check, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import SiteFooter from "@/components/SiteFooter";

export default function AdminPayouts() {
  const [, navigate] = useLocation();
  const { data: affiliates, isLoading, refetch } = trpc.admin.getAffiliatePayouts.useQuery();
  const recordPayout = trpc.admin.recordPayout.useMutation();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [payingId, setPayingId] = useState<number | null>(null);

  const handleMarkPaid = async (aff: NonNullable<typeof affiliates>[0]) => {
    if (!aff.paypalEmail) {
      toast.error("This affiliate has no PayPal email on file.");
      return;
    }
    setPayingId(aff.id);
    try {
      const result = await recordPayout.mutateAsync({ affiliateId: aff.id });
      toast.success(`Payout of $${result.amount} recorded for ${aff.name}`);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to record payout");
    } finally {
      setPayingId(null);
    }
  };

  const totalPending = affiliates?.reduce((sum, a) => sum + parseFloat(a.pendingEarnings || "0"), 0) ?? 0;
  const totalEarnings = affiliates?.reduce((sum, a) => sum + parseFloat(a.totalEarnings || "0"), 0) ?? 0;
  const affiliatesWithPending = affiliates?.filter(a => parseFloat(a.pendingEarnings || "0") > 0) ?? [];

  return (
    <div className="min-h-screen bg-[#f3efe6]">
      <nav className="sticky top-0 z-50 bg-[#1a1008]/90 backdrop-blur-sm border-b border-[#c9a96e]/15">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2.5">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663211654017/kGjPju6hKCvCsjZhgUHyqj/CDPlargelogo_25428631.PNG"
              alt="Easy Book Publishers"
              className="h-10 w-auto object-contain"
            />
            <span className="font-serif text-[#f5d98a] text-lg md:text-xl tracking-wide hidden sm:block">Easy Book Publishers</span>
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#c9a96e]" />
            <span className="text-[#c9a96e] font-semibold text-sm">Admin</span>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-[#1a1008] mb-2">Affiliate Payouts</h1>
          <p className="text-[#5c4a2a]">Review pending earnings and record PayPal payments.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/80 border border-[#c9a96e]/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-[#c9a96e]" />
              <span className="text-[#7a6e60] text-sm">Total Affiliates</span>
            </div>
            <p className="font-serif text-2xl text-[#1a1008]">{affiliates?.length ?? 0}</p>
          </div>
          <div className="bg-white/80 border border-[#c9a96e]/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-amber-600" />
              <span className="text-[#7a6e60] text-sm">Total Pending</span>
            </div>
            <p className="font-serif text-2xl text-amber-700">${totalPending.toFixed(2)}</p>
          </div>
          <div className="bg-white/80 border border-[#c9a96e]/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-[#7a6e60] text-sm">Total All-Time Earnings</span>
            </div>
            <p className="font-serif text-2xl text-green-700">${totalEarnings.toFixed(2)}</p>
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#c9a96e] mx-auto mb-3" />
            <p className="text-[#7a6e60]">Loading affiliates...</p>
          </div>
        )}

        {!isLoading && affiliatesWithPending.length > 0 && (
          <div className="mb-8">
            <h2 className="font-serif text-xl text-[#1a1008] mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-600" />
              Affiliates with Pending Payouts
            </h2>
            <div className="space-y-3">
              {affiliatesWithPending.map(aff => {
                const expanded = expandedId === aff.id;
                const pending = parseFloat(aff.pendingEarnings || "0");
                const meetsThreshold = pending >= 50;
                return (
                  <div key={aff.id} className="bg-white border border-[#c9a96e]/20 rounded-xl overflow-hidden">
                    <div
                      className="flex items-center justify-between p-5 cursor-pointer hover:bg-[#f3efe6]/50 transition-colors"
                      onClick={() => setExpandedId(expanded ? null : aff.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-semibold text-[#1a1008]">{aff.name}</span>
                          <span className="text-xs bg-[#c9a96e]/10 text-[#5c4a2a] px-2 py-0.5 rounded-full">{aff.affiliateCode}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-[#7a6e60]">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" />
                            {aff.email}
                          </span>
                          <span>{aff.totalClicks} clicks</span>
                          <span>{aff.totalConversions} conversions</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-amber-700 text-lg">${pending.toFixed(2)}</p>
                          <p className="text-xs text-[#7a6e60]">pending</p>
                        </div>
                        {expanded ? <ChevronUp className="w-5 h-5 text-[#7a6e60]" /> : <ChevronDown className="w-5 h-5 text-[#7a6e60]" />}
                      </div>
                    </div>
                    {expanded && (
                      <div className="border-t border-[#c9a96e]/10 p-5 bg-[#faf8f3]">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-[#7a6e60] mb-1">PayPal Email</p>
                            <p className="text-[#1a1008] font-mono text-sm">
                              {aff.paypalEmail || <span className="text-red-500 italic">Not provided</span>}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[#7a6e60] mb-1">Contact Email</p>
                            <p className="text-[#1a1008] font-mono text-sm">{aff.email}</p>
                          </div>
                        </div>

                        {aff.pendingConversions.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs text-[#7a6e60] mb-2">Pending Conversions ({aff.pendingConversions.length})</p>
                            <div className="bg-white rounded-lg border border-[#e8dfd0] overflow-hidden">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="bg-[#f3efe6]">
                                    <th className="text-left py-2 px-3 text-[#5c4a2a] font-medium">Date</th>
                                    <th className="text-left py-2 px-3 text-[#5c4a2a] font-medium">Plan</th>
                                    <th className="text-right py-2 px-3 text-[#5c4a2a] font-medium">Sale</th>
                                    <th className="text-right py-2 px-3 text-[#5c4a2a] font-medium">Commission</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {aff.pendingConversions.map(c => (
                                    <tr key={c.id} className="border-t border-[#e8dfd0]">
                                      <td className="py-2 px-3 text-[#3a2a14]">{new Date(c.createdAt).toLocaleDateString()}</td>
                                      <td className="py-2 px-3 text-[#3a2a14]">{c.planName}</td>
                                      <td className="py-2 px-3 text-right text-[#3a2a14]">${c.saleAmount}</td>
                                      <td className="py-2 px-3 text-right font-medium text-amber-700">${c.commissionAmount}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {aff.recentPayouts.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs text-[#7a6e60] mb-2">Recent Payouts</p>
                            <div className="space-y-1">
                              {aff.recentPayouts.map(p => (
                                <div key={p.id} className="flex items-center justify-between text-sm bg-white rounded-lg border border-[#e8dfd0] px-3 py-2">
                                  <span className="text-[#3a2a14]">{p.processedAt ? new Date(p.processedAt).toLocaleDateString() : new Date(p.createdAt).toLocaleDateString()}</span>
                                  <span className="flex items-center gap-1 text-green-700 font-medium">
                                    <Check className="w-3.5 h-3.5" /> ${p.amount}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-3 pt-2 border-t border-[#c9a96e]/10">
                          {aff.paypalEmail && (
                            <a
                              href={`https://www.paypal.com/paypalme/${aff.paypalEmail}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-[#8b6914] hover:text-[#c9a96e] flex items-center gap-1"
                            >
                              Open PayPal <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <div className="flex-1" />
                          {!meetsThreshold && (
                            <span className="text-xs text-[#7a6e60]">Below $50 minimum threshold</span>
                          )}
                          <Button
                            onClick={() => handleMarkPaid(aff)}
                            disabled={payingId === aff.id || !aff.paypalEmail || !meetsThreshold}
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                            size="sm"
                          >
                            {payingId === aff.id ? (
                              <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Recording...</>
                            ) : (
                              <><Check className="w-4 h-4 mr-1" /> Mark as Paid — ${pending.toFixed(2)}</>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!isLoading && affiliates && affiliates.length > 0 && (
          <div>
            <h2 className="font-serif text-xl text-[#1a1008] mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#c9a96e]" />
              All Affiliates
            </h2>
            <div className="bg-white border border-[#c9a96e]/20 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f3efe6]">
                    <th className="text-left py-3 px-4 text-[#5c4a2a] font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-[#5c4a2a] font-medium hidden sm:table-cell">Email</th>
                    <th className="text-left py-3 px-4 text-[#5c4a2a] font-medium hidden md:table-cell">PayPal</th>
                    <th className="text-right py-3 px-4 text-[#5c4a2a] font-medium">Clicks</th>
                    <th className="text-right py-3 px-4 text-[#5c4a2a] font-medium">Sales</th>
                    <th className="text-right py-3 px-4 text-[#5c4a2a] font-medium">Earned</th>
                    <th className="text-right py-3 px-4 text-[#5c4a2a] font-medium">Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {affiliates.map(aff => (
                    <tr key={aff.id} className="border-t border-[#e8dfd0]">
                      <td className="py-3 px-4">
                        <span className="text-[#1a1008] font-medium">{aff.name}</span>
                        <span className="block text-xs text-[#7a6e60]">{aff.affiliateCode}</span>
                      </td>
                      <td className="py-3 px-4 text-[#3a2a14] hidden sm:table-cell">{aff.email}</td>
                      <td className="py-3 px-4 text-[#3a2a14] hidden md:table-cell font-mono text-xs">{aff.paypalEmail || "—"}</td>
                      <td className="py-3 px-4 text-right text-[#3a2a14]">{aff.totalClicks}</td>
                      <td className="py-3 px-4 text-right text-[#3a2a14]">{aff.totalConversions}</td>
                      <td className="py-3 px-4 text-right text-green-700 font-medium">${aff.totalEarnings}</td>
                      <td className="py-3 px-4 text-right text-amber-700 font-medium">${aff.pendingEarnings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!isLoading && affiliates?.length === 0 && (
          <div className="text-center py-16 bg-white/80 border border-[#c9a96e]/20 rounded-xl">
            <Users className="w-12 h-12 text-[#c9a96e]/40 mx-auto mb-3" />
            <p className="text-[#5c4a2a] font-serif text-xl mb-1">No affiliates yet</p>
            <p className="text-[#7a6e60] text-sm">Affiliate signups will appear here.</p>
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
