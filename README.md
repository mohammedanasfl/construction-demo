# Construction Demo

A static, multi-page construction company website (home, about, services, features, blog, contact), hosted with GitHub Pages.

**Live site:** https://mohammedanasfl.github.io/construction-demo/

## Structure

```
docs/          the published website (index.html, about.html, css/, js/, img/, lib/)
```

Only the `docs/` folder is served by GitHub Pages.

## Run locally

```bash
python3 -m http.server -d docs 8000
```

Then open http://localhost:8000.

## Deploy with GitHub Pages

1. In the repository, go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Choose the branch to publish and the **/docs** folder, then **Save**.

The site is available at the URL above a minute or two later. No build step is needed; `docs/.nojekyll` tells Pages to serve the files as they are.
