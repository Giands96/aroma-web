import Link from "next/link";
import Image from 'next/image';


export default function WhatsAppButton({ href }: { href: string }) {
    return(
        <div className="fixed bottom-4 right-4 z-50 bg-green-400 rounded-full p-2 shadow-lg hover:scale-105 transition-transform duration-300">
            <Link href={href} target="_blank" rel="noopener noreferrer" >
                <Image src='/whatsapp-icon.svg' alt="WhatsApp" width={50} height={50} />
            </Link>
        </div>
    )
}