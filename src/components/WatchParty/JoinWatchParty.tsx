// src/components/WatchParty/JoinWatchParty.tsx
import React from 'react';
import { useMutation } from 'react-query';
import { Button, useToast } from '@chakra-ui/react';
import axios from 'axios';

interface JoinWatchPartyProps {
  onJoin: () => void;
}

const joinWatchParty = async ({ partyId, userId }: { partyId: string; userId: string }) => {
  const response = await axios.post(`http://127.0.0.1:9090/party/${partyId}/join`, { id: userId });
  return response.data;
};

export const JoinWatchParty: React.FC<JoinWatchPartyProps> = ({ onJoin }) => {
  const toast = useToast();
  const mutation = useMutation(joinWatchParty, {
    onSuccess: () => {
      onJoin();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to join Watch Party. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  });

  const handleJoin = () => {
    // You'll need to implement a way to get the partyId and userId
    const partyId = "party-id"; // This should be dynamically set
    const userId = "user-id"; // This should come from your auth system
    mutation.mutate({ partyId, userId });
  };

  return (
    <Button onClick={handleJoin} isLoading={mutation.isLoading} colorScheme="purple" size="sm">
      Join Watch Party
    </Button>
  );
};
