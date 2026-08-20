import ProductForm from "../../_components/ProductForm";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-dm-sans text-sm font-medium text-zinc-500">Catálogo</p>
        <h1 className="mt-1 font-dm-sans text-2xl font-semibold tracking-tight text-zinc-950">Nuevo producto</h1>
      </div>
      <ProductForm />
    </div>
  );
}
