// src/components/WatchParty/ChatRoom.tsx
import React, { useState, useEffect } from 'react';
import { Box, VStack, Input, Button, Text } from '@chakra-ui/react';

interface Message {
  user_id: string;
  message: string;
  timestamp: number;
}

export const ChatRoom: React.FC<{ partyId: string; userId: string }> = ({ partyId, userId }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState<WebSocket | null>(null);
  
    useEffect(() => {
      const ws = new WebSocket(`ws://127.0.0.1:9090/ws/${partyId}`);
      
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, message]);
      };
  
      setSocket(ws);
  
      return () => {
        ws.close();
      };
    }, [partyId]);
  
    const sendMessage = () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        const message = {
          user_id: userId,
          message: newMessage,
          watch_party_id: partyId,
        };
        socket.send(JSON.stringify(message));
        setNewMessage('');
      }
    };
  
    return (
      <Box>
        <VStack spacing={4} align="stretch" h="300px" overflowY="auto" mb={4}>
          {messages.map((msg, index) => (
            <Text key={index} alignSelf={msg.user_id === userId ? "flex-end" : "flex-start"} bg={msg.user_id === userId ? "blue.500" : "gray.500"} p={2} borderRadius="md">
              {msg.message}
            </Text>
          ))}
        </VStack>
        <Box>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            mr={2}
          />
          <Button onClick={sendMessage} colorScheme="blue">
            Send
          </Button>
        </Box>
      </Box>
    );
  };