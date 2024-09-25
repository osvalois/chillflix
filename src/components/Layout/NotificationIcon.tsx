// NotificationIcon.tsx
import React from "react";
import { IconButton, Badge, Box, Popover, PopoverTrigger, PopoverContent, PopoverBody, List, ListItem, Text, VStack } from "@chakra-ui/react";
import { BellIcon } from "@chakra-ui/icons";
import GlassmorphicBox from "../UI/GlassmorphicBox";

interface Notification {
  id: number;
  title: string;
  description: string;
}

const notifications: Notification[] = [
  { id: 1, title: "Nueva serie recomendada", description: "Basado en tus gustos" },
  { id: 2, title: "Continúa viendo", description: "Te quedaste en el episodio 5" },
];

const NotificationIcon: React.FC = () => {
  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <Box position="relative">
          <IconButton
            as={GlassmorphicBox}
            aria-label="Notificaciones"
            icon={<BellIcon />}
            variant="ghost"
          />
          {notifications.length > 0 && (
            <Badge
              position="absolute"
              top="-1"
              right="-1"
              px={2}
              py={1}
              fontSize="xs"
              fontWeight="bold"
              colorScheme="red"
              borderRadius="full"
            >
              {notifications.length}
            </Badge>
          )}
        </Box>
      </PopoverTrigger>
      <PopoverContent
        as={GlassmorphicBox}
        border="none"
        mt={2}
      >
        <PopoverBody>
          <List spacing={3}>
            {notifications.map((notif) => (
              <ListItem key={notif.id}>
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold">{notif.title}</Text>
                  <Text fontSize="sm" opacity={0.8}>{notif.description}</Text>
                </VStack>
              </ListItem>
            ))}
          </List>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationIcon;