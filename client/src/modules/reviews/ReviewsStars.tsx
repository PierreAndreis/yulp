import React, { useState } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { Stack, StackProps, Box } from '@chakra-ui/react';

function ReviewsStars(
  props: {
    value: number;
    onChange?: (value: number) => void;
  } & Omit<StackProps, 'onChange'>,
) {
  const [isHoveringAt, setHover] = useState<number | null>(null);

  function onHover(star: number) {
    // Only use onHover if there is an onClick event for the user to click
    if (props.onChange) {
      setHover(star);
    }
  }

  const { value, onChange, ...otherProps } = props;

  return (
    <Stack direction="row" fontSize={'15px'} spacing={0} color="yellow.400" {...otherProps} shouldWrapChildren>
      {[1, 2, 3, 4, 5].map((count) => {
        // If the user is hovering into a star,
        // Then show what it will look like if they click on it
        const value = isHoveringAt || props.value;

        let StarComponent = <FaRegStar />;

        if (value >= count) StarComponent = <FaStar />;
        else if (value > count - 1) StarComponent = <FaStarHalfAlt />;

        return (
          <Box
            key={count}
            onClick={() => onChange?.(count)}
            cursor={onChange ? 'pointer' : 'initial'}
            onMouseOver={() => onHover(count)}
            onMouseOut={() => setHover(null)}
          >
            {StarComponent}
          </Box>
        );
      })}
    </Stack>
  );
}

export default ReviewsStars;
