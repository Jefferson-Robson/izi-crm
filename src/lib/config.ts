export const tenantConfig = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || "IZI CRM",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "onboarding@resend.dev",
  appDomain: process.env.NEXT_PUBLIC_APP_DOMAIN || "izicrm.com.br",
  theme: {
    primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || "#f59e0b", // amber-500
    logoUrl: process.env.NEXT_PUBLIC_LOGO_URL || "",
  }
};
