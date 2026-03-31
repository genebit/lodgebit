export default function PublicFooter() {
  return (
    <footer className="border-t border-stone-800 py-8 bg-stone-950">
      <div className="max-w-6xl mx-auto px-4 text-center text-sm text-stone-500">
        <p>&copy; {new Date().getFullYear()} Lodgebit. All rights reserved.</p>
      </div>
    </footer>
  );
}
