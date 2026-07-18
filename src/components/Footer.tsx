
export default function Footer() {
  // just the standard landing page footer boilerplate
  return (
    <footer className="w-full border-t border-stone-200 bg-stone-50 pt-12 pb-8 px-6 lg:px-12 shrink-0">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 justify-between">

        <div className="flex flex-col gap-4 max-w-xs">
          <div className="flex items-center gap-3">
            <img src="./ligvioo.png" alt="LibreStory" className="h-8 invert opacity-90" />
            <span className="!font-serif tracking-[0.2em] font-bold text-stone-900 text-sm">LIBRE STORY</span>
          </div>
          <p className="text-stone-600 text-xs leading-relaxed font-medium">
            Your Story. Your Rules.
          </p>
        </div>

        <div className="flex flex-wrap md:flex-nowrap gap-12 md:gap-24">

          <div className="flex flex-col gap-4">
            <h4 className="text-[10px] font-bold tracking-widest text-stone-500 uppercase">Project</h4>
            <div className="flex flex-col gap-2.5">
              <a href="https://github.com/voltfoxiv-sketch/librestory" target="_blank" rel="noreferrer" className="text-xs font-semibold text-stone-600 hover:text-orange-600 transition-colors">
                GitHub
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-[10px] font-bold tracking-widest text-stone-500 uppercase">Documentation</h4>
            <div className="flex flex-col gap-2.5">
              <a href="#" className="text-xs font-semibold text-stone-600 hover:text-orange-600 transition-colors">Migration Guide</a>
              <a href="#" className="text-xs font-semibold text-stone-600 hover:text-orange-600 transition-colors">API Setup</a>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-[10px] font-bold tracking-widest text-stone-500 uppercase">Community</h4>
            <div className="flex flex-col gap-2.5">
              <a href="#" className="text-xs font-semibold text-stone-600 hover:text-orange-600 transition-colors">Discord</a>
              <a href="#" className="text-xs font-semibold text-stone-600 hover:text-orange-600 transition-colors">Subreddit</a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-stone-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-[10px] text-stone-500 font-semibold tracking-wider">
          © {new Date().getFullYear()} Libre Story. All rights reserved. <span className="mx-2">|</span> <a href="mailto:support@librestory.com" className="hover:text-stone-900 transition-colors">support@librestory.com</a>
        </p>
        <div className="flex items-center gap-6">
          <a href="/tos" className="text-[10px] text-stone-500 hover:text-stone-900 font-bold tracking-widest uppercase transition-colors">Terms of Service</a>
          <a href="/privacy" className="text-[10px] text-stone-500 hover:text-stone-900 font-bold tracking-widest uppercase transition-colors">Privacy Policy</a>
        </div>
      </div>
    </footer>
  )
}
