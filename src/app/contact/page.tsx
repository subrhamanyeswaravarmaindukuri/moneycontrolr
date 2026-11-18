import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { JsonLd } from "@/components/seo/json-ld";
import { ContactForm } from "@/components/contact/contact-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildPublicMetadata } from "@/lib/seo/metadata";
import {
  HelpCircle,
  Lock,
  MailCheck,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";

const PAGE_TITLE = "Contact MoneyControlr – Student Expense Tracker Support";
const PAGE_DESCRIPTION =
  "Get in touch with MoneyControlr for questions about daily budgeting, account verification, bug reports, or student feedback.";

export const metadata: Metadata = buildPublicMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/contact",
  useAbsoluteTitle: true,
});

function hasConfiguredEmailService(): boolean {
  const apiKey = process.env.RESEND_API_KEY?.trim() ?? "";
  const toEmail = process.env.CONTACT_TO_EMAIL?.trim() ?? "";

  const looksValid = (val: string) =>
    val.length > 0 &&
    !val.toLowerCase().includes("placeholder") &&
    !val.toLowerCase().includes("your_") &&
    !val.toLowerCase().includes("example.com");

  return looksValid(apiKey) && looksValid(toEmail);
}

const CONTACT_TOPICS = [
  {
    icon: HelpCircle,
    title: "Account & Verification Support",
    detail:
      "Need help confirming your email address or signing back into your student account?",
  },
  {
    icon: MessageSquare,
    title: "Feedback & Bug Reports",
    detail:
      "Spotted an issue on Desktop or Mobile, or want to share how you manage your monthly budget?",
  },
  {
    icon: ShieldCheck,
    title: "Privacy & Data Questions",
    detail:
      "Questions about Row-Level Security, transaction exports, or how your account stays private.",
  },
];

export default function ContactPage() {
  const isDeliveryConfigured = hasConfiguredEmailService();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <JsonLd
        pageTitle={`${PAGE_TITLE} | MoneyControlr`}
        pageDescription={PAGE_DESCRIPTION}
        pagePath="/contact"
      />
      <Navbar />

      <main className="flex-1 py-12 sm:py-16 px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Header */}
          <div className="max-w-2xl space-y-3">
            <Badge variant="primary" className="gap-1.5 px-3 py-1">
              <MailCheck className="w-3.5 h-3.5" />
              Contact MoneyControlr
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-apptext tracking-tight">
              Send us a message
            </h1>
            <p className="text-sm sm:text-base text-apptext-muted leading-relaxed">
              Have a question about MoneyControlr, verification links, or budgeting workflows? Use
              the secure form below to reach out directly.
            </p>
          </div>

          {/* 2-Column Content */}
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Info & Security Promise */}
            <div className="lg:col-span-5 space-y-5">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">How we can help</CardTitle>
                  <CardDescription>
                    Common reasons students and users get in touch.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {CONTACT_TOPICS.map((topic) => {
                    const Icon = topic.icon;
                    return (
                      <div key={topic.title} className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5">
                          <h2 className="text-sm font-semibold text-apptext">{topic.title}</h2>
                          <p className="text-xs text-apptext-muted leading-relaxed">
                            {topic.detail}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card variant="flat" className="bg-primary-light/40 border-primary/20">
                <CardContent className="p-5 flex items-start gap-3">
                  <Lock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1.5">
                    <h2 className="text-sm font-bold text-apptext">
                      Privacy-First Form Handling
                    </h2>
                    <p className="text-xs text-apptext-muted leading-relaxed">
                      Every submission is validated and sanitized on the server with anti-spam
                      protection. Message contents are never persisted into unneeded databases, and
                      please never share passwords or sensitive card numbers here.
                    </p>
                    <p className="text-xs text-apptext-muted pt-1">
                      Looking for product details first?{" "}
                      <Link href="/features" className="font-semibold text-primary hover:underline">
                        View implemented features
                      </Link>
                      .
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-7">
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="text-xl">Direct Inquiry Form</CardTitle>
                  <CardDescription>
                    All fields are validated server-side before delivery.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ContactForm isDeliveryConfigured={isDeliveryConfigured} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

