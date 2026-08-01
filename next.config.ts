import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // /api/plano rasteriza el plano a PNG y necesita la tipografía en disco.
  // Sin esto la función serverless se despliega sin el .ttf y el texto sale
  // como cuadraditos: resvg no tiene con qué dibujar las letras.
  outputFileTracingIncludes: {
    '/api/plano': ['./assets/**'],
  },
};

export default nextConfig;
