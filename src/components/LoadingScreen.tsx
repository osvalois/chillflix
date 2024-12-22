import { Player } from "@lottiefiles/react-lottie-player";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
      {/* Glassmorphic container */}
      <div className="relative backdrop-blur-lg bg-white/10 rounded-xl p-8 shadow-2xl">
        {/* Animation container */}
        <div className="text-center relative z-10">
          <Player
            autoplay
            loop
            src="/animations/loading-animation.json"
            className="h-32 w-32"
          />
          <p className="mt-4 text-gray-300 font-medium">Loading amazing content...</p>
        </div>
        
        {/* Skeleton loading indicators */}
        <div className="mt-8 space-y-4">
          <div className="flex space-x-4">
            <div className="w-16 h-16 bg-gray-700/50 rounded-lg animate-pulse" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-700/50 rounded animate-pulse" />
              <div className="h-4 bg-gray-700/50 rounded w-5/6 animate-pulse" />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-700/50 rounded-lg animate-pulse" />
            ))}
          </div>
          
          <div className="h-4 bg-gray-700/50 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-gray-700/50 rounded w-1/2 animate-pulse" />
        </div>
      </div>
      
      {/* Background gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
    </div>
  );
};

export default LoadingScreen;