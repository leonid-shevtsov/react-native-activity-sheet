import * as React from "react";
import {
  Animated,
  Dimensions,
  Keyboard,
  KeyboardEvent,
  LayoutChangeEvent,
  Platform,
  ScaledSize,
  TouchableHighlight,
  TouchableWithoutFeedback,
  View,
  Text,
  useColorScheme
} from "react-native";

import actionSheetStyles, {
  darkPalette,
  lightPalette
} from "./actionSheetStyles";

const overlayBackgroundColor = "black";
const shadowColor = "black";
const fullOverlayOpacityLight = 0.2;
const fullOverlayOpacityDark = 0.5;
const appearDuration = 280;
const disappearDuration = 100;
const fadeInDuration = 50;
const fadeOutDuration = 200;
const minWidthForCentered = 800; // logical units? maybe adjust

const iphoneXHeight = 812;
const iphoneXMaxHeight = 896;
const iphoneXInset = 24;

type ActivitySheetProps<T> = {
  safeBottom?: boolean;
  showFrame?: boolean;
  dismiss(result: T | undefined): void;
  children: ({
    animateOut,
    isCentered
  }: {
    animateOut(result: T | undefined): void;
    isCentered: boolean;
  }) => JSX.Element;
  cancelText?: string;
  cancelColor?: string;
};

function SlideOutFromTheBottomModal<T>({
  safeBottom = true,
  showFrame = true,
  dismiss,
  children,
  cancelText = "Cancel",
  cancelColor = "#0076FF"
}: ActivitySheetProps<T>) {
  const opacity = React.useRef(new Animated.Value(0));

  const isDarkMode = useColorScheme() === "dark";
  const fullOverlayOpacity = isDarkMode
    ? fullOverlayOpacityDark
    : fullOverlayOpacityLight;

  const colors = isDarkMode ? darkPalette : lightPalette;

  const [keyboardY, setKeyboardY] = React.useState(-1);
  const [parentHeight, setParentHeight] = React.useState(-1);
  const [bottomOffset, setBottomOffset] = React.useState(-1);
  const [height, setHeight] = React.useState(-1);
  const [screenHeight, setScreenHeight] = React.useState(
    () => Dimensions.get("screen").height
  );

  React.useEffect(() => {
    const handler = ({ screen: { height } }: { screen: { height: number } }) =>
      setScreenHeight(height);
    Dimensions.addEventListener("change", handler);
    return () => Dimensions.removeEventListener("change", handler);
  }, []);

  // iphone X needs a special inset
  const bottomInset =
    Platform.OS === "ios" &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    (screenHeight === iphoneXHeight || screenHeight === iphoneXMaxHeight)
      ? iphoneXInset
      : 0;

  React.useEffect(() => {
    if (parentHeight < 0 || bottomInset < 0) {
      return;
    }
    if (keyboardY > 0 && keyboardY < parentHeight) {
      setBottomOffset(parentHeight - keyboardY);
    } else if (safeBottom) {
      setBottomOffset(bottomInset);
    } else {
      setBottomOffset(0);
    }
  }, [keyboardY, bottomInset, parentHeight, safeBottom]);

  const slideOutOffset = React.useRef(new Animated.Value(0));

  const animatingOutRef = React.useRef(false);

  React.useEffect(() => {
    if (animatingOutRef.current) {
      return;
    }
    if (height < 0 || bottomOffset < 0) {
      return;
    }
    Animated.parallel([
      Animated.timing(slideOutOffset.current, {
        toValue: 1,
        duration: appearDuration,
        useNativeDriver: true
      }),
      Animated.timing(opacity.current, {
        toValue: fullOverlayOpacity,
        duration: appearDuration,
        useNativeDriver: true
      })
    ]).start();
  }, [height, bottomOffset, fullOverlayOpacity]);

  const animateOut = (result: T | undefined) => {
    if (animatingOutRef.current) {
      return;
    }
    animatingOutRef.current = true;
    Animated.parallel([
      Animated.timing(slideOutOffset.current, {
        toValue: 0,
        duration: disappearDuration,
        useNativeDriver: true
      }),
      Animated.timing(opacity.current, {
        toValue: 0,
        duration: disappearDuration,
        useNativeDriver: true
      })
    ]).start(() => dismiss(result));
  };

  React.useEffect(() => {
    const handleKeyboardChange = (e: KeyboardEvent) =>
      setKeyboardY(e.endCoordinates.screenY);

    const subscriptions =
      Platform.OS === "ios"
        ? [
            Keyboard.addListener(
              "keyboardWillChangeFrame",
              handleKeyboardChange
            )
          ]
        : [
            Keyboard.addListener("keyboardDidHide", handleKeyboardChange),
            Keyboard.addListener("keyboardDidShow", handleKeyboardChange)
          ];

    return () => {
      subscriptions.forEach(s => s.remove());
    };
  }, []);

  return (
    <TouchableWithoutFeedback
      onPress={() => animateOut(undefined)}
      style={{ height: "100%", width: "100%" }}
    >
      <View>
        <Animated.View
          style={{
            backgroundColor: overlayBackgroundColor,
            opacity: opacity.current,
            height: "100%",
            width: "100%",
            position: "absolute"
          }}
        />

        <View
          style={{
            height: "100%",
            justifyContent: "flex-end"
          }}
          onLayout={event => setParentHeight(event.nativeEvent.layout.height)}
        >
          <Animated.View
            style={[
              {
                position: "absolute",
                top: "100%",
                width: "100%",
                flexDirection: "column",
                justifyContent: "flex-end"
              },
              height < 0 || bottomOffset < 0
                ? null
                : {
                    transform: [
                      {
                        translateY: slideOutOffset.current.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -height - bottomOffset]
                        })
                      }
                    ]
                  }
            ]}
            onLayout={(event: LayoutChangeEvent) =>
              setHeight(event.nativeEvent.layout.height)
            }
          >
            {showFrame ? (
              <View style={{ marginHorizontal: 10 }}>
                <View
                  style={[
                    actionSheetStyles.pickerContainer,
                    { backgroundColor: colors.actionSheetBg }
                  ]}
                >
                  {children({ animateOut, isCentered: false })}
                </View>
                <TouchableHighlight
                  style={[
                    actionSheetStyles.cancelButton,
                    { backgroundColor: colors.actionSheetCancelBg }
                  ]}
                  underlayColor={colors.actionSheetUnderlay}
                  onPress={() => animateOut(undefined)}
                >
                  <Text
                    style={[
                      actionSheetStyles.cancelText,
                      { color: cancelColor }
                    ]}
                  >
                    {cancelText}
                  </Text>
                </TouchableHighlight>
              </View>
            ) : (
              children({ animateOut, isCentered: false })
            )}
          </Animated.View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

function DisplayInTheCenterModal<T>({
  dismiss,
  children
}: ActivitySheetProps<T>) {
  const isDarkMode = useColorScheme() === "dark";
  const colors = isDarkMode ? darkPalette : lightPalette;

  const opacity = React.useRef(new Animated.Value(0));

  const animatingOutRef = React.useRef(false);

  React.useEffect(() => {
    // not sure if this is necessary in this case because the animation starts
    // immediately and does not update later, but it's better to be safe
    if (animatingOutRef.current) {
      return;
    }
    Animated.timing(opacity.current, {
      toValue: 1,
      duration: fadeInDuration,
      useNativeDriver: true
    }).start();
  }, []);

  const animateOut = (result: T | undefined) => {
    if (animatingOutRef.current) {
      return;
    }
    animatingOutRef.current = true;
    Animated.timing(opacity.current, {
      toValue: 0,
      duration: fadeOutDuration,
      useNativeDriver: true
    }).start(() => dismiss(result));
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => animateOut(undefined)}
      style={{ height: "100%", width: "100%" }}
    >
      <View
        style={{
          height: "100%",
          alignItems: "center",
          justifyContent: "space-around"
        }}
      >
        <Animated.View
          style={{
            width: 360,
            backgroundColor: colors.actionSheetCenteredBg,
            opacity: opacity.current,
            borderRadius: 10,
            shadowRadius: 40,
            shadowColor: shadowColor,
            shadowOpacity: 0.2
          }}
        >
          {children({ animateOut, isCentered: true })}
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
}

export default function ActivitySheet<T>(props: ActivitySheetProps<T>) {
  const [width, setWidth] = React.useState(Dimensions.get("window").width);

  React.useEffect(() => {
    const handler = ({ window }: { window: ScaledSize }) =>
      setWidth(window.width);
    Dimensions.addEventListener("change", handler);

    return () => Dimensions.removeEventListener("change", handler);
  }, []);

  return width > minWidthForCentered ? (
    <DisplayInTheCenterModal {...props} />
  ) : (
    <SlideOutFromTheBottomModal {...props} />
  );
}
