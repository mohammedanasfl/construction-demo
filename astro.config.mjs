import { defineConfig } from "astro/config";

// Static site. The build is written to /docs so GitHub Pages can keep
// serving the "main branch /docs" folder exactly as before.
export default defineConfig({
    site: "https://mohammedanasfl.github.io",
    outDir: "docs",
    compressHTML: false, // keep whitespace between inline elements identical to the original markup
    build: { format: "file" }, // about.html, service.html... (same URLs as before)
    devToolbar: { enabled: false },
});
