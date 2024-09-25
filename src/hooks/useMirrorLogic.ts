import { useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';

export const useMirrorLogic = () => {
  const [currentMirrorIndex, setCurrentMirrorIndex] = useState(0);
  const [isChangingMirror, setIsChangingMirror] = useState(false);
  const toast = useToast();

  const handleChangeMirror = useCallback((totalMirrors: number) => {
    if (currentMirrorIndex < totalMirrors - 1) {
      setIsChangingMirror(true);
      setCurrentMirrorIndex(prevIndex => prevIndex + 1);
      toast({
        title: 'Changing Mirror',
        description: 'Attempting to load video from a different source...',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'No more mirrors',
        description: 'There are no more available mirrors for this movie.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [currentMirrorIndex, toast]);

  return {
    currentMirrorIndex,
    setCurrentMirrorIndex,
    isChangingMirror,
    setIsChangingMirror,
    handleChangeMirror,
  };
};