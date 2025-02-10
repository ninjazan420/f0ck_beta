import { Metadata } from "next";
import { PoolDetails } from "../components/PoolDetails";

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Warte auf die params
  const id = (await params).id;

  return {
    title: `Pool #${id} - f0ck beta v1`,
    description: `View collection #${id} and its contents.`,
  };
}

export default async function Pool({ params }: Props) {
  // Warte auf die params
  const id = (await params).id;

  return (
    <div className="container mx-auto px-4 py-6">
      <PoolDetails poolId={id} />
    </div>
  );
}
