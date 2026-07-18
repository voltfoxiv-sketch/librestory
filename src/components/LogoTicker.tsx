
const LOGOS = [
  { name: 'OpenAI', type: 'text', style: 'font-sans font-bold tracking-tighter' },
  { name: 'Anthropic', type: 'img', src: 'https://cdn.simpleicons.org/anthropic/000000' },
  { name: 'Google Gemini', type: 'img', src: 'https://cdn.simpleicons.org/googlegemini/000000' },
  { name: 'Meta Llama', type: 'img', src: 'https://cdn.simpleicons.org/meta/000000' },
  { name: 'Mistral AI', type: 'img', src: 'https://cdn.simpleicons.org/mistralai/000000' },
  { name: 'DeepSeek', type: 'img', src: 'https://cdn.simpleicons.org/deepseek/000000' },
  { name: 'Cohere', type: 'text', style: 'font-serif font-black italic tracking-tighter' },
  { name: 'Perplexity', type: 'img', src: 'https://cdn.simpleicons.org/perplexity/000000' },
  { name: 'Hugging Face', type: 'img', src: 'https://cdn.simpleicons.org/huggingface/000000' },
  { name: 'xAI', type: 'img', src: 'https://cdn.simpleicons.org/x/000000' },
  { name: 'AI21 Labs', type: 'text', style: 'font-sans font-black' },
]

export default function LogoTicker() {
  return (
    <div className="w-full py-6 border-y border-stone-200 bg-white/50 backdrop-blur-sm overflow-hidden flex flex-col items-center gap-4 relative">
      <div className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Powered by every LLM on OpenRouter</div>

      {/* smooth gradient fade on the edges so it doesn't pop in weirdly */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-stone-50 to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-stone-50 to-transparent z-10" />

      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {/* repeat the array 3 times so the marquee loop is perfectly seamless */}
        {[...LOGOS, ...LOGOS, ...LOGOS].map((logo, idx) => (
          <div key={`${logo.name}-${idx}`} className="flex items-center justify-center w-40 opacity-40 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 cursor-pointer">
            {logo.type === 'img' ? (
              <img src={logo.src} alt={logo.name} className="h-7 object-contain" />
            ) : (
              <span className={`text-xl text-stone-900 ${logo.style}`}>{logo.name}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
