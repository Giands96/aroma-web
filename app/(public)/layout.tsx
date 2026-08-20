import Navbar from "@/app/shared/components/Navbar";
import React, { ReactNode } from "react";
import Footer from '../shared/components/Footer';
import WhatsAppButton from './../shared/components/ui/WhatsAppButton';


interface HomeLayoutProps {
  children: ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutProps) {
  return (
    <main>
      <header>
        <Navbar/>
      </header>

      {children}

      <WhatsAppButton href="https://wa.me/1234567890"/>
      <footer>
        <Footer/>
      </footer>
    </main>
  );
}
