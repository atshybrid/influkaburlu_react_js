export default function Footer() {
  return (
    <footer className="border-t border-gray-100 mt-16 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-10 text-sm text-gray-500 flex flex-col md:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} Kaburlu. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a className="hover:text-gray-700" href="#features">Features</a>
          <a className="hover:text-gray-700" href="#pricing">Pricing</a>
          <a className="hover:text-gray-700" href="#faq">FAQ</a>
        </div>
      </div>
    </footer>
  );
}
