import React from 'react';
import { Input, InputProps } from '@chakra-ui/react';
import { animated } from 'react-spring';

export const AnimatedInput = animated(Input) as React.FC<InputProps & { style: any }>;