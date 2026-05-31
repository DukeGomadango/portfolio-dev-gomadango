import type { Metadata } from "next";
import "./globals.css";
import TransitionProvider from "@/components/layout/TransitionProvider";
import SceneContainer from "@/components/three/SceneContainer";

export const metadata: Metadata = {
  title: "Dango Streamverse Portfolio | Developer Hub",
  description: "A premium portfolio showcasing the integrated technical ecosystem of Dango Streamverse creators, built with high-performance WebGL custom shaders, GPGPU fluid simulations, and zero-compromise engineering quality.",
  keywords: ["Next.js", "Three.js", "React Three Fiber", "GLSL", "GPGPU", "Passkeys", "OCR", "Web Audio API"],
  authors: [{ name: "DukeGomadango" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-50 overflow-x-hidden">
        <TransitionProvider>
          {/* Persistent global WebGL layer (WebGL FBO Refraction & Morphing core) */}
          <SceneContainer />
          
          {/* HTML Page content container */}
          <div className="relative z-10 w-full flex flex-col min-h-screen">
            {children}
          </div>
        </TransitionProvider>
      </body>
    </html>
  );
}
