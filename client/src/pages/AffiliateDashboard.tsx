import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DollarSign, MousePointerClick, TrendingUp, Wallet, Copy, CheckCircle2,
  BarChart3, ExternalLink, ArrowRight, Share2, Mail, FileText, Loader2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import SiteFooter from "@/components/SiteFooter";

const AFFILIATE_CODE_KEY = "ebp_affiliate_code";

export default function AffiliateDashboard() {
  const [, navigate] = useLocation();
  const [affiliateCode, setAffiliateCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "marketing" | "conversions" | "payouts">("overview");

  useEffect(() => {
    const saved = localStorage.getItem(AFFILIATE_CODE_KEY);
    if (saved) setAffiliateCode(saved);
  }, []);

  const dashboardQuery = trpc.affiliate.getDashboard.useQuery(
    { affiliateCode },
    { enabled: !!affiliateCode }
  );

  const marketingQuery = trpc.affiliate.getMarketingAssets.useQuery(
    { affiliateCode },
    { enabled: !!affiliateCode && activeTab === "marketing" }
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      setAffiliateCode(inputCode.trim());
      localStorage.setItem(AFFILIATE_CODE_KEY, inputCode.trim());
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    setAffiliateCode("");
    localStorage.removeItem(AFFILIATE_CODE_KEY);
  };

  if (!affiliateCode) {
    return (
      <div className="min-h-screen bg-[#faf6ef]">
        <nav className="sticky top-0 z-50 bg-[#1a1008]/90 backdrop-blur-sm border-b border-[#c9a96e]/15">
          <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
            <button onClick={() => navigate("/")} className="flex items-center gap-2.5">
              <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663211654017/kGjPju6hKCvCsjZhgUHyqj/CDPlargelogo_25428631.PNG" alt="Easy Book Publishers" className="h-10 w-auto object-contain" />
              <span className="font-serif text-[#f5d98a] text-lg md:text-xl tracking-wide hidden sm:block">Easy Book Publishers</span>
            </button>
          </div>
        </nav>
        <div className="max-w-md mx-auto px-6 py-24">
          <div className="text-center mb-8">
            <BarChart3 className="w-12 h-12 text-[#c9a96e] mx-auto mb-4" />
            <h1 className="font-serif text-3xl text-[#1a1008] mb-2">Affiliate Dashboard</h1>
            <p className="text-[#5c4a2a]/70">Enter your affiliate code to access your dashboard</p>
          </div>
          <Card className="bg-white border-[#c9a96e]/15">
            <CardContent className="p-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <Input value={inputCode} onChange={(e) => setInputCode(e.target.value)} placeholder="Your affiliate code" required className="bg-[#faf6ef] border-[#c9a96e]/30" />
                <Button type="submit" className="w-full bg-[#c9a96e] hover:bg-[#b8944f] text-[#1a1008] font-semibold">
                  Access Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
              <p className="text-xs text-[#5c4a2a]/50 text-center mt-4">
                Don't have an affiliate code? <a href="/affiliates" className="text-[#8b6914] underline">Apply here</a>
              </p>
            </CardContent>
          </Card>
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (dashboardQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[#faf6ef] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#c9a96e]" />
      </div>
    );
  }

  if (dashboardQuery.error) {
    return (
      <div className="min-h-screen bg-[#faf6ef]">
        <nav className="sticky top-0 z-50 bg-[#1a1008]/90 backdrop-blur-sm border-b border-[#c9a96e]/15">
          <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
            <button onClick={() => navigate("/")} className="flex items-center gap-2.5">
              <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663211654017/kGjPju6hKCvCsjZhgUHyqj/CDPlargelogo_25428631.PNG" alt="Easy Book Publishers" className="h-10 w-auto object-contain" />
              <span className="font-serif text-[#f5d98a] text-lg md:text-xl tracking-wide hidden sm:block">Easy Book Publishers</span>
            </button>
          </div>
        </nav>
        <div className="max-w-md mx-auto px-6 py-24 text-center">
          <h1 className="font-serif text-2xl text-[#1a1008] mb-4">Affiliate Not Found</h1>
          <p className="text-[#5c4a2a]/70 mb-6">The affiliate code you entered was not found.</p>
          <Button onClick={handleLogout} className="bg-[#c9a96e] hover:bg-[#b8944f] text-[#1a1008]">Try Another Code</Button>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const data = dashboardQuery.data;
  if (!data) return null;

  const { affiliate, stats, conversions, payouts } = data;
  const refLink = `https://easybookpublishers.replit.app/?ref=${affiliate.affiliateCode}`;
  const conversionRate = affiliate.totalClicks > 0
    ? ((affiliate.totalConversions / affiliate.totalClicks) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen bg-[#faf6ef]">
      <nav className="sticky top-0 z-50 bg-[#1a1008]/90 backdrop-blur-sm border-b border-[#c9a96e]/15">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5">
            <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663211654017/kGjPju6hKCvCsjZhgUHyqj/CDPlargelogo_25428631.PNG" alt="Easy Book Publishers" className="h-10 w-auto object-contain" />
            <span className="font-serif text-[#f5d98a] text-lg md:text-xl tracking-wide hidden sm:block">Easy Book Publishers</span>
          </button>
          <div className="flex items-center gap-3">
            <Badge className="bg-[#c9a96e]/10 text-[#8b6914] border-[#c9a96e]/30">{affiliate.status}</Badge>
            <Button onClick={handleLogout} variant="outline" size="sm" className="border-[#c9a96e]/30 text-[#f5d98a] hover:bg-[#c9a96e]/10">
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl text-[#1a1008]">Welcome, {affiliate.name}</h1>
            <p className="text-[#5c4a2a]/70">Commission rate: {affiliate.commissionRate}% per sale</p>
          </div>
          <div className="flex items-center gap-2 bg-white border border-[#c9a96e]/20 rounded-lg px-3 py-2">
            <span className="text-xs text-[#5c4a2a]/50">Your link:</span>
            <code className="text-xs text-[#1a1008] font-mono max-w-[200px] truncate">{refLink}</code>
            <Button onClick={() => handleCopy(refLink)} variant="ghost" size="sm" className="h-7 w-7 p-0">
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-[#c9a96e]" />}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-white border-[#c9a96e]/15">
            <CardContent className="p-4 text-center">
              <MousePointerClick className="w-5 h-5 text-[#c9a96e] mx-auto mb-1" />
              <div className="font-serif text-2xl text-[#1a1008] font-bold">{affiliate.totalClicks}</div>
              <div className="text-xs text-[#5c4a2a]/60">Total Clicks</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-[#c9a96e]/15">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-5 h-5 text-[#c9a96e] mx-auto mb-1" />
              <div className="font-serif text-2xl text-[#1a1008] font-bold">{affiliate.totalConversions}</div>
              <div className="text-xs text-[#5c4a2a]/60">Conversions</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-[#c9a96e]/15">
            <CardContent className="p-4 text-center">
              <BarChart3 className="w-5 h-5 text-[#c9a96e] mx-auto mb-1" />
              <div className="font-serif text-2xl text-[#1a1008] font-bold">{conversionRate}%</div>
              <div className="text-xs text-[#5c4a2a]/60">Conv. Rate</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-[#c9a96e]/15">
            <CardContent className="p-4 text-center">
              <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <div className="font-serif text-2xl text-[#1a1008] font-bold">${affiliate.totalEarnings}</div>
              <div className="text-xs text-[#5c4a2a]/60">Total Earned</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-[#c9a96e]/15">
            <CardContent className="p-4 text-center">
              <Wallet className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <div className="font-serif text-2xl text-[#1a1008] font-bold">${affiliate.pendingEarnings}</div>
              <div className="text-xs text-[#5c4a2a]/60">Pending</div>
            </CardContent>
          </Card>
        </div>

        {stats?.last30Days && (
          <div className="bg-[#c9a96e]/5 border border-[#c9a96e]/15 rounded-xl p-4 mb-8">
            <h3 className="text-sm font-semibold text-[#3a2a14] mb-2">Last 30 Days</h3>
            <div className="flex flex-wrap gap-6 text-sm text-[#5c4a2a]">
              <span><strong>{stats.last30Days.clicks}</strong> clicks</span>
              <span><strong>{stats.last30Days.conversions}</strong> conversions</span>
              <span><strong>${stats.last30Days.earnings}</strong> earned</span>
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-6 border-b border-[#c9a96e]/15 pb-2">
          {(["overview", "marketing", "conversions", "payouts"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab
                  ? "bg-white text-[#1a1008] border border-[#c9a96e]/20 border-b-white -mb-[1px]"
                  : "text-[#5c4a2a]/60 hover:text-[#1a1008]"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            <Card className="bg-white border-[#c9a96e]/15">
              <CardHeader>
                <CardTitle className="font-serif text-lg">Your Referral Link</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input value={refLink} readOnly className="font-mono text-sm bg-[#faf6ef]" />
                  <Button onClick={() => handleCopy(refLink)} className="bg-[#c9a96e] hover:bg-[#b8944f] text-[#1a1008] shrink-0">
                    <Copy className="w-4 h-4 mr-1" /> Copy
                  </Button>
                </div>
                <p className="text-xs text-[#5c4a2a]/50">Share this link on your blog, social media, or email. Anyone who clicks and purchases within 90 days earns you a commission.</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#c9a96e]/15">
              <CardHeader>
                <CardTitle className="font-serif text-lg">Quick Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { label: "Pricing Page", url: `https://easybookpublishers.replit.app/pricing?ref=${affiliate.affiliateCode}` },
                    { label: "Templates", url: `https://easybookpublishers.replit.app/templates?ref=${affiliate.affiliateCode}` },
                    { label: "Auto-Produce", url: `https://easybookpublishers.replit.app/auto-produce/0?ref=${affiliate.affiliateCode}` },
                    { label: "Bible Studio", url: `https://easybookpublishers.replit.app/bible-studio?ref=${affiliate.affiliateCode}` },
                  ].map((link) => (
                    <div key={link.label} className="flex items-center justify-between bg-[#faf6ef] rounded-lg px-3 py-2">
                      <span className="text-sm text-[#3a2a14]">{link.label}</span>
                      <div className="flex gap-1">
                        <Button onClick={() => handleCopy(link.url)} variant="ghost" size="sm" className="h-7 px-2">
                          <Copy className="w-3 h-3" />
                        </Button>
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm" className="h-7 px-2">
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "marketing" && marketingQuery.data && (
          <div className="space-y-6">
            <Card className="bg-white border-[#c9a96e]/15">
              <CardHeader>
                <CardTitle className="font-serif text-lg flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-[#c9a96e]" /> Social Media Copy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {marketingQuery.data.socialCopy.map((copy, i) => (
                  <div key={i} className="bg-[#faf6ef] rounded-lg p-3 flex items-start gap-2">
                    <p className="text-sm text-[#3a2a14] flex-1">{copy}</p>
                    <Button onClick={() => handleCopy(copy)} variant="ghost" size="sm" className="shrink-0">
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white border-[#c9a96e]/15">
              <CardHeader>
                <CardTitle className="font-serif text-lg flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#c9a96e]" /> Email Template
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-[#faf6ef] rounded-lg p-4 relative">
                  <pre className="text-sm text-[#3a2a14] whitespace-pre-wrap font-sans">{marketingQuery.data.emailTemplate}</pre>
                  <Button onClick={() => handleCopy(marketingQuery.data!.emailTemplate)} variant="ghost" size="sm" className="absolute top-2 right-2">
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#c9a96e]/15">
              <CardHeader>
                <CardTitle className="font-serif text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#c9a96e]" /> Text Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {marketingQuery.data.textLinks.map((link) => (
                  <div key={link.label} className="flex items-center justify-between bg-[#faf6ef] rounded-lg px-3 py-2">
                    <div>
                      <span className="text-sm font-medium text-[#3a2a14]">{link.label}</span>
                      <span className="text-xs text-[#5c4a2a]/50 ml-2 font-mono">{link.url}</span>
                    </div>
                    <Button onClick={() => handleCopy(link.url)} variant="ghost" size="sm"><Copy className="w-3.5 h-3.5" /></Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white border-[#c9a96e]/15">
              <CardHeader>
                <CardTitle className="font-serif text-lg">Banner Sizes Available</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {marketingQuery.data.bannerSizes.map((banner) => (
                    <div key={banner.size} className="bg-[#faf6ef] rounded-lg p-3 text-center">
                      <div className="text-sm font-mono text-[#1a1008]">{banner.size}</div>
                      <div className="text-xs text-[#5c4a2a]/50">{banner.label}</div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#5c4a2a]/50 mt-3">Banner images coming soon. Contact us if you need custom creative assets.</p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "conversions" && (
          <Card className="bg-white border-[#c9a96e]/15">
            <CardHeader>
              <CardTitle className="font-serif text-lg">Conversion History</CardTitle>
            </CardHeader>
            <CardContent>
              {conversions && conversions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#c9a96e]/15 text-left">
                        <th className="pb-2 text-[#5c4a2a]/60 font-medium">Date</th>
                        <th className="pb-2 text-[#5c4a2a]/60 font-medium">Plan</th>
                        <th className="pb-2 text-[#5c4a2a]/60 font-medium">Sale</th>
                        <th className="pb-2 text-[#5c4a2a]/60 font-medium">Commission</th>
                        <th className="pb-2 text-[#5c4a2a]/60 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {conversions.map((conv: any) => (
                        <tr key={conv.id} className="border-b border-[#c9a96e]/10">
                          <td className="py-2 text-[#3a2a14]">{new Date(conv.createdAt).toLocaleDateString()}</td>
                          <td className="py-2 text-[#3a2a14]">{conv.planName}</td>
                          <td className="py-2 text-[#3a2a14]">${conv.saleAmount}</td>
                          <td className="py-2 text-green-700 font-medium">${conv.commissionAmount}</td>
                          <td className="py-2">
                            <Badge variant="outline" className={conv.status === "paid" ? "text-green-700 border-green-300" : conv.status === "approved" ? "text-blue-700 border-blue-300" : "text-amber-700 border-amber-300"}>
                              {conv.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-[#5c4a2a]/50">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>No conversions yet. Share your referral link to start earning!</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "payouts" && (
          <Card className="bg-white border-[#c9a96e]/15">
            <CardHeader>
              <CardTitle className="font-serif text-lg">Payout History</CardTitle>
            </CardHeader>
            <CardContent>
              {payouts && payouts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#c9a96e]/15 text-left">
                        <th className="pb-2 text-[#5c4a2a]/60 font-medium">Date</th>
                        <th className="pb-2 text-[#5c4a2a]/60 font-medium">Amount</th>
                        <th className="pb-2 text-[#5c4a2a]/60 font-medium">PayPal</th>
                        <th className="pb-2 text-[#5c4a2a]/60 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payouts.map((p: any) => (
                        <tr key={p.id} className="border-b border-[#c9a96e]/10">
                          <td className="py-2 text-[#3a2a14]">{new Date(p.createdAt).toLocaleDateString()}</td>
                          <td className="py-2 text-[#3a2a14] font-medium">${p.amount}</td>
                          <td className="py-2 text-[#5c4a2a]/70">{p.paypalEmail}</td>
                          <td className="py-2">
                            <Badge variant="outline" className={p.status === "completed" ? "text-green-700 border-green-300" : "text-amber-700 border-amber-300"}>
                              {p.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-[#5c4a2a]/50">
                  <Wallet className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>No payouts yet. Payouts are processed monthly once you reach the $50 minimum.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
