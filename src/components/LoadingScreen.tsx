import { Player } from "@lottiefiles/react-lottie-player";

// src/components/LoadingScreen.tsx
export const LoadingScreen: React.FC = () => {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-center">
          <Player
            autoplay
            loop
            src="/animations/loading-animation.json"
            style={{ height: '120px', width: '120px' }}
          />
          <p className="mt-4 text-gray-400">Loading amazing content...</p>
        </div>
      </div>
    );
  };