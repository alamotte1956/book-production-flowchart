import { useLocation } from "wouter";
import { Shield, FileText, Lock, Eye, Database, CreditCard, Mail, Globe, Scale, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteFooter from "@/components/SiteFooter";

const lastUpdated = "March 8, 2026";

export default function PrivacyTerms() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-[#faf6ef]">
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
          <Button onClick={() => navigate("/")} className="bg-[#c9a96e] hover:bg-[#b8944f] text-[#1a1008] font-semibold">
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
          <p className="text-[#5c4a2a]/70 text-sm">Last updated: {lastUpdated}</p>
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
                <h3 className="font-serif text-lg text-[#1a1008] font-semibold mb-2">1. Acceptance of Terms</h3>
                <p className="text-[#5c4a2a] leading-relaxed text-sm">
                  By accessing or using Easy Book Publishers ("the Service"), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, you may not use the Service.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-lg text-[#1a1008] font-semibold mb-2">2. Account Registration</h3>
                <p className="text-[#5c4a2a] leading-relaxed text-sm">
                  To purchase a paid plan, you must create an account with a valid email address and confirm your email. You are responsible for maintaining the security of your account and for all activities that occur under your account. You must provide accurate and complete information during registration.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-lg text-[#1a1008] font-semibold mb-2">3. Service Description</h3>
                <p className="text-[#5c4a2a] leading-relaxed text-sm">
                  Easy Book Publishers provides web-based book production tools including manuscript upload, typesetting, cover design, and export to multiple formats (PDF, EPUB, IDML). The Service offers free (Starter) and paid (Author Pro, Publisher) tiers with varying feature access.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-[#8b6914]" />
                  <h3 className="font-serif text-lg text-[#1a1008] font-semibold">4. Payments & Subscriptions</h3>
                </div>
                <ul className="space-y-1 text-[#5c4a2a] text-sm list-disc list-inside">
                  <li>All payments are processed securely through Stripe</li>
                  <li>Subscription plans (monthly and annual) renew automatically until cancelled</li>
                  <li>Lifetime plans are one-time purchases with no recurring charges</li>
                  <li>You may cancel your subscription at any time through the billing portal</li>
                  <li>Refunds are handled on a case-by-case basis within 14 days of purchase</li>
                  <li>Prices are listed in USD and may be updated with reasonable notice</li>
                </ul>
              </div>

              <div>
                <h3 className="font-serif text-lg text-[#1a1008] font-semibold mb-2">5. Intellectual Property</h3>
                <p className="text-[#5c4a2a] leading-relaxed text-sm">
                  You retain full ownership of all content you create or upload to the Service, including manuscripts, cover designs, and exported files. Easy Book Publishers does not claim any intellectual property rights over your content. Our platform, including its design, code, and documentation, is the property of Easy Book Publishers and is protected by copyright.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-lg text-[#1a1008] font-semibold mb-2">6. Acceptable Use</h3>
                <p className="text-[#5c4a2a] leading-relaxed text-sm">
                  You agree not to use the Service to:
                </p>
                <ul className="mt-2 space-y-1 text-[#5c4a2a] text-sm list-disc list-inside">
                  <li>Upload or distribute content that infringes on the rights of others</li>
                  <li>Attempt to access, tamper with, or use non-public areas of the Service</li>
                  <li>Use the Service for any unlawful purpose or in violation of any applicable laws</li>
                  <li>Interfere with or disrupt the Service or its infrastructure</li>
                  <li>Resell or redistribute the Service without authorization</li>
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-[#8b6914]" />
                  <h3 className="font-serif text-lg text-[#1a1008] font-semibold">7. Limitation of Liability</h3>
                </div>
                <p className="text-[#5c4a2a] leading-relaxed text-sm">
                  The Service is provided "as is" without warranties of any kind. Easy Book Publishers shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount you paid for the Service in the 12 months preceding the claim.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-lg text-[#1a1008] font-semibold mb-2">8. Service Availability</h3>
                <p className="text-[#5c4a2a] leading-relaxed text-sm">
                  We strive to maintain high availability but do not guarantee uninterrupted access. The Service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control. We will make reasonable efforts to notify users of planned downtime.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-lg text-[#1a1008] font-semibold mb-2">9. Termination</h3>
                <p className="text-[#5c4a2a] leading-relaxed text-sm">
                  We reserve the right to suspend or terminate your access to the Service if you violate these Terms. You may close your account at any time. Upon termination, your right to use the Service ceases immediately, though we will provide reasonable time to export your data.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-lg text-[#1a1008] font-semibold mb-2">10. Changes to Terms</h3>
                <p className="text-[#5c4a2a] leading-relaxed text-sm">
                  We may update these Terms from time to time. Material changes will be communicated through the platform or via email. Your continued use of the Service after changes take effect constitutes acceptance of the updated Terms.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-lg text-[#1a1008] font-semibold mb-2">11. Governing Law</h3>
                <p className="text-[#5c4a2a] leading-relaxed text-sm">
                  These Terms shall be governed by and construed in accordance with the laws of the United States. Any disputes arising from these Terms or the Service shall be resolved through binding arbitration.
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
