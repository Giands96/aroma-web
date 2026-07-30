import Navbar from "@/app/shared/components/Navbar";
import React, { ReactNode } from "react";
import Footer from '../shared/components/Footer';


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

      <footer>
        <Footer/>
      </footer>
    </main>
  );
}