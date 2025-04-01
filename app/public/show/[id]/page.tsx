import PublicShowClient from './PublicShowClient';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <PublicShowClient id={resolvedParams.id} />;
} 