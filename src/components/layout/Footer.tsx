import React from 'react';
import Image from 'next/image';
import { ExternalLink, Globe, Mail, Phone } from 'lucide-react';
import { Container } from './Container';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mfec-footer border-t border-gray-200 mt-auto">
      <Container className="py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* MFEC Branding */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-3">
              <Image
                src="/mfec-logo.png"
                alt="MFEC Logo"
                width={32}
                height={32}
                className="h-8 w-auto drop-shadow-sm"
              />
              <span className="text-lg font-semibold text-gray-900 tracking-tight">
                MFEC Public Company Limited
              </span>
            </div>
            <p className="text-sm text-gray-600 max-w-md">
              Leading technology solutions provider specializing in digital transformation, 
              system integration, and innovative software development.
            </p>
          </div>

          {/* Contact Information */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Contact Information
            </h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Globe className="h-4 w-4" />
                <a 
                  href="https://www.mfec.co.th" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary-600 transition-colors"
                >
                  www.mfec.co.th
                </a>
                <ExternalLink className="h-3 w-3" />
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>info@mfec.co.th</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>+66 (0) 2 513 2900</span>
              </div>
            </div>
          </div>

          {/* Application Information */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Application Info
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Thai Document Generator v1.0</p>
              <p>Automated documentation system</p>
              <p>Powered by AI technology</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-600">
              © {currentYear} MFEC Public Company Limited. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span>
                Generated documents include source attribution as required
              </span>
              <div className="flex items-center space-x-1">
                <span>Powered by</span>
                <Image
                  src="/mfec-logo.png"
                  alt="MFEC"
                  width={16}
                  height={16}
                  className="h-4 w-auto drop-shadow-sm"
                />
                <span className="font-medium text-primary-600">MFEC AI</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}