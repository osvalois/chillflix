import React from 'react';
import { Tooltip } from '@chakra-ui/react';
import { FaFilm, FaTv } from 'react-icons/fa';

import { AnimatedIconButton } from '../AnimatedIconButton';
import { ContentType } from '../../types';


interface ContentTypeToggleProps {
  activeContentType: ContentType;
  onToggle: () => void;
  iconColor: string;
  activeIconColor: string;
}

export const ContentTypeToggle: React.FC<ContentTypeToggleProps> = ({
  activeContentType,
  onToggle,
  iconColor,
  activeIconColor,
}) => {
  return (
    <Tooltip label="Toggle content type" placement="bottom">
      <AnimatedIconButton
        aria-label="Toggle content type"
        icon={activeContentType === ContentType.Movie ? <FaFilm /> : <FaTv />}
        onClick={onToggle}
        size="sm"
        variant="ghost"
        color={iconColor}
        _hover={{ bg: 'transparent', color: activeIconColor }}
        _active={{ bg: 'transparent' }}
      />
    </Tooltip>
  );
};