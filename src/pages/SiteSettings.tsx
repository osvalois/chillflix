import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Button,  
  useColorModeValue,
  Container,
  IconButton,
  useToast,
  Input,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Edit2, LogOut, Camera } from 'lucide-react';
import { getAuth, updateProfile, signOut } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const MotionBox = motion(Box);

interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string;
  bio: string;
  joinDate: string;
}

const SiteSettings = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  
  const auth = getAuth();
  const storage = getStorage();
  const db = getFirestore();
  const toast = useToast();
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        const userData = userDoc.data() as UserProfile;
        
        setUser({
          displayName: auth.currentUser.displayName || '',
          email: auth.currentUser.email || '',
          photoURL: auth.currentUser.photoURL || '',
          bio: userData?.bio || '',
          joinDate: userData?.joinDate || new Date().toISOString(),
        });
        
        setEditedProfile({
          displayName: auth.currentUser.displayName || '',
          email: auth.currentUser.email || '',
          photoURL: auth.currentUser.photoURL || '',
          bio: userData?.bio || '',
          joinDate: userData?.joinDate || new Date().toISOString(),
        });
      }
    };

    fetchUserProfile();
  }, [auth.currentUser]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    
    setLoading(true);
    try {
      const file = event.target.files[0];
      const storageRef = ref(storage, `profile-photos/${auth.currentUser?.uid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      
      await updateProfile(auth.currentUser!, { photoURL });
      setEditedProfile(prev => prev ? { ...prev, photoURL } : null);
      
      toast({
        title: "Photo updated successfully",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error uploading photo",
        status: "error",
        duration: 3000,
      });
    }
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!editedProfile || !auth.currentUser) return;
    
    setLoading(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: editedProfile.displayName,
        photoURL: editedProfile.photoURL,
      });
      
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        bio: editedProfile.bio,
        joinDate: editedProfile.joinDate,
      });
      
      setUser(editedProfile);
      setIsEditing(false);
      
      toast({
        title: "Profile updated successfully",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error updating profile",
        status: "error",
        duration: 3000,
      });
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed out successfully",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        status: "error",
        duration: 3000,
      });
    }
  };

  if (!user || !editedProfile) return null;

  return (
    <Container maxW="4xl" py={8}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        bg={useColorModeValue('white', 'gray.800')}
        borderRadius="xl"
        boxShadow="xl"
        p={8}
      >
        <VStack spacing={8} align="stretch">
          <HStack justify="space-between">
            <Text fontSize="2xl" fontWeight="bold">Profile Settings</Text>
            <IconButton
              aria-label="Sign out"
              icon={<LogOut />}
              onClick={handleSignOut}
              variant="ghost"
            />
          </HStack>

          <VStack spacing={6} align="center">
            <Box position="relative">
              <Avatar
                size="2xl"
                src={editedProfile.photoURL}
                name={editedProfile.displayName}
              />
              {isEditing && (
                <FormControl>
                  <FormLabel
                    htmlFor="photo-upload"
                    cursor="pointer"
                    position="absolute"
                    bottom={0}
                    right={0}
                    m={0}
                  >
                    <IconButton
                      aria-label="Upload photo"
                      icon={<Camera />}
                      isRound
                      size="sm"
                      colorScheme="purple"
                    />
                  </FormLabel>
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    display="none"
                  />
                </FormControl>
              )}
            </Box>

            {isEditing ? (
              <VStack spacing={4} w="full" maxW="md">
                <FormControl>
                  <FormLabel>Name</FormLabel>
                  <Input
                    value={editedProfile.displayName}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      displayName: e.target.value
                    })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Bio</FormLabel>
                  <Input
                    value={editedProfile.bio}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      bio: e.target.value
                    })}
                  />
                </FormControl>

                <HStack spacing={4}>
                  <Button
                    colorScheme="purple"
                    onClick={handleSaveProfile}
                    isLoading={loading}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedProfile(user);
                    }}
                  >
                    Cancel
                  </Button>
                </HStack>
              </VStack>
            ) : (
              <VStack spacing={4}>
                <Text fontSize="xl" fontWeight="semibold">
                  {user.displayName}
                </Text>
                <Text color="gray.500">{user.email}</Text>
                <Text textAlign="center">{user.bio}</Text>
                <Button
                  leftIcon={<Edit2 size={16} />}
                  onClick={() => setIsEditing(true)}
                  colorScheme="purple"
                >
                  Edit Profile
                </Button>
              </VStack>
            )}
          </VStack>
        </VStack>
      </MotionBox>
    </Container>
  );
};

export default SiteSettings;