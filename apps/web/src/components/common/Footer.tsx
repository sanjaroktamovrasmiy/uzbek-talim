import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Send } from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';

export function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <BrandLogo 
              to="/" 
              imgClassName="h-12 w-12" 
              className="mb-4" 
              showFallbackText={false}
            />
            <p className="text-slate-400 text-sm leading-relaxed">
              Professional ta'lim markazi. Sifatli ta'lim - yorug' kelajak!
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Tezkor havolalar</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/courses" className="text-slate-400 hover:text-primary-400 transition-colors text-sm">
                  Kurslar
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-400 hover:text-primary-400 transition-colors text-sm">
                  Biz haqimizda
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-primary-400 transition-colors text-sm">
                  Bog'lanish
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Aloqa</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-slate-400 text-sm">
                <Phone className="w-4 h-4 text-primary-400" />
                <a href="tel:+998944758090" className="hover:text-primary-400 transition-colors">
                  +998 94 475 80 90
                </a>
              </li>
              <li className="flex items-center gap-2 text-slate-400 text-sm">
                <Mail className="w-4 h-4 text-primary-400" />
                info@uzbektalim.uz
              </li>
              <li className="flex items-center gap-2 text-slate-400 text-sm">
                <MapPin className="w-4 h-4 text-primary-400" />
                Samarqand shahri
              </li>
            </ul>
          </div>

          {/* Telegram */}
          <div>
            <h4 className="font-semibold text-white mb-4">Telegram</h4>
            <p className="text-slate-400 text-sm mb-4">
              Telegram botimiz orqali ham ro'yxatdan o'ting!
            </p>
            <a
              href="https://t.me/uzbektalim_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm"
            >
              <Send className="w-4 h-4" />
              Telegram Bot
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-500 text-sm">
          © 2025 Uzbek Ta'lim. Barcha huquqlar himoyalangan.
        </div>
      </div>
    </footer>
  );
}

