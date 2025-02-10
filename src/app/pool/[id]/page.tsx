import { Metadata } from "next";
import { PoolDetails } from "./PoolDetails";

export const metadata: Metadata = {
  title: "Pool Details - f0ck beta v1",
  description: "View pool contents and details"
};

export default function Pool({ params }: { params: { id: string } }) {
  return <PoolDetails poolId={params.id} />;
}
