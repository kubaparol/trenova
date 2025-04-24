export type PageProps = {
  params: Promise<{ id: string; page: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export type ServerActionResponse = {
  success: boolean;
  message?: string;
};
