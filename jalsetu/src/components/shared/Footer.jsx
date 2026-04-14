// src/components/shared/Footer.jsx
const WHATSAPP_NUMBER = '919999999999'; // Replace with your WhatsApp number
const SUPPORT_PHONE   = '+91 99999 99999';

export default function Footer() {
  return (
    <footer className="bg-jal-950 text-white mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid sm:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-jal-500 rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                <path d="M12 2 C12 2 4 12 4 17 A8 8 0 0 0 20 17 C20 12 12 2 12 2Z" />
              </svg>
            </div>
            <span className="font-display font-bold text-lg">JalSetu</span>
          </div>
          <p className="text-jal-300 text-sm leading-relaxed">
            Connecting households with trusted local water vendors. Pure water, delivered right.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="font-display font-semibold text-jal-100 mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm text-jal-300">
            <li><a href="/"       className="hover:text-white transition-colors">Home</a></li>
            <li><a href="/order"  className="hover:text-white transition-colors">Order Water</a></li>
            <li><a href="/auth"   className="hover:text-white transition-colors">Vendor Login</a></li>
            <li><a href="/admin"  className="hover:text-white transition-colors">Admin Panel</a></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="font-display font-semibold text-jal-100 mb-3">Support</h4>
          <div className="space-y-3">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 transition-colors text-white text-sm font-semibold px-4 py-2 rounded-xl w-fit"
            >
              💬 WhatsApp Support
            </a>
            <a
              href={`tel:${SUPPORT_PHONE}`}
              className="flex items-center gap-2 bg-jal-700 hover:bg-jal-600 transition-colors text-white text-sm font-semibold px-4 py-2 rounded-xl w-fit"
            >
              📞 {SUPPORT_PHONE}
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-jal-800 text-center py-4 text-jal-500 text-xs">
        © {new Date().getFullYear()} JalSetu. Made with 💙 in India.
      </div>
    </footer>
  );
}
