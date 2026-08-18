import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yasutaka Connect",
  description: "Controle de estoque Yasutaka",
  applicationName: "Yasutaka Connect",
  // Habilita o modo standalone quando adicionado à tela de início no iOS.
  appleWebApp: {
    capable: true,
    title: "Yasutaka Connect",
    statusBarStyle: "default",
  },
};

/**
 * `maximumScale`/`userScalable` travam o pinch-zoom, que estava quebrando o
 * layout no celular. Ressalva honesta: o Safari comum IGNORA isso desde o
 * iOS 10 — lá o que resolve de fato é instalar como PWA (`display: standalone`
 * no manifest). No Android o Chrome respeita.
 *
 * `viewportFit: "cover"` estende o app até as bordas; por isso o header e a
 * TabBar usam `env(safe-area-inset-*)` pra não ficar sob o notch/indicador.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
