import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { queueTaskNotificationNavigation } from '../navigation/navigationRef';
import {
  hideInAppBanner,
  subscribeInAppBanner,
  type InAppBannerPayload,
} from '../services/notifications/inAppBanner';
import { useTheme } from '../theme';

const DISMISS_AFTER_MS = 4500;

export function InAppBanner(): React.JSX.Element | null {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [payload, setPayload] = useState<InAppBannerPayload | null>(null);
  const translateY = useRef(new Animated.Value(-160)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return subscribeInAppBanner(next => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }

      setPayload(current => (next ? next : current));
      if (!next) {
        Animated.timing(translateY, {
          toValue: -160,
          duration: 180,
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) {
            setPayload(null);
          }
        });
        return;
      }

      translateY.setValue(-160);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();

      hideTimer.current = setTimeout(() => {
        hideInAppBanner();
      }, DISMISS_AFTER_MS);
    });
  }, [translateY]);

  useEffect(() => {
    return () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    };
  }, []);

  if (!payload) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        { paddingTop: insets.top + theme.spacing.sm, transform: [{ translateY }] },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${payload.title}. ${payload.body}`}
        onPress={() => {
          if (payload.taskId) {
            queueTaskNotificationNavigation(payload.taskId);
          }
          hideInAppBanner();
        }}
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            borderRadius: theme.radii.md,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            ...theme.shadows.lg,
          },
        ]}
      >
        <Text
          numberOfLines={1}
          style={{
            color: theme.colors.text,
            fontSize: theme.typography.bodyBold.fontSize,
            fontWeight: theme.typography.bodyBold.fontWeight,
            lineHeight: theme.typography.bodyBold.lineHeight,
          }}
        >
          {payload.title}
        </Text>
        <Text
          numberOfLines={2}
          style={{
            color: theme.colors.textSecondary,
            fontSize: theme.typography.caption.fontSize,
            lineHeight: theme.typography.caption.lineHeight,
            marginTop: theme.spacing.xs,
          }}
        >
          {payload.body}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    paddingHorizontal: 16,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
  },
});
