// Gera uma cópia .webp ao lado de cada PNG em src/assets.
//
// Por que um script separado em vez de deixar o plugin de otimização
// fazer isso sozinho: o vite-plugin-image-optimizer otimiza cada
// arquivo no MESMO formato em que ele já está (PNG entra, PNG
// otimizado sai). Ele não cria um novo arquivo em outro formato.
// Como queremos as duas versões lado a lado — PNG como fallback,
// WebP como formato preferido — precisamos gerar o WebP explicitamente
// com o sharp antes do build rodar.
//
// Roda com: node scripts/generate-webp.js
// (o package.json já chama isso automaticamente antes do "build")

import sharp from "sharp";
import { readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ASSETS_DIR = path.resolve("src/assets");

// Qualidade do WebP: 78 é o ponto de equilíbrio entre peso e nitidez.
// Abaixo de ~70 começa a aparecer "borrão" em áreas de textura fina
// (ex.: sombreado e pontilhismo de tatuagem). Acima de ~85 o ganho
// de peso encolhe muito sem melhora visual perceptível.
const WEBP_QUALITY = 78;

async function findPngFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await findPngFiles(fullPath)));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".png")) {
      files.push(fullPath);
    }
  }

  return files;
}

async function generateWebp(pngPath) {
  const webpPath = pngPath.replace(/\.png$/i, ".webp");

  const { size: originalSize } = await stat(pngPath);

  await sharp(pngPath)
    .webp({ quality: WEBP_QUALITY })
    .toFile(webpPath);

  const { size: newSize } = await stat(webpPath);

  const savedPercent = Math.round((1 - newSize / originalSize) * 100);

  const relativePath = path.relative(process.cwd(), pngPath);
  const sizeLabel = `${(newSize / 1024).toFixed(0)}KB`;

  console.log(`  ✓ ${relativePath} → .webp  ${sizeLabel} (-${savedPercent}%)`);
}

async function run() {
  if (!existsSync(ASSETS_DIR)) {
    console.log("Pasta src/assets não encontrada, nada para converter.");
    return;
  }

  const pngFiles = await findPngFiles(ASSETS_DIR);

  if (pngFiles.length === 0) {
    console.log("Nenhum PNG encontrado em src/assets.");
    return;
  }

  console.log(`Gerando WebP para ${pngFiles.length} imagem(ns)...`);

  for (const pngPath of pngFiles) {
    await generateWebp(pngPath);
  }

  console.log("Concluído.");
}

run().catch((error) => {
  console.error("Falha ao gerar WebP:", error);
  process.exit(1);
});
