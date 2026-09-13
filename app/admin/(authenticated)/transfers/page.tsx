import { getTransferOptions } from "@/lib/actions/transfers";
import { TransfersEditor } from "./transfers-editor";

export const dynamic = "force-dynamic";

export default async function TransfersPage() {
  const options = await getTransferOptions();
  return (
    <TransfersEditor
      options={options.map((o) => ({
        id: o.id,
        name: o.name,
        details: o.details ?? "",
        conditions: o.conditions ?? "",
        policy: o.policy ?? "",
        sortOrder: o.sortOrder,
        isActive: o.isActive,
        packageCount: o._count.packages,
      }))}
    />
  );
}
