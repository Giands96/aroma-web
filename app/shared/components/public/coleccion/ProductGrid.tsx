import React from "react";
import ProductCard from "./ProductCard";

export default function ProductGrid() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <ProductCard id="1" imageSrc="/product1.png" nombre="Producto 1" precio={100}/>
            <ProductCard id="2" imageSrc="/product2.png" nombre="Producto 2" precio={200}/>
            <ProductCard id="3" imageSrc="/product3.png" nombre="Producto 3" precio={300}/>
            <ProductCard id="4" imageSrc="/product4.png" nombre="Producto 4" precio={400}/>
            <ProductCard id="5" imageSrc="/product1.png" nombre="Producto 1" precio={100}/>
            <ProductCard id="6" imageSrc="/product2.png" nombre="Producto 2" precio={200}/>
            <ProductCard id="7" imageSrc="/product3.png" nombre="Producto 3" precio={300}/>
            <ProductCard id="8" imageSrc="/product4.png" nombre="Producto 4" precio={400}/>
        </div>
    );
}