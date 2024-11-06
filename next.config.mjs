/** @type {import('next').NextConfig} */
const nextConfig = {
    trailingSlash: false,
    images: {
        remotePatterns: [
          {
            protocol: "https",
            hostname: "i.scdn.co", // Este es el que ya tenías configurado
          },
          {
            protocol: "https",
            hostname: "avatars.githubusercontent.com",
          },
          {
            protocol: "https",
            hostname: "opproject.blob.core.windows.net",
          },
        ],
      },
};

export default nextConfig;
