import { Metadata } from 'next';
import { PoolDetails } from "./PoolDetails";
import { PoolNavigation } from "../components/PoolNavigation";

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Pool #${id} - f0ck beta v1`,
    description: `View collection #${id} and its contents.`,
  };
}

export default async function Pool({ params }: Props) {
  const { id } = await params;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <PoolNavigation currentId={id} />
      <PoolDetails poolId={id} />
    </div>
  );
}
