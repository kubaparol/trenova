export type PageProps = {
  params?: { id: string; page: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export type ServerActionResponse = {
  success: boolean;
  message?: string;
};
