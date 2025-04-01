import PublicShowClient from './PublicShowClient';

interface PageProps {
  params: {
    id: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function Page({ params }: PageProps) {
  return <PublicShowClient id={params.id} />;
} 