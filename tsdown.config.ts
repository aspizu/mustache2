import {defineConfig} from "tsdown"

export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  platform: "neutral",
  target: "es2022",
  tsconfig: "tsconfig.build.json",
  dts: true,
  clean: true,
  minify: {
    mangleProps: {
      include: /^(type|value|indent|children|line|standalone|parent)$/,
    },
  },
  sourcemap: false,
  outputOptions: {
    codeSplitting: false,
  },
})
