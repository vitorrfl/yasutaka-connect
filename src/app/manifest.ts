import type { MetadataRoute } from "next";

/**
 * Manifest do PWA.
 *
 * `display: standalone` é o que remove a barra do navegador — e, de quebra,
 * desabilita o pinch-zoom no iOS, que ignora `user-scalable=no` no Safari
 * comum desde o iOS 10 mas respeita a preferência quando instalado.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Yasutaka Connect",
    short_name: "Yasutaka",
    description: "Controle de estoque e vendas Yasutaka",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f1f5f9",
    theme_color: "#0f172a",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Separado do "any": o Android recorta o maskable, então ele precisa da
      // margem de segurança que o ícone normal não tem.
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
