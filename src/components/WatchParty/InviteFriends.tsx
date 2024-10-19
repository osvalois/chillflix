// src/components/WatchParty/InviteFriends.tsx
import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { Box, Button, Input, VStack, useToast } from '@chakra-ui/react';
import axios from 'axios';

const inviteFriend = async ({ partyId, friendId }: { partyId: string; friendId: string }) => {
  const response = await axios.post(`http://127.0.0.1:9090/party/${partyId}/invite`, { friend_id: friendId });
  return response.data;
};

export const InviteFriends: React.FC<{ partyId: string }> = ({ partyId }) => {
  const [friendId, setFriendId] = useState('');
  const toast = useToast();
  const mutation = useMutation(inviteFriend, {
    onSuccess: () => {
      toast({
        title: "Invitation Sent",
        description: "Your friend has been invited to the Watch Party!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setFriendId('');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to invite friend. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ partyId, friendId });
  };

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <VStack spacing={2}>
          <Input
            value={friendId}
            onChange={(e) => setFriendId(e.target.value)}
            placeholder="Enter Friend's ID"
            size="sm"
          />
          <Button type="submit" isLoading={mutation.isLoading} size="sm" colorScheme="green">
            Invite Friend
          </Button>
        </VStack>
      </form>
    </Box>
  );
};