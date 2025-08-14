import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { syncUnsyncedJournals } from '../services/SyncingJournals';

interface IProps {
  isConnected: boolean;
}

export class NoInternetConnection extends React.Component<IProps> {
  ribbonHeight: Animated.Value;

  constructor(props: IProps) {
    super(props);
    this.ribbonHeight = new Animated.Value(0);
  }

  async componentDidUpdate(prevProps: { isConnected: boolean }) {
    if (prevProps.isConnected !== this.props.isConnected) {
      if (this.props.isConnected) {
        try {
          await syncUnsyncedJournals();
          console.log("Journals synced successfully");
        } catch (err) {
          console.error("Error syncing journals:", err);
        }

        setTimeout(() => {
          Animated.timing(this.ribbonHeight, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }).start(() => this.setState({ isVisible: false }));
        }, 2000);
      } else {
        this.setState({ isVisible: true });
        Animated.timing(this.ribbonHeight, {
          toValue: 40,
          duration: 2000,
          useNativeDriver: false,
        }).start();
      }
    }
  }

  render() {
    return (
      <View style={styles.mainView}>
        <Animated.Text
          style={[
            styles.subView,
            {
              height: this.ribbonHeight,
              backgroundColor: !this.props.isConnected ? "red" : "green",
            },
          ]}
        >
          {!this.props.isConnected
            ? "No internet connection!"
            : "You're now connected!"}
        </Animated.Text>
      </View>
    );
  }
}

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
    color: "#fff",
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});
