import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  FlatList,
  Image,
  Dimensions,
  PermissionsAndroid,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ImagePicker from 'react-native-image-crop-picker';
import Header from '../compoenents/Header';

const { width, height } = Dimensions.get('window');

const AddEditJournalScreen = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [productImage, setProductImage] = useState([]);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Camera Permission",
          message: "This app needs access to your camera to take pictures",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const requestGalleryPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: "Gallery Permission",
          message: "This app needs access to your photos",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert("Permission Denied", "Camera access is required.");
      return;
    }
    try {
      const image = await ImagePicker.openCamera({
        width: 500,
        height: 500,
        cropping: true,
        mediaType: 'photo',
        padding: 20
      });
      const data = {
        id: productImage.length + 1,
        url: image.path,
      };
      setProductImage(prev => [...prev, data]);
    } catch (error) {
      console.error(error);
    }
  };

  const openGallery = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      Alert.alert("Permission Denied", "Gallery access is required.");
      return;
    }
    try {
      const image = await ImagePicker.openPicker({
        width: 500,
        height: 500,
        cropping: true,
        mediaType: 'photo',
      });
      const data = {
        id: productImage.length + 1,
        url: image.path,
      };
      setProductImage(prev => [...prev, data]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleImageSelection = () => {
    if (productImage.length >= 5) {
      Alert.alert('Limit Reached', 'You can only add up to 5 images.');
      return;
    }
    setShowImageOptions(true);
  };
  const removeImage = (indexToRemove) => {
    setProductImage(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title for your journal entry.');
      return;
    }

    console.log({ title, description, productImage });
    setTitle('');
    setDescription('');
    setProductImage([]);
    Alert.alert('Saved', `Your journal entry "${title}" has been saved with ${productImage.length} images.`);
  };

  const AndroidImageOptionsModal = () => (
    <Modal
      visible={showImageOptions}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowImageOptions(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Image Source</Text>

          <TouchableOpacity style={styles.optionButton} onPress={openCamera}>
            <MaterialCommunityIcons name="camera" size={24} color="#333" />
            <Text style={styles.optionText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={openGallery}>
            <MaterialCommunityIcons name="folder-image" size={24} color="#333" />
            <Text style={styles.optionText}>Browse All Photos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton, styles.cancelButton]}
            onPress={() => setShowImageOptions(false)}
          >
            <MaterialCommunityIcons name="close" size={24} color="#666" />
            <Text style={[styles.optionText, { color: '#666' }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <ImageBackground
      source={require('../assets/JournalBG.jpeg')}
      style={styles.background}
    >
      <View style={styles.overlay} />
      <Header />
      <View style={styles.container}>
        <Text style={styles.header}>Add/Edit Journal</Text>

        <TextInput
          style={styles.input}
          placeholder="Title"
          placeholderTextColor="#ccc"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description"
          placeholderTextColor="#ccc"
          multiline
          value={description}
          onChangeText={setDescription}
        />

        <View style={styles.locationRow}>
          <MaterialCommunityIcons name="map-marker-outline" size={20} color="#fff" />
          <Text style={styles.locationText}>Location</Text>
        </View>

        <TouchableOpacity style={styles.imagePickerButton} onPress={handleImageSelection}>
          <MaterialCommunityIcons name="camera-plus" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.imagePickerText}>Add Images ({productImage.length}/5)</Text>
        </TouchableOpacity>

        {productImage.length > 0 && (
          <FlatList
            data={productImage}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            style={styles.imageList}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <View style={styles.imageContainer}>
                <Image source={{ uri: item.url }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(index)}
                >
                  <MaterialCommunityIcons name="close-circle" size={20} color="#ff4444" />
                </TouchableOpacity>
              </View>
            )}
          />
        )}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save Journal Entry</Text>
        </TouchableOpacity>
      </View>

      {Platform.OS === 'android' && <AndroidImageOptionsModal />}
    </ImageBackground>
  );
};

export default AddEditJournalScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    height: height,
    width: width,
    padding: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 25,
    color: '#fff',
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 18,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  locationText: {
    marginLeft: 8,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  imagePickerButton: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  imagePickerText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  imageList: {
    marginBottom: 15,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  saveText: {
    fontWeight: '700',
    fontSize: 18,
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: width * 0.85,
    maxWidth: 320,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 25,
    color: '#333',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
  },
  cancelButton: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    marginTop: 15,
    paddingTop: 20,
    backgroundColor: 'transparent',
  },
  optionText: {
    fontSize: 17,
    marginLeft: 15,
    color: '#333',
    fontWeight: '600',
  },
});