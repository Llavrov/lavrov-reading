import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import "./globals.scss";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s · ${site.shortName}`,
  },
  description: site.description,
  authors: [{ name: site.author }],
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: site.title,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
  alternates: {
    canonical: site.url,
    types: {
      "application/rss+xml": `${site.url}/rss.xml`,
    },
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={site.lang}>
      <body>
        <header className="site-header">
          <div className="wrap">
            <Link href="/" className="site-header__brand">
              {site.name}
            </Link>
          </div>
        </header>
        {children}
        <footer className="site-footer">
          <div className="wrap">
            <p>
              {site.author}. Личная читальня: конспекты книг и статей своими
              словами. · <Link href="/rss.xml">RSS</Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
