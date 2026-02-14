import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-16 pb-12">
      {/* Hero */}
      <div className="relative text-center pt-12 pb-8">
        {/* Animated gradient blob */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] opacity-30 blur-[100px] pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-500 rounded-full animate-blob" />
        </div>

        <div className="relative">
          <div className="animate-fade-up">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-6">
              AI-Powered Teaching Slides
            </span>
          </div>

          <h1 className="animate-fade-up stagger-1 text-5xl md:text-6xl font-heading font-extrabold tracking-tight mb-5">
            <span className="text-zinc-100">Turn ideas into</span>
            <br />
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-300 bg-clip-text text-transparent">
              interactive decks
            </span>
          </h1>

          <p className="animate-fade-up stagger-2 text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Upload a presentation or describe a topic. Get a polished, self-contained
            HTML slide deck with diagrams, callouts, and keyboard navigation.
          </p>

          <div className="animate-fade-up stagger-3 flex items-center justify-center gap-3 mt-8">
            <Link
              href="/generate"
              className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-600/20 hover:shadow-orange-500/30 text-sm"
            >
              Start generating
            </Link>
            <Link
              href="/gallery"
              className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-xl transition-all border border-zinc-700 text-sm"
            >
              View gallery
            </Link>
          </div>
        </div>
      </div>

      {/* Two cards */}
      <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
        <Link
          href="/generate?mode=upload"
          className="group relative bg-zinc-900/80 border border-zinc-800 rounded-2xl p-7 hover:border-orange-500/30 transition-all duration-300 overflow-hidden animate-fade-up stagger-4"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-orange-400">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                <path d="M14 2v6h6" />
                <path d="M12 18v-6" />
                <path d="m9 15 3-3 3 3" />
              </svg>
            </div>
            <h2 className="text-xl font-heading font-bold text-zinc-100 mb-2">
              Upload File
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              Upload a PPTX or PDF to convert into an interactive deck. Content is extracted and enhanced with diagrams and explanations.
            </p>
            <span className="text-xs font-medium text-orange-400 group-hover:text-orange-300 transition-colors">
              .pptx and .pdf supported &rarr;
            </span>
          </div>
        </Link>

        <Link
          href="/generate?mode=topic"
          className="group relative bg-zinc-900/80 border border-zinc-800 rounded-2xl p-7 hover:border-amber-500/30 transition-all duration-300 overflow-hidden animate-fade-up stagger-5"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400">
                <path d="M12 20h9" />
                <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838.838-2.872a2 2 0 0 1 .506-.855Z" />
              </svg>
            </div>
            <h2 className="text-xl font-heading font-bold text-zinc-100 mb-2">
              Enter a Topic
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              Describe any topic and get a complete teaching deck with visual aids, structured explanations, and callout boxes.
            </p>
            <span className="text-xs font-medium text-amber-400 group-hover:text-amber-300 transition-colors">
              Any academic topic &rarr;
            </span>
          </div>
        </Link>
      </div>

      {/* Features */}
      <div className="max-w-3xl mx-auto animate-fade-up stagger-6">
        <div className="text-center mb-8">
          <h3 className="text-sm font-heading font-semibold text-zinc-500 uppercase tracking-widest">What you get</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { icon: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z M12 8v4l2 2', label: 'Dark-themed design' },
            { icon: 'M4 7h16 M4 12h16 M4 17h10', label: 'Visual aids & diagrams' },
            { icon: 'M5 12h14 M12 5v14', label: 'Keyboard navigation' },
            { icon: 'M9 5l7 7-7 7', label: 'Step-by-step reveals' },
            { icon: 'M12 2L2 7l10 5 10-5-10-5Z M2 17l10 5 10-5 M2 12l10 5 10-5', label: 'Key idea boxes' },
            { icon: 'M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z', label: 'Self-contained HTML' },
          ].map((feat, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-500 flex-shrink-0">
                <path d={feat.icon} />
              </svg>
              <span className="text-sm text-zinc-400">{feat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
