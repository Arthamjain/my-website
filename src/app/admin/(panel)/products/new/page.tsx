import ProductEditor from "@/components/admin/ProductEditor";
import { adminBase } from "@/lib/auth";

export default function NewProduct() {
  return <ProductEditor base={adminBase()} />;
}
