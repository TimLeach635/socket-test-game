const esbuild = require("esbuild");

esbuild.build({
  entryPoints: ["src/app.ts"],
  bundle: true,
  minify: true,
  outfile: "dist/app.js",
  platform: "node"
}).catch((reason) => {
  console.error(reason);
});

esbuild.build({
  entryPoints: ["src/browser.ts"],
  bundle: true,
  minify: false,
  sourcemap: true,
  outfile: "static/browser.js",
  platform: "browser"
}).catch((reason) => {
  console.error(reason);
});
