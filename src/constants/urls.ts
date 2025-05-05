export const ProjectUrls = {
  // Root
  home: "/",
  aboutUs: "/about-us",
  privacyPolicy: "/privacy-policy",
  termsOfService: "/terms-of-service",

  // Auth
  signIn: "/sign-in",
  signUp: "/sign-up",
  signUpVerify: "/sign-up-verify",
  signUpSuccess: "/sign-up-success",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  resetPasswordSent: "/reset-password-sent",
  resetPasswordSuccess: "/reset-password-success",

  // Application
  dashboard: "/dashboard",
  createTrainingPlan: "/training-plans/create",
  trainingPlans: "/training-plans",
  trainingPlan: (id: string) => `/training-plans/${id}`,
  trainingPlanSession: (id: string) => `/training-plans/${id}/session`,
  trainingHistory: "/training-history",
  settings: "/settings",
} as const;
