import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { StatusBar } from './StatusBar';
import { Container } from './Container';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8">
        <Container>
          {children}
        </Container>
      </main>
      <Footer />
      <StatusBar />
    </div>
  );
}