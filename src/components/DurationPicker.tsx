import React, { useRef } from 'react';
import { ScrollView, View } from 'react-native';
import { Chip } from './Chip';

const EDGE_MARGIN = 16;

interface DurationPickerProps {
  options: number[];
  value: number;
  onChange(min: number): void;
  testIdFor(min: number): string;
}

export function DurationPicker({
  options,
  value,
  onChange,
  testIdFor,
}: DurationPickerProps) {
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const viewportWidth = useRef(0);
  const selectedRight = useRef<number | null>(null);
  const didInitialScroll = useRef(false);

  // Children and the ScrollView report layout in either order; scroll once both are known,
  // and only as far as needed to reveal the selected duration.
  const revealSelected = () => {
    if (
      didInitialScroll.current ||
      viewportWidth.current === 0 ||
      selectedRight.current === null
    )
      return;
    didInitialScroll.current = true;
    const overflow =
      selectedRight.current + EDGE_MARGIN - viewportWidth.current;
    if (overflow > 0)
      scrollRef.current?.scrollTo({ x: overflow, animated: false });
  };

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0 }}
      onLayout={e => {
        viewportWidth.current = e.nativeEvent.layout.width;
        revealSelected();
      }}
    >
      {options.map(m => (
        <View
          key={m}
          onLayout={e => {
            if (m !== value) return;
            selectedRight.current =
              e.nativeEvent.layout.x + e.nativeEvent.layout.width;
            revealSelected();
          }}
        >
          <Chip
            label={String(m)}
            selected={m === value}
            onPress={() => onChange(m)}
            testID={testIdFor(m)}
            accessibilityLabel={`${m} minutes`}
          />
        </View>
      ))}
    </ScrollView>
  );
}
