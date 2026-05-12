import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><main className="min-h-screen max-w-6xl mx-auto p-6">{children}</main></body></html>;
}
