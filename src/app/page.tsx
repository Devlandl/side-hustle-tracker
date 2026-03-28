import Link from "next/link";

const features = [
  {
    emoji: "💸",
    title: "Track Every Hustle",
    description:
      "Add all your income streams in one place. See what each hustle brings in at a glance.",
  },
  {
    emoji: "🏦",
    title: "Tax Jar",
    description:
      "Know exactly how much to set aside for taxes. Quarterly reminders so you never miss a payment.",
  },
  {
    emoji: "🎯",
    title: "Set Goals",
    description:
      "Set monthly or yearly earnings targets. Watch your progress bar fill up as you hustle.",
  },
  {
    emoji: "📋",
    title: "Export Reports",
    description:
      "Download PDF summaries or CSV exports. Hand your accountant a clean year-end report.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Side Hustle Tracker",
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "14.00",
              priceCurrency: "USD",
            },
            description:
              "Track income across multiple side hustles, log expenses, estimate quarterly taxes, and hit your earnings goals.",
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "5",
              ratingCount: "1",
            },
          }),
        }}
      />
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <span className="text-6xl mb-6 block">💸</span>
          <h1 className="text-4xl md:text-5xl font-bold text-brand-white mb-4">
            Side Hustle Tracker
          </h1>
          <p className="text-xl text-brand-muted mb-8 max-w-2xl mx-auto">
            Track every dollar from every hustle. Expenses, taxes, goals - all
            in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="px-8 py-4 bg-brand-gold text-brand-black font-bold rounded-xl text-lg hover:bg-brand-gold-light transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/sign-in"
              className="px-8 py-4 border border-brand-border text-brand-white font-medium rounded-xl text-lg hover:border-brand-gold/30 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-brand-white text-center mb-12">
          Everything You Need
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-brand-card border border-brand-border rounded-xl p-6"
            >
              <span className="text-3xl mb-3 block">{feature.emoji}</span>
              <h3 className="text-lg font-semibold text-brand-white mb-2">
                {feature.title}
              </h3>
              <p className="text-brand-muted text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-brand-white mb-4">
          Simple Pricing
        </h2>
        <div className="bg-brand-card border border-brand-gold/30 rounded-2xl p-8 max-w-sm mx-auto">
          <p className="text-brand-gold text-sm font-medium mb-2">
            ONE-TIME PURCHASE
          </p>
          <p className="text-5xl font-bold text-brand-white mb-2">$14</p>
          <p className="text-brand-muted mb-6">
            Full access forever. No subscriptions.
          </p>
          <ul className="text-left text-sm space-y-3 mb-8">
            <li className="flex items-center gap-2 text-brand-white">
              <span className="text-brand-gold">&#10003;</span> Unlimited hustles
            </li>
            <li className="flex items-center gap-2 text-brand-white">
              <span className="text-brand-gold">&#10003;</span> Income and expense tracking
            </li>
            <li className="flex items-center gap-2 text-brand-white">
              <span className="text-brand-gold">&#10003;</span> Tax jar with quarterly reminders
            </li>
            <li className="flex items-center gap-2 text-brand-white">
              <span className="text-brand-gold">&#10003;</span> Goals and progress tracking
            </li>
            <li className="flex items-center gap-2 text-brand-white">
              <span className="text-brand-gold">&#10003;</span> PDF and CSV reports
            </li>
            <li className="flex items-center gap-2 text-brand-white">
              <span className="text-brand-gold">&#10003;</span> Recurring income auto-logging
            </li>
          </ul>
          <Link
            href="/sign-up"
            className="block w-full py-3 bg-brand-gold text-brand-black font-semibold rounded-xl hover:bg-brand-gold-light transition-colors"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* TVR badge */}
      <section className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-brand-muted text-sm">
          Available on the{" "}
          <a
            href="https://tvrapp.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-gold hover:text-brand-gold-light"
          >
            TVR App Store
          </a>
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-border py-8 text-center">
        <p className="text-brand-muted text-sm">
          &copy; {new Date().getFullYear()} Side Hustle Tracker. A TVR App
          Store Product.
        </p>
      </footer>
    </div>
  );
}
