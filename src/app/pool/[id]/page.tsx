import { Metadata } from "next";
import { PoolDetails } from "../components/PoolDetails";

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Pool #${params.id} - f0ck beta v1`,
    description: `View collection #${params.id} and its contents.`,
  };
}

export default async function Pool({ params }: Props) {
  return (
    <div className="container mx-auto px-4 py-6">
      <PoolDetails poolId={params.id} />
    </div>
  );
}
