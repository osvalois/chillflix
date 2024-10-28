import React, { useState } from 'react';
import { useMutation } from 'react-query';
import axios from 'axios';
import { motion } from 'framer-motion';

interface CreateWatchPartyProps {
  movieId: string;
  onWatchPartyCreated: (partyId: string) => void;
}

interface CreateWatchPartyRequest {
  movie_id: string;
  users: string[];
}

const createWatchParty = async (request: CreateWatchPartyRequest) => {
  const response = await axios.post('http://127.0.0.1:9090/party/create', request);
  return response.data;
};

export const CreateWatchParty: React.FC<CreateWatchPartyProps> = ({ movieId, onWatchPartyCreated }) => {
  const [userId, setUserId] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const mutation = useMutation(createWatchParty, {
    onSuccess: (data) => {
      onWatchPartyCreated(data.id);
      // Toast notification logic would go here
    },
    onError: (error) => {
      console.log(error)
      // Error handling logic would go here
    }
  });

  const handleCreateParty = () => {
    if (!userId) {
      // Show error message
      return;
    }

    const request: CreateWatchPartyRequest = {
      movie_id: movieId,
      users: [userId]
    };
    mutation.mutate(request);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      <motion.div
        className="p-8 rounded-xl bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Create Watch Party</h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-white bg-opacity-20 backdrop-filter backdrop-blur-sm text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
          />
        </div>
        <motion.button
          onClick={handleCreateParty}
          disabled={mutation.isLoading}
          className={`w-full py-2 rounded-md text-white font-semibold transition-all duration-300 ${
            isHovered ? 'bg-opacity-80' : 'bg-opacity-60'
          } hover:bg-opacity-80 backdrop-filter backdrop-blur-sm ${
            mutation.isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          {mutation.isLoading ? 'Creating...' : 'Create Watch Party'}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default CreateWatchParty;