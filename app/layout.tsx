import type { Metadata } from "next";
import "./styles.css";
import "./reference.css";
export const metadata: Metadata = {
  title: "AFTERSCENE — Las historias que se quedan contigo",
  description:
    "Tu archivo cinematográfico personal. Descubre películas, construye tu biblioteca y conserva tus recuerdos.",
  icons: { icon: "/afterscene-icon.svg" },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
