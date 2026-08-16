import { defineConfig } from "vite";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

export default defineConfig({
  base: "/TattooSite/",
  plugins: [
    ViteImageOptimizer({
      // Qualidade do WebP: 75-82 é o ponto ideal (visualmente quase
      // idêntico ao original, mas com peso muito menor). Quanto mais
      // baixo, menor o arquivo — mas abaixo de ~70 já dá pra notar
      // "borrão" em áreas com textura fina (ex.: sombreado de tattoo).
      webp: {
        quality: 78,
        lossless: false
      },
      // Mantém também PNG otimizado como fallback, caso algum
      // navegador muito antigo não suporte WebP (raro hoje em dia).
      png: {
        quality: 80
      },
      logStats: true
    })
  ]
});
