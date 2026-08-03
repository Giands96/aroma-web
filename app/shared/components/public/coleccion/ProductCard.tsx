'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface ProductCardProps {
    id: string;
    imageSrc: string;
    nombre: string;
    precio: number;
}

export default function ProductCard({ id, imageSrc, nombre, precio }: ProductCardProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    return (
        <Link href={`/coleccion/${id}`} className="flex flex-col gap-2">
            <div className="relative w-full aspect-square bg-white overflow-hidden">
                {isLoading && (
                    <div className="absolute inset-0 animate-pulse bg-neutral-200" />
                )}

                {!hasError ? (
                    <Image
                        className={`object-cover transition-opacity duration-300 ${
                            isLoading ? 'opacity-0' : 'opacity-100'
                        }`}
                        src={imageSrc}
                        alt={nombre}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        onLoad={() => setIsLoading(false)}
                        onError={() => {
                            setIsLoading(false);
                            setHasError(true);
                        }}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 text-neutral-400 text-sm">
                        Sin imagen
                    </div>
                )}
            </div>

            <div className="text-center">
                <h3 className="text-hard-brown text-3xl">{nombre}</h3>
                <p className="text-neutral-700 text-xl font-semibold font-dm-sans">S/ {precio}</p>
            </div>
        </Link>
    );
}