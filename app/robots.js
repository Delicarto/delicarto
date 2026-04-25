export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/crm", "/dashboard"],
      },
    ],
    sitemap: "https://delicarto.de/sitemap.xml",
    host: "https://delicarto.de",
  };
}
