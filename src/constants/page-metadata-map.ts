type Metadata = {
  title?: string;
  description?: string;
  breadcrumbs: {
    label: string;
    href: string;
    isCurrent?: boolean;
  }[];
};

export const pageMetadataMap: Record<string, Metadata> = {
  "/training-plans": {
    title: "Training Plans",
    description: "View and manage your training plans",
    breadcrumbs: [
      {
        label: "Training Plans",
        href: "/training-plans",
        isCurrent: true,
      },
    ],
  },
  "/training-plans/create": {
    breadcrumbs: [
      {
        label: "Create Training Plan",
        href: "/training-plans/create",
        isCurrent: true,
      },
    ],
  },
  "/training-plans/[id]": {
    breadcrumbs: [
      {
        label: "Training Plans",
        href: "/training-plans",
      },
      {
        label: "Details",
        href: "/training-plans/[id]",
        isCurrent: true,
      },
    ],
  },
  "/training-plans/[id]/session": {
    breadcrumbs: [
      {
        label: "Training Plans",
        href: "/training-plans",
      },
      {
        label: "Session",
        href: "/training-plans/[id]/session",
        isCurrent: true,
      },
    ],
  },
  "/settings": {
    title: "Settings",
    description: "Manage your account settings",
    breadcrumbs: [
      {
        label: "Settings",
        href: "/settings",
        isCurrent: true,
      },
    ],
  },
};
