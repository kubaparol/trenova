import {
  Dumbbell,
  GalleryVerticalEnd,
  HomeIcon,
  LogOut,
  LucideIcon,
  SettingsIcon,
} from "lucide-react";

import { ProjectUrls } from "@/constants/urls";
import { signOut } from "@/db/actions/auth/sign-out";
import { useRouter } from "next/navigation";

export interface AppSidebarItem {
  title: string;
  icon: LucideIcon;
  url?: string;
  onClick?: () => void;
}

export const useAppSidebarItems = (): AppSidebarItem[] => {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();

    router.push(ProjectUrls.home);
  };

  return [
    {
      title: "Dashboard",
      icon: HomeIcon,
      url: ProjectUrls.dashboard,
    },
    {
      title: "Training Plans",
      icon: Dumbbell,
      url: ProjectUrls.trainingPlans,
    },
    {
      title: "Training History",
      icon: GalleryVerticalEnd,
      url: ProjectUrls.trainingHistory,
    },
    {
      title: "Settings",
      icon: SettingsIcon,
      url: ProjectUrls.settings,
    },
    {
      title: "Logout",
      icon: LogOut,
      onClick: handleLogout,
    },
  ];
};
