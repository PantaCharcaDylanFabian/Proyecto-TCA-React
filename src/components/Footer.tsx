import React, { useState } from 'react';
import { useUI } from '../context/UIContext';

export const Footer: React.FC = () => {
  const { navigate } = useUI();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#6b6b6b] border-t-4 border-[#C32228] text-white pt-10 pb-28 md:pb-32 px-5 mt-16 font-sans">
      <div className="max-w-[950px] mx-auto flex justify-between items-center flex-wrap gap-10">
        {/* Left Column */}
        <div className="flex flex-col gap-7 sm:gap-9 max-w-[550px] w-full">
          <p className="text-base m-0 tracking-wide font-normal">
            <strong className="font-bold text-white mr-2">CONTÁCTANOS</strong> 5555555-5555
          </p>

          <div className="flex items-center flex-wrap gap-4 text-sm sm:text-base">
            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-white hover:text-amber-200 hover:scale-110 transition-all p-1"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-white hover:text-amber-200 hover:scale-110 transition-all p-1"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>

            <div className="flex items-center gap-2 text-sm text-gray-200 ml-1">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span>atencionalcliente@tca.com.pe</span>
            </div>
          </div>

          <div>
            <p className="text-sm sm:text-base m-0 mb-3 text-gray-100">
              ¡Regístrate para recibir nuestras mejores <strong className="font-bold text-amber-300">ofertas y regalos!</strong>
            </p>
            {subscribed ? (
              <div className="bg-emerald-600 text-white font-bold py-3 px-6 rounded-full inline-block text-sm shadow-md">
                ✓ ¡Gracias por suscribirte a Distribuidora TCA!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex max-w-[500px] w-full bg-white rounded-full overflow-hidden shadow-lg border-2 border-transparent focus-within:border-amber-400 transition-colors">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="TuNegocio@nosimporta.com"
                  required
                  className="flex-1 py-3.5 px-5 border-none outline-none text-sm text-gray-800 bg-transparent placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="bg-[#C32228] hover:bg-[#a00000] text-white font-extrabold text-sm sm:text-base px-6 py-2 border-none cursor-pointer transition-colors tracking-wide"
                >
                  Suscribirme
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col items-center justify-center gap-9 mx-auto sm:mx-0">
          <a
            href="#libro-reclamaciones"
            onClick={(e) => {
              e.preventDefault();
              alert('Libro de Reclamaciones Virtual - Distribuidora TCA disponible en ventanilla física y plataforma online.');
            }}
            className="flex flex-col items-center text-white no-underline text-center text-xs sm:text-sm font-bold tracking-widest hover:scale-105 transition-transform"
          >
            <svg viewBox="0 0 24 24" width="65" height="65" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2 text-amber-200">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
            <span>LIBRO DE<br />RECLAMACIONES</span>
          </a>

          <a
            href="nosotros.html"
            onClick={(e) => {
              e.preventDefault();
              navigate('nosotros.html');
            }}
            className="text-white hover:text-amber-200 no-underline text-sm sm:text-base font-bold tracking-wider uppercase hover:underline transition-colors"
          >
            Conoce sobre nosotros
          </a>
        </div>
      </div>
    </footer>
  );
};
