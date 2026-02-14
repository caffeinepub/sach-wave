export default function SplashScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-neon-blue via-neon-violet to-neon-purple overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-radial from-white/10 via-transparent to-transparent animate-pulse-slow" />
      
      {/* Logo container */}
      <div className="relative z-10 flex flex-col items-center animate-fade-in">
        <div className="relative mb-8">
          {/* Glow effect */}
          <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-violet opacity-60 animate-pulse-glow" />
          
          {/* Logo */}
          <img
            src="/assets/generated/sach-wave-logo-v2.dim_512x512.png"
            alt="Sach Wave"
            className="relative h-32 w-32 sm:h-40 sm:w-40 drop-shadow-2xl animate-scale-in"
          />
        </div>
        
        {/* App name */}
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2 animate-slide-up tracking-tight">
          Sach Wave
        </h1>
        <p className="text-white/80 text-lg animate-slide-up animation-delay-200">
          Connect. Share. Wave.
        </p>
      </div>
    </div>
  );
}
