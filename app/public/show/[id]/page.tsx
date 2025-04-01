import PublicShowClient from './PublicShowClient';

export default function Page({ params }: { params: { id: string } }) {
  return <PublicShowClient id={params.id} />;
} 