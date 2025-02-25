import { PoolDetails } from "./PoolDetails";
import { PoolNavigation } from "../components/PoolNavigation";

interface Props {
  params: Promise<{ id: string }>
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
