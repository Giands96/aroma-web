import { notFound } from "next/navigation";
import { getProductById } from "@/app/shared/services/products.service";
import ProductForm from "../../../_components/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="font-dm-sans text-sm font-medium text-zinc-500">Catálogo</p>
        <h1 className="mt-1 font-dm-sans text-2xl font-semibold tracking-tight text-zinc-950">Editar producto</h1>
      </div>
      <ProductForm product={product} />
    </div>
  );
}
