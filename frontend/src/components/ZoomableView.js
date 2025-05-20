import React, { useRef } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const ZoomableView = ({ children, style }) => {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const pinchRef = useRef();

  const onPinchGestureEvent = (event) => {
    scale.value = savedScale.value * event.nativeEvent.scale;
  };

  const onPinchStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      const newScale = Math.max(1, Math.min(scale.value, 3)); // Limit zoom between 1x and 3x
      scale.value = withSpring(newScale);
      savedScale.value = newScale;
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <PinchGestureHandler
      ref={pinchRef}
      onGestureEvent={onPinchGestureEvent}
      onHandlerStateChange={onPinchStateChange}
    >
      <Animated.View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.scrollContainer, style]}
          horizontal
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          maximumZoomScale={3}
          minimumZoomScale={1}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            bounces={false}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[
                styles.container,
                animatedStyle,
                { minWidth: `${100 * scale.value}%`, minHeight: `${100 * scale.value}%` },
              ]}
            >
              {children}
            </Animated.View>
          </ScrollView>
        </ScrollView>
      </Animated.View>
    </PinchGestureHandler>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'white', // Add a background color for visibility
  },
});

export default ZoomableView;