import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DollarSign, TrendingUp, BarChart3, Calculator,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const CHANNELS = [
  {
    id: "kdp-35",
    name: "Amazon KDP (35%)",
    royaltyRate: 0.35,
    description: "Standard KDP royalty for books priced outside $2.99–$9.99 range or for expanded distribution.",
    fees: "Print cost deducted from royalty",
    group: "Amazon KDP",
  },
  {
    id: "kdp-70",
    name: "Amazon KDP (70%)",
    royaltyRate: 0.70,
    description: "Higher KDP royalty for eBooks priced $2.99–$9.99. Delivery costs apply.",
    fees: "Delivery cost (~$0.15) deducted",
    group: "Amazon KDP",
  },
  {
    id: "ingram-40",
    name: "IngramSpark (40% discount)",
    royaltyRate: 0.60,
    description: "IngramSpark with 40% wholesale discount. Lower retailer reach but higher per-book return.",
    fees: "Print cost + wholesale discount deducted",
    group: "IngramSpark",
  },
  {
    id: "ingram-55",
    name: "IngramSpark (55% discount)",
    royaltyRate: 0.45,
    description: "IngramSpark with 55% wholesale discount. Standard for wide bookstore distribution.",
    fees: "Print cost + wholesale discount deducted",
    group: "IngramSpark",
  },
  {
    id: "direct",
    name: "Direct Sales (100%)",
    royaltyRate: 1.0,
    description: "Selling directly through your own website or at events. You keep 100% after print cost.",
    fees: "Only print cost + payment processing (~3%)",
    group: "Direct",
  },
];

function estimatePrintCost(pageCount: number): number {
  if (pageCount <= 0) return 0;
  const fixedCost = 0.85;
  const perPageCost = 0.012;
  return Math.round((fixedCost + pageCount * perPageCost) * 100) / 100;
}

function calcRoyalty(
  retailPrice: number,
  printCost: number,
  channelId: string
): number {
  const channel = CHANNELS.find((c) => c.id === channelId);
  if (!channel || retailPrice <= 0) return 0;

  if (channelId === "kdp-70") {
    const deliveryCost = 0.15;
    return Math.max(0, retailPrice * channel.royaltyRate - printCost - deliveryCost);
  }
  if (channelId === "kdp-35") {
    return Math.max(0, retailPrice * channel.royaltyRate - printCost);
  }
  if (channelId.startsWith("ingram")) {
    return Math.max(0, retailPrice * channel.royaltyRate - printCost);
  }
  if (channelId === "direct") {
    const processingFee = retailPrice * 0.03;
    return Math.max(0, retailPrice - printCost - processingFee);
  }
  return 0;
}

function calcBreakEven(
  retailPrice: number,
  printCost: number,
  channelId: string,
  fixedCosts: number
): number {
  const royaltyPerUnit = calcRoyalty(retailPrice, printCost, channelId);
  if (royaltyPerUnit <= 0) return Infinity;
  return Math.ceil(fixedCosts / royaltyPerUnit);
}

export default function RoyaltyCalculator() {
  const [retailPrice, setRetailPrice] = useState<string>("19.99");
  const [printCostMode, setPrintCostMode] = useState<string>("manual");
  const [printCostInput, setPrintCostInput] = useState<string>("4.50");
  const [pageCount, setPageCount] = useState<string>("300");
  const [selectedChannel, setSelectedChannel] = useState<string>("kdp-70");
  const [fixedCosts, setFixedCosts] = useState<string>("500");
  const [priceSlider, setPriceSlider] = useState<number[]>([19.99]);

  const price = Number(retailPrice) || 0;
  const sliderPrice = priceSlider[0];
  const pages = Number(pageCount) || 0;
  const printCost =
    printCostMode === "auto" ? estimatePrintCost(pages) : Number(printCostInput) || 0;
  const fixed = Number(fixedCosts) || 0;

  const channel = CHANNELS.find((c) => c.id === selectedChannel)!;
  const royaltyPerBook = calcRoyalty(price, printCost, selectedChannel);
  const breakEvenUnits = calcBreakEven(price, printCost, selectedChannel, fixed);

  const comparisonTable = useMemo(() => {
    return CHANNELS.map((ch) => {
      const royalty = calcRoyalty(price, printCost, ch.id);
      const breakEven = calcBreakEven(price, printCost, ch.id, fixed);
      return {
        ...ch,
        royalty,
        breakEven,
      };
    });
  }, [price, printCost, fixed]);

  const sensitivityData = useMemo(() => {
    const points: { price: number; royalties: { channelId: string; name: string; royalty: number }[] }[] = [];
    const min = Math.max(1, sliderPrice - 10);
    const max = sliderPrice + 10;
    for (let p = min; p <= max; p += 1) {
      points.push({
        price: p,
        royalties: CHANNELS.map((ch) => ({
          channelId: ch.id,
          name: ch.name,
          royalty: calcRoyalty(p, printCost, ch.id),
        })),
      });
    }
    return points;
  }, [sliderPrice, printCost]);

  const maxRoyalty = useMemo(() => {
    let max = 1;
    sensitivityData.forEach((pt) =>
      pt.royalties.forEach((r) => {
        if (r.royalty > max) max = r.royalty;
      })
    );
    return max;
  }, [sensitivityData]);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Calculator className="w-6 h-6 text-burgundy" />
          <div>
            <h1 className="text-2xl font-serif font-bold text-walnut">
              Royalty Calculator
            </h1>
            <p className="text-sm text-walnut/60">
              Compare royalties across distribution channels and find your
              break-even point
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="border-[#e8dfd0] bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg text-[#2c1a00] flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#c9a96e] text-[#2a1a0a] flex items-center justify-center text-sm font-bold">
                    1
                  </span>
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-[#5c3d2e] font-semibold">
                    Retail Price ($)
                  </Label>
                  <Input
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(e.target.value)}
                    className="mt-1 border-[#d4c8b4]"
                    placeholder="e.g., 19.99"
                    type="number"
                    min={0}
                    step={0.01}
                  />
                </div>
                <div>
                  <Label className="text-[#5c3d2e] font-semibold">
                    Fixed Costs ($)
                  </Label>
                  <Input
                    value={fixedCosts}
                    onChange={(e) => setFixedCosts(e.target.value)}
                    className="mt-1 border-[#d4c8b4]"
                    placeholder="e.g., 500 (editing, cover design, etc.)"
                    type="number"
                    min={0}
                  />
                  <p className="text-xs text-[#7a6e60] mt-1">
                    Total upfront costs (editing, cover design, formatting, etc.)
                    used for break-even calculation.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#e8dfd0] bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg text-[#2c1a00] flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#c9a96e] text-[#2a1a0a] flex items-center justify-center text-sm font-bold">
                    2
                  </span>
                  Print Cost
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-[#5c3d2e] font-semibold">
                    Cost Mode
                  </Label>
                  <Select value={printCostMode} onValueChange={setPrintCostMode}>
                    <SelectTrigger className="mt-1 border-[#d4c8b4] bg-white text-[#3a2a1a]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Enter manually</SelectItem>
                      <SelectItem value="auto">
                        Auto-estimate from page count
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {printCostMode === "manual" ? (
                  <div>
                    <Label className="text-[#5c3d2e] font-semibold">
                      Print Cost per Book ($)
                    </Label>
                    <Input
                      value={printCostInput}
                      onChange={(e) => setPrintCostInput(e.target.value)}
                      className="mt-1 border-[#d4c8b4]"
                      placeholder="e.g., 4.50"
                      type="number"
                      min={0}
                      step={0.01}
                    />
                  </div>
                ) : (
                  <div>
                    <Label className="text-[#5c3d2e] font-semibold">
                      Page Count
                    </Label>
                    <Input
                      value={pageCount}
                      onChange={(e) => setPageCount(e.target.value)}
                      className="mt-1 border-[#d4c8b4]"
                      placeholder="e.g., 300"
                      type="number"
                      min={1}
                    />
                    <p className="text-xs text-[#7a6e60] mt-1">
                      Estimated print cost:{" "}
                      <span className="font-semibold text-[#2c1a00]">
                        ${estimatePrintCost(pages).toFixed(2)}
                      </span>{" "}
                      ($0.85 base + $0.012/page)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-[#e8dfd0] bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg text-[#2c1a00] flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#c9a96e] text-[#2a1a0a] flex items-center justify-center text-sm font-bold">
                    3
                  </span>
                  Distribution Channel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select
                  value={selectedChannel}
                  onValueChange={setSelectedChannel}
                >
                  <SelectTrigger className="border-[#d4c8b4] bg-white text-[#3a2a1a]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHANNELS.map((ch) => (
                      <SelectItem key={ch.id} value={ch.id}>
                        {ch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-[#7a6e60]">{channel.description}</p>
                <p className="text-xs text-[#7a6e60]">
                  <span className="font-semibold">Fees:</span> {channel.fees}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-[#c9a96e] bg-gradient-to-br from-[#fdf6ec] to-[#f5ead6] shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg text-[#2c1a00] flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#c9a96e]" />
                  Your Royalty
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-wide text-[#7a6e60] mb-1">
                      Per Book
                    </p>
                    <p className="text-3xl font-bold text-[#2c1a00]">
                      ${royaltyPerBook.toFixed(2)}
                    </p>
                    <p className="text-xs text-[#7a6e60] mt-1">
                      {price > 0
                        ? `${((royaltyPerBook / price) * 100).toFixed(1)}% of retail`
                        : "—"}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-wide text-[#7a6e60] mb-1">
                      Break-Even
                    </p>
                    <p className="text-3xl font-bold text-[#2c1a00]">
                      {breakEvenUnits === Infinity
                        ? "N/A"
                        : breakEvenUnits.toLocaleString()}
                    </p>
                    <p className="text-xs text-[#7a6e60] mt-1">
                      {breakEvenUnits === Infinity
                        ? "Royalty ≤ $0"
                        : `units to recoup $${fixed.toLocaleString()}`}
                    </p>
                  </div>
                </div>

                <Separator className="my-4 bg-[#c9a96e]/30" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#5c3d2e]">Retail Price</span>
                    <span className="font-semibold text-[#2c1a00]">
                      ${price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5c3d2e]">Print Cost</span>
                    <span className="font-semibold text-[#2c1a00]">
                      −${printCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5c3d2e]">Channel Cut</span>
                    <span className="font-semibold text-[#2c1a00]">
                      −$
                      {(price - printCost - royaltyPerBook > 0
                        ? price - printCost - royaltyPerBook
                        : 0
                      ).toFixed(2)}
                    </span>
                  </div>
                  <Separator className="bg-[#c9a96e]/30" />
                  <div className="flex justify-between font-bold">
                    <span className="text-[#2c1a00]">Your Royalty</span>
                    <span className="text-[#2c1a00]">
                      ${royaltyPerBook.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#e8dfd0] bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg text-[#2c1a00] flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#c9a96e]" />
                  Channel Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#e8dfd0]">
                        <th className="text-left py-2 pr-3 text-[#5c3d2e] font-semibold">
                          Channel
                        </th>
                        <th className="text-right py-2 px-3 text-[#5c3d2e] font-semibold">
                          Royalty
                        </th>
                        <th className="text-right py-2 pl-3 text-[#5c3d2e] font-semibold">
                          Break-Even
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonTable.map((row) => (
                        <tr
                          key={row.id}
                          className={`border-b border-[#f0e8dc] ${
                            row.id === selectedChannel
                              ? "bg-[#fdf6ec]"
                              : ""
                          }`}
                        >
                          <td className="py-2.5 pr-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[#2c1a00]">
                                {row.name}
                              </span>
                              {row.id === selectedChannel && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] border-[#c9a96e] text-[#c9a96e]"
                                >
                                  Selected
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td
                            className={`text-right py-2.5 px-3 font-semibold ${
                              row.royalty > 0
                                ? "text-green-700"
                                : "text-red-600"
                            }`}
                          >
                            ${row.royalty.toFixed(2)}
                          </td>
                          <td className="text-right py-2.5 pl-3 text-[#2c1a00]">
                            {row.breakEven === Infinity
                              ? "N/A"
                              : `${row.breakEven.toLocaleString()} units`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#e8dfd0] bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg text-[#2c1a00] flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#c9a96e]" />
                  Price Sensitivity Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-[#5c3d2e] font-semibold">
                    Slide to explore prices: ${sliderPrice.toFixed(2)}
                  </Label>
                  <Slider
                    value={priceSlider}
                    onValueChange={setPriceSlider}
                    min={1}
                    max={99.99}
                    step={0.5}
                    className="mt-3"
                  />
                  <div className="flex justify-between text-xs text-[#7a6e60] mt-1">
                    <span>$1.00</span>
                    <span>$99.99</span>
                  </div>
                </div>

                <div className="space-y-1">
                  {sensitivityData.map((pt) => (
                    <div key={pt.price} className="flex items-center gap-2">
                      <span className="text-xs text-[#5c3d2e] w-12 text-right shrink-0">
                        ${pt.price}
                      </span>
                      <div className="flex-1 flex gap-0.5 items-end h-6">
                        {pt.royalties.map((r) => {
                          const width =
                            maxRoyalty > 0
                              ? Math.max(0, (r.royalty / maxRoyalty) * 100)
                              : 0;
                          const colors: Record<string, string> = {
                            "kdp-35": "bg-orange-400",
                            "kdp-70": "bg-orange-600",
                            "ingram-40": "bg-blue-400",
                            "ingram-55": "bg-blue-600",
                            direct: "bg-green-600",
                          };
                          return (
                            <div
                              key={r.channelId}
                              className={`h-4 rounded-sm ${
                                colors[r.channelId] || "bg-gray-400"
                              }`}
                              style={{ width: `${width}%`, minWidth: width > 0 ? "2px" : "0" }}
                              title={`${r.name}: $${r.royalty.toFixed(2)}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 mt-2">
                  {[
                    { label: "KDP 35%", color: "bg-orange-400" },
                    { label: "KDP 70%", color: "bg-orange-600" },
                    { label: "Ingram 40%", color: "bg-blue-400" },
                    { label: "Ingram 55%", color: "bg-blue-600" },
                    { label: "Direct", color: "bg-green-600" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5">
                      <div
                        className={`w-3 h-3 rounded-sm ${item.color}`}
                      />
                      <span className="text-xs text-[#5c3d2e]">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
