import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { syncUnsyncedJournals } from '../services/SyncingJournals';

const NoInternetConnection = ({ isConnected }) => {
  const ribbonHeight = useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = useState(false);
  const [prevConnected, setPrevConnected] = useState(isConnected);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle', 'offline', 'syncing', 'success', 'error'

  useEffect(() => {
    if (prevConnected !== isConnected) {
      setPrevConnected(isConnected);

      if (isConnected) {
        // Connection restored - sync journals
        console.log("Internet connection restored, syncing journals...");
        setIsVisible(true);
        setSyncStatus('syncing');
        
        // Show syncing message
        Animated.timing(ribbonHeight, {
          toValue: 40,
          duration: 300,
          useNativeDriver: false,
        }).start();

        const syncJournals = async () => {
          try {
            await syncUnsyncedJournals();
            console.log("✅ Journals synced successfully");
            setSyncStatus('success');
            
            // Show success message for 2 seconds, then hide
            setTimeout(() => {
              Animated.timing(ribbonHeight, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: false,
              }).start(() => {
                setIsVisible(false);
                setSyncStatus('idle');
              });
            }, 2000);
          } catch (err) {
            console.error("❌ Error syncing journals:", err);
            setSyncStatus('error');
            
            // Show error message for 3 seconds, then hide
            setTimeout(() => {
              Animated.timing(ribbonHeight, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: false,
              }).start(() => {
                setIsVisible(false);
                setSyncStatus('idle');
              });
            }, 3000);
          }
        };

        syncJournals();
      } else {
        // Connection lost - show red banner
        console.log("Internet connection lost");
        setIsVisible(true);
        setSyncStatus('offline');
        Animated.timing(ribbonHeight, {
          toValue: 40,
          duration: 500,
          useNativeDriver: false,
        }).start();
      }
    }
  }, [isConnected, prevConnected, ribbonHeight]);

  // Don't render anything if not visible
  if (!isVisible) {
    return null;
  }

  // Get background color based on status
  let backgroundColor = "#ff4444"; // default red
  if (syncStatus === 'syncing') {
    backgroundColor = "#2196F3"; // blue
  } else if (syncStatus === 'success') {
    backgroundColor = "#4CAF50"; // green
  } else if (syncStatus === 'error') {
    backgroundColor = "#FF9800"; // orange
  }

  // Get message based on status
  let message = "📡 No internet connection!"; // default
  if (syncStatus === 'syncing') {
    message = "🔄 Syncing journals...";
  } else if (syncStatus === 'success') {
    message = "✅ Synced successfully!";
  } else if (syncStatus === 'error') {
    message = "⚠️ Sync failed. Will retry later.";
  }

  return (
    <View style={styles.mainView}>
      <Animated.View
        style={[
          styles.subView,
          {
            height: ribbonHeight,
            backgroundColor: backgroundColor,
          },
        ]}
      >
        <Animated.Text style={styles.textStyle}>
          {message}
        </Animated.Text>
      </Animated.View>
    </View>
  );
};

export default NoInternetConnection;

const styles = StyleSheet.create({
  mainView: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  subView: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  textStyle: {
    color: "#fff",
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
});