export const ProjectUrls = {
  home: "/",
  signIn: "/sign-in",
  signUp: "/sign-up",
  signUpSuccess: "/sign-up-success",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  resetPasswordSent: "/reset-password-sent",
  resetPasswordSuccess: "/reset-password-success",
  trainingPlans: "/training-plans",
  trainingPlan: (id: string) => `/training-plans/${id}`,
} as const;
