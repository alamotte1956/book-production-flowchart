import { useLocation } from "wouter";
import { Shield, FileText, Lock, Eye, Database, CreditCard, Mail, Globe, Scale, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteFooter from "@/components/SiteFooter";

const lastUpdated = "March 10, 2026";

export default function PrivacyTerms() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-[#f3efe6]">
      <nav className="sticky top-0 z-50 bg-[#1a1008]/90 backdrop-blur-sm border-b border-[#c9a96e]/15">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663211654017/kGjPju6hKCvCsjZhgUHyqj/CDPlargelogo_25428631.PNG"
              alt="Easy Book Publishers"
              className="h-10 w-auto object-contain"
            />
            <span className="font-serif text-[#f5d98a] text-lg md:text-xl tracking-wide hidden sm:block">Easy Book Publishers</span>
          </button>
          <Button onClick={() => navigate("/dashboard")} className="bg-[#c9a96e] hover:bg-[#b8944f] text-[#1a1008] font-semibold">
            Go to Dashboard
          </Button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-[#c9a96e]" />
            <Scale className="w-8 h-8 text-[#c9a96e]" />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-[#1a1008] mb-3">
            Privacy Policy & Terms of Service
          </h1>
          <p className="text-[#5c4a2a]/90 text-sm">Last updated: {lastUpdated}</p>
        </div>

        <div className="space-y-12">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-[#c9a96e]" />
              <h2 className="font-serif text-2xl text-[#1a1008]">Privacy Policy</h2>
            </div>
            <div className="bg-white rounded-xl border border-[#c9a96e]/15 p-6 md:p-8 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-[#8b6914]" />
                  <h3 className="font-serif text-lg text-[#1a1008] font-semibold">Information We Collect</h3>
                </div>
                <p className="text-[#5c4a2a] leading-relaxed">
                  When you create an account or make a purchase, we collect the information you provide directly:
                </p>
                <ul className="mt-2 space-y-1 text-[#5c4a2a] text-sm list-disc list-inside">
                  <li>Full name and email address (required for account creation)</li>
                  <li>Payment information processed securely through Stripe (we never store card numbers)</li>
                  <li>Manuscript files and book project data you upload to the platform</li>
                  <li>Usage data such as pages visited, features used, and browser type</li>
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-[#8b6914]" />
                  <h3 className="font-serif text-lg text-[#1a1008] font-semibold">How We Use Your Information</h3>
                </div>
                <ul className="space-y-1 text-[#5c4a2a] text-sm list-disc list-inside">
                  <li>To provide, operate, and improve our book production services</li>
                  <li>To process payments and manage your subscription</li>
                  <li>To send you email confirmations and important account notifications</li>
                  <li>To provide customer support and respond to your inquiries</li>
                  <li>To analyze usage patterns and improve the platform experience</li>
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-[#8b6914]" />
                  <h3 className="font-serif text-lg text-[#1a1008] font-semibold">Data Security</h3>
                </div>
                <p className="text-[#5c4a2a] leading-relaxed text-sm">
                  We implement industry-standard security measures to protect your personal information. All data is transmitted using TLS encryption. Payment processing is handled by Stripe, a PCI-DSS Level 1 certified provider. Your manuscript files are stored securely and are only accessible by your account.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-[#8b6914]" />
                  <h3 className="font-serif text-lg text-[#1a1008] font-semibold">Third-Party Services</h3>
                </div>
                <p className="text-[#5c4a2a] leading-relaxed text-sm">
                  We use the following third-party services that may collect or process your data:
                </p>
                <ul className="mt-2 space-y-1 text-[#5c4a2a] text-sm list-disc list-inside">
                  <li><strong>Stripe</strong> — Payment processing and subscription management</li>
                  <li><strong>Replit</strong> — Application hosting and infrastructure</li>
                  <li><strong>Open Library / Google Books</strong> — ISBN lookup and book metadata (public APIs)</li>
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-[#8b6914]" />
                  <h3 className="font-serif text-lg text-[#1a1008] font-semibold">Your Rights</h3>
                </div>
                <p className="text-[#5c4a2a] leading-relaxed text-sm">
                  You have the right to access, correct, or delete your personal data at any time. You may request a copy of all data we hold about you. To exercise these rights or for any privacy-related inquiries, contact us through the platform.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-[#8b6914]" />
                  <h3 className="font-serif text-lg text-[#1a1008] font-semibold">Cookies & Local Storage</h3>
                </div>
                <p className="text-[#5c4a2a] leading-relaxed text-sm">
                  We use session cookies to maintain your login state and preferences. We do not use third-party advertising cookies or tracking pixels. Essential cookies are required for the platform to function properly.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-[#8b6914]" />
                  <h3 className="font-serif text-lg text-[#1a1008] font-semibold">Data Retention</h3>
                </div>
                <p className="text-[#5c4a2a] leading-relaxed text-sm">
                  We retain your account data and project files for as long as your account is active. If you delete your account, we will remove your personal data within 30 days. Anonymized usage statistics may be retained for analytical purposes.
                </p>
              </div>
            </div>
          </section>

          <div className="border-t border-[#c9a96e]/20"></div>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <Scale className="w-5 h-5 text-[#c9a96e]" />
              <h2 className="font-serif text-2xl text-[#1a1008]">Terms of Service</h2>
            </div>
            <div className="bg-white rounded-xl border border-[#c9a96e]/15 p-6 md:p-8 space-y-6">
              <div>
                <h3 className="font-serif text-lg text-[#1a1008] font-semibold mb-2">Key Definitions</h3>
                <p className="text-[#5c4a2a] leading-relaxed text-sm mb-3">
                  Here are plain-language explanations of important terms used throughout this page:
                </p>
                <ul className="space-y-2 text-[#5c4a2a] text-sm list-disc list-inside">
                  <li><strong>"The Service"</strong> — The Easy Book Publishers website, tools, and all features we provide to help you produce your book.</li>
                  <li><strong>"Account"</strong> — Your personal login on Easy Book Publishers, created with your email address and password.</li>
                  <li><strong>"Content" / "Your Content"</strong> — Anything you upload or create using our platform, including your manuscripts, cover designs, and exported book files. You own all of it.</li>
                  <li><strong>"Subscription"</strong> — A paid plan (monthly or annual) that renews automatically and gives you access to premium features until you cancel.</li>
                  <li><strong>"Lifetime Plan"</strong> — A one-time purchase that gives you permanent access to a plan's features with no recurring charges.</li>
                  <li><strong>"Stripe"</strong> — The independent payment company that securely handles all credit card transactions on our behalf. We never see or store your card number.</li>
                  <li><strong>"TLS Encryption"</strong> — A security technology that scrambles data sent between your browser and our servers so no one else can read it.</li>
                  <li><strong>"PCI-DSS Level 1"</strong> — The highest level of payment security certification. Stripe holds this certification, meaning your payment info meets the strictest safety standards.</li>
                  <li><strong>"Cookies"</strong> — Small files stored in your browser that remember your login session. We only use essential cookies to keep you signed in.</li>
                  <li><strong>"Typesetting"</strong> — The process of formatting your manuscript into a professionally designed, print-ready layout with proper fonts, margins, headers, and page numbers.</li>
                  <li><strong>"PDF"</strong> — A standard file format used for viewing and printing documents. We generate print-ready PDFs suitable for services like Amazon KDP.</li>
                  <li><strong>"EPUB"</strong> — A widely used e-book format that works on most e-readers (Kindle, Kobo, Apple Books, etc.).</li>
                  <li><strong>"IDML"</strong> — An Adobe InDesign file format. Useful if you or a designer want to make further layout changes in professional design software.</li>
                  <li><strong>"KDP"</strong> — Kindle Direct Publishing, Amazon's self-publishing platform where you can list your book for sale.</li>
                  <li><strong>"Trim Size"</strong> — The final dimensions of your printed book (for example, 6" x 9"). This determines page layout and margins.</li>
                  <li><strong>"ISBN"</strong> — International Standard Book Number, a unique identifier assigned to published books. It is not required to use our service.</li>
                  <li><strong>"Binding Arbitration"</strong> — A way to settle disagreements outside of court, where a neutral third party reviews the issue and makes a decision that both sides agree to follow.</li>
                  <li><strong>"Intellectual Property"</strong> — Legal ownership rights over creative work. Your book content belongs to you; our platform design and code belong to us.</li>
                  <li><strong>"As Is"</strong> — Means we provide the service in its current state and do not make guarantees that every feature will work perfectly at all times.</li>
                </ul>
              </div>

              <div className="border-t border-[#c9a96e]/10 pt-6">
                <h3 className="font-serif text-lg text-[#1a1008] font-semibold mb-2">1. Acceptance of Terms</h3>
                <p className="text-[#5c4a2a] leading-relaxed text-sm">
                  By using Easy Book Publishers, you agree to follow these rules. If you do not agree, please do not use the Service.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-lg text-[#1a1008] font-semibold mb-2">2. Account Registration</h3>
                <p className="text-[#5c4a2a] leading-relaxed text-sm">
                  To purchase a paid plan, you need to create an account with a valid email address and confirm it. You are responsible for keeping your password safe and for anything that happens on your account. Please use real, accurate information when signing up.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-lg text-[#1a1008] font-semibold mb-2">3. What We Provide</h3>
                <p className="text-[#5c4a2a] leading-relaxed text-sm">
                  Easy Book Publishers gives you online tools to upload your manuscript, format it with professional typesetting, and export it as a print-ready PDF, e-book (EPUB), or design file (IDML). We offer a free Starter plan and paid plans (KDP Ready, Author Pro, and Publisher) with additional features at each level.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-[#8b6914]" />
                  <h3 className="font-serif text-lg text-[#1a1008] font-semibold">4. Payments & Subscriptions</h3>
                </div>
                <ul className="space-y-1 text-[#5c4a2a] text-sm list-disc list-inside">
                  <li>All payments are handled securely by Stripe. We never see or store your credit card number.</li>
                  <li>Monthly and annual plans renew automatically. You will be charged at the start of each billing period until you cancel.</li>
                  <li>Lifetime plans are a single, one-time payment. You will never be charged again for that plan.</li>
                  <li>You can cancel your subscription at any time through the billing portal. You keep access until the end of your current billing period.</li>
                  <li>If you are unhappy with your purchase, you may request a refund within 14 days. We review each request individually.</li>
                  <li>All prices are shown in U.S. dollars (USD). We will give you advance notice before changing prices.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-serif text-lg text-[#1a1008] font-semibold mb-2">5. Your Content Belongs to You</h3>
                <p className="text-[#5c4a2a] leading-relaxed text-sm">
                  You keep full ownership of everything you create or upload, including your manuscripts, cover designs, and exported files. We will never claim your work as ours. The Easy Book Publishers platform itself (its design, features, and code) is our property and is protected by copyright.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-lg text-[#1a1008] font-semibold mb-2">6. Rules for Using the Service</h3>
                <p className="text-[#5c4a2a] leading-relaxed text-sm">
                  Please do not use Easy Book Publishers to:
                </p>
                <ul className="mt-2 space-y-1 text-[#5c4a2a] text-sm list-disc list-inside">
                  <li>Upload content that you do not have the right to use (for example, someone else's copyrighted work without permission)</li>
                  <li>Try to break into, hack, or tamper with parts of the platform you should not have access to</li>
                  <li>Do anything illegal or that violates any laws</li>
                  <li>Disrupt or interfere with the platform for other users</li>
                  <li>Resell or redistribute our service to others without our permission</li>
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-[#8b6914]" />
                  <h3 className="font-serif text-lg text-[#1a1008] font-semibold">7. Limits on Our Responsibility</h3>
                </div>
                <p className="text-[#5c4a2a] leading-relaxed text-sm">
                  We do our best to provide a reliable service, but we cannot guarantee everything will work perfectly at all times. If something goes wrong, we are not responsible for indirect losses (such as lost profits or missed deadlines) resulting from using the Service. The most we would ever owe you is the amount you paid us in the 12 months before the issue occurred.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-lg text-[#1a1008] font-semibold mb-2">8. Service Availability</h3>
                <p className="text-[#5c4a2a] leading-relaxed text-sm">
                  We aim to keep the platform running smoothly, but there may be times it is temporarily unavailable for maintenance, updates, or unexpected issues. We will do our best to let you know in advance about any planned downtime.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-lg text-[#1a1008] font-semibold mb-2">9. Closing Your Account</h3>
                <p className="text-[#5c4a2a] leading-relaxed text-sm">
                  You can close your account at any time. If you break these rules, we may suspend or close your account. If your account is closed for any reason, you will have a reasonable amount of time to download your files before they are removed.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-lg text-[#1a1008] font-semibold mb-2">10. Changes to These Terms</h3>
                <p className="text-[#5c4a2a] leading-relaxed text-sm">
                  We may update these Terms from time to time. If we make important changes, we will let you know by email or through the platform. If you continue using the Service after the changes, it means you accept the updated Terms.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-lg text-[#1a1008] font-semibold mb-2">11. Legal Jurisdiction</h3>
                <p className="text-[#5c4a2a] leading-relaxed text-sm">
                  These Terms follow United States law. If we ever have a disagreement that we cannot resolve directly, it will be settled through binding arbitration, which means a neutral third party will review the issue and make a final decision instead of going to court.
                </p>
              </div>
            </div>
          </section>

          <div className="bg-[#c9a96e]/10 border border-[#c9a96e]/20 rounded-xl p-6 text-center">
            <p className="text-[#5c4a2a] text-sm">
              If you have questions about this Privacy Policy or Terms of Service, please contact us through the platform or reach out via the contact form on our website.
            </p>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
