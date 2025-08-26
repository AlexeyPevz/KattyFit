import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KattyFit - Растяжка и Аэройога",
    short_name: "KattyFit",
    description: "Персональные тренировки по растяжке и аэройоге с профессиональным тренером",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#8b5cf6",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    categories: ["fitness", "health", "lifestyle"],
    shortcuts: [
      {
        name: "Записаться на тренировку",
        short_name: "Запись",
        description: "Быстрая запись на персональную тренировку",
        url: "/booking",
        icons: [{ src: "/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Мои курсы",
        short_name: "Курсы",
        description: "Доступ к купленным курсам",
        url: "/dashboard",
        icons: [{ src: "/icon-192x192.png", sizes: "192x192" }],
      },
    ],
  }
}
