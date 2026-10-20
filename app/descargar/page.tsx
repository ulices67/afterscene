import type { Metadata } from "next";
import DistributionExperience from "./DistributionExperience";

export const metadata: Metadata = {
  title: "Descargar AFTERSCENE — Tu mundo audiovisual, siempre contigo",
  description:
    "Descarga AFTERSCENE para Windows o entra desde tu navegador. Descubre historias, organiza tu biblioteca y conserva tus recuerdos.",
};

export default function DownloadPage() {
  return <DistributionExperience />;
}
