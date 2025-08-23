// src/screens/AddJournalScreen.jsx
import React, { useEffect, useState } from 'react';
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
  ActivityIndicator,
  ScrollView
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ImagePicker from 'react-native-image-crop-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Header from '../compoenents/Header';
import Geolocation from 'react-native-geolocation-service';
import { useJournalStore } from '../store/Store';
import { getImageTags } from '../compoenents/VisionApi';

const { width, height } = Dimensions.get('window');

// Theme colors
const colors = {
  primary: '#2D5016', // Deep forest green
  secondary: '#4A7C59', // Medium forest green
  accent: '#6B9080', // Sage green
  background: '#A4C3A2', // Light sage
  cardBackground: '#E8F5E8', // Very light mint
  searchBackground: '#D4E7D4', // Light mint
  textPrimary: '#1B3409', // Very dark green
  textSecondary: '#4A5D4A', // Medium dark green
  textMuted: '#6B7B6B', // Muted green-gray
  tagBackground: '#F0F8F0', // Almost white with green tint
  shadow: '#2D5016', // Deep green shadow
  overlay: 'rgba(0, 0, 0, 0.4)', 
  white: '#FFFFFF',
  danger: '#C53030',
};

const AddEditJournalScreen = ({ route, navigation }) => {
  const [internetAvailable, setInternetAvailable] = useState(false)
  const [tags, setTags] = useState([]); // holds AI tags (and/or extra)
  const { addJournal, updateJournal, isLoading } = useJournalStore();

  // Check if we're in edit mode
  const journalToEdit = route?.params?.journal;
  const isEditMode = !!journalToEdit;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [productImage, setProductImage] = useState([]);
  const [locationName, setLocationName] = useState('Detecting location...');
  const [dateTime, setDateTime] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Date picker states
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // NEW: store lat/lng
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      setTitle(journalToEdit.title || '');
      setDescription(journalToEdit.description || '');
      setProductImage(journalToEdit.productImage || []);
      setLocationName(journalToEdit.locationName || 'Unknown location');
      setDateTime(journalToEdit.dateTime || '');
      setLatitude(journalToEdit.latitude ?? null);
      setLongitude(journalToEdit.longitude ?? null);
      setTags(Array.isArray(journalToEdit.tags) ? journalToEdit.tags : []);
      
      // Set the selected date from existing journal entry
      if (journalToEdit.dateTime) {
        // Parse the date from the stored format
        const parsedDate = new Date(journalToEdit.dateTime);
        if (!isNaN(parsedDate.getTime())) {
          setSelectedDate(parsedDate);
        }
      }
    } else {
      detectLocation();
      updateDateTime();
    }
    const unsubscribe = NetInfo.addEventListener(state => {
      global.isConnected = state.isConnected;
      setInternetAvailable(state.isConnected);
    });
    unsubscribe();
  }, [isEditMode, journalToEdit]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message: "This app needs access to your location",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const detectLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      setLocationName('Location permission denied');
      setLatitude(null);
      setLongitude(null);
      return;
    }

    Geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude: lat, longitude: lng } = position.coords;
          setLatitude(lat);
          setLongitude(lng);

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            {
              headers: {
                "User-Agent": "TravelJournal/1.0 (koushikaraveti24@gmail.com)",
                "Accept-Language": "en"
              }
            }
          );
          const data = await response.json();
          console.log('Location Data:', data);

          if (data && data.address) {
            const parts = [
              data.address.city_district,
              data.address.city || data.address.town || data.address.village,
              data.address.country
            ].filter(Boolean);
            setLocationName(parts.join(', ') || 'Location not found');
          } else {
            setLocationName('Location not found');
          }
        } catch (error) {
          console.error(error);
          setLocationName('Unable to detect location');
        }
      },
      (error) => {
        console.error(error);
        setLocationName('Unable to detect location');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const updateDateTime = () => {
    const now = new Date();
    setSelectedDate(now);
    const formattedDate = now.toLocaleDateString();
    setDateTime(`${formattedDate}`);
  };

  const formatDate = (date) => {
    const options = { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const handleDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (date) {
      setSelectedDate(date);
      setDateTime(formatDate(date));
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

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
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
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
      setShowImageOptions(false);
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
      setShowImageOptions(false);
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

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Title Required', 'Please enter a title for your journal entry.');
      return;
    }
    if (productImage.length === 0) {
      Alert.alert('Photo Required', 'Please add at least one photo to your journal entry.');
      return;
    }

    setIsSaving(true);

    try {

      const aiTags = internetAvailable ? await getImageTags(productImage) : [];

      const journalData = {
        title,
        description,
        productImage,   // photos: array of urls inside
        locationName,   // "location"
        dateTime: formatDate(selectedDate),       // "date_time"
        latitude,
        longitude,
        tags: aiTags
      };

      if (isEditMode) {
        await updateJournal({
          ...journalData,
          id: journalToEdit.id,
        });

        Alert.alert('Updated', 'Your journal entry has been updated.', [
          { text: 'OK', onPress: () => navigation?.navigate('Tabs') }
        ]);
      } else {
        const newJournal = await addJournal({
          ...journalData,
          id: Math.random().toString(36).substr(2, 9),
        });

        setTitle('');
        setDescription('');
        setProductImage([]);
        detectLocation();
        updateDateTime();

        Alert.alert('Saved', 'Your journal entry has been saved successfully!', [
          {
            text: 'OK',
            onPress: () => {
              navigation?.navigate('Details', { journal: newJournal });
            }
          }
        ]);
      }
    } catch (error) {
      console.error('Error saving journal:', error);
      Alert.alert('Save Error', 'Failed to save journal entry. Please try again.', [{ text: 'OK' }]);
    } finally {
      setIsSaving(false);
    }
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
            <MaterialCommunityIcons name="camera" size={24} color={colors.textPrimary} />
            <Text style={styles.optionText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={openGallery}>
            <MaterialCommunityIcons name="folder-image" size={24} color={colors.textPrimary} />
            <Text style={styles.optionText}>Browse All Photos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton, styles.cancelButton]}
            onPress={() => setShowImageOptions(false)}
          >
            <MaterialCommunityIcons name="close" size={24} color={colors.textMuted} />
            <Text style={[styles.optionText, { color: colors.textMuted }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const LoadingModal = () => (
    <Modal visible={isSaving || isLoading} transparent={true} animationType="fade">
      <View style={styles.loadingOverlay}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            {isEditMode ? 'Updating journal entry...' : 'Saving journal entry...'}
          </Text>
        </View>
      </View>
    </Modal>
  );

  return (
    <ImageBackground source={require('../assets/BG.jpg')} style={styles.background}>
      <View style={styles.overlay} />
      {isEditMode ? (
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Journal</Text>
        </View>
      ) : (
        <Header />
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Text style={styles.header}>
            {isEditMode ? 'Edit Journal Entry' : 'Add New Journal Entry'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Title"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
            editable={!isSaving && !isLoading}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            placeholderTextColor={colors.textMuted}
            multiline
            value={description}
            onChangeText={setDescription}
            editable={!isSaving && !isLoading}
          />

          <View style={styles.locationRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={20} color={colors.textPrimary} />
            <Text style={styles.locationText}>{locationName}</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.locationRow, styles.dateRow]} 
            onPress={showDatePickerModal}
            disabled={isSaving || isLoading}
          >
            <MaterialCommunityIcons name="calendar-clock" size={20} color={colors.textPrimary} />
            <Text style={styles.locationText}>{dateTime || formatDate(selectedDate)}</Text>
            <View style={styles.dateEditIndicator}>
              <MaterialCommunityIcons name="pencil" size={16} color={colors.secondary} />
            </View>
          </TouchableOpacity>

          {/* Date Picker */}
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()} // Prevent future dates
              style={Platform.OS === 'ios' ? styles.iosDatePicker : undefined}
            />
          )}

          {Platform.OS === 'ios' && showDatePicker && (
            <View style={styles.datePickerButtons}>
              <TouchableOpacity 
                style={[styles.dateButton, styles.cancelDateButton]}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.cancelDateText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.dateButton, styles.confirmDateButton]}
                onPress={() => {
                  setDateTime(formatDate(selectedDate));
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.confirmDateText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.imagePickerButton,
              (productImage.length >= 5 || isSaving || isLoading) && styles.imagePickerButtonDisabled
            ]}
            onPress={handleImageSelection}
            disabled={productImage.length >= 5 || isSaving || isLoading}
          >
            <MaterialCommunityIcons
              name="camera-plus"
              size={20}
              color={(productImage.length >= 5 || isSaving || isLoading) ? colors.textMuted : colors.white}
              style={{ marginRight: 8 }}
            />
            <Text
              style={[
                styles.imagePickerText,
                (productImage.length >= 5 || isSaving || isLoading) && styles.imagePickerTextDisabled
              ]}
            >
              {productImage.length >= 5 ? 'Maximum 5 photos reached' : `Add Images (${productImage.length}/5)`}
            </Text>
          </TouchableOpacity>

          {productImage.length > 0 ? (
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
                    disabled={isSaving || isLoading}
                  >
                    <MaterialCommunityIcons name="close-circle" size={20} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              )}
            />
          ) : (
            <View style={styles.noImageContainer}>
              <MaterialCommunityIcons name="camera-off" size={40} color={colors.textMuted} />
              <Text style={styles.noImageText}>
                At least 1 photo is required for your journal entry
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.saveButton,
              (productImage.length === 0 || isSaving || isLoading) && styles.saveButtonDisabled
            ]}
            onPress={handleSave}
            disabled={productImage.length === 0 || isSaving || isLoading}
          >
            {(isSaving || isLoading) ? (
              <ActivityIndicator size="small" color={colors.white} style={{ marginRight: 8 }} />
            ) : null}
            <Text
              style={[
                styles.saveText,
                (productImage.length === 0 || isSaving || isLoading) && styles.saveTextDisabled
              ]}
            >
              {isSaving || isLoading
                ? (isEditMode ? 'Updating...' : 'Saving...')
                : (isEditMode ? 'Update Journal Entry' : 'Save Journal Entry')
              }
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {Platform.OS === 'android' && <AndroidImageOptionsModal />}
      <LoadingModal />
    </ImageBackground>
  );
};

export default AddEditJournalScreen;

// Updated styles with green theme and date picker styles
const styles = StyleSheet.create({
  background: {
    flex: 1,
    height: height,
    width: width,
    padding: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: colors.secondary + '50', // 50% opacity
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 25,
    color: colors.white,
    textAlign: 'center',
    textShadowColor: colors.shadow,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  input: {
    backgroundColor: colors.cardBackground + 'E6', // 90% opacity
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 18,
    color: colors.textPrimary,
    fontSize: 16,
    borderWidth: 2,
    borderColor: colors.accent + '50', // 50% opacity
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.cardBackground + 'CC', // 80% opacity
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  dateRow: {
    position: 'relative',
  },
  locationText: {
    marginLeft: 8,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  dateEditIndicator: {
    marginLeft: 8,
    padding: 4,
    borderRadius: 6,
    backgroundColor: colors.accent + '30',
  },
  iosDatePicker: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    marginBottom: 15,
  },
  datePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  dateButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelDateButton: {
    backgroundColor: colors.textMuted + '30',
  },
  confirmDateButton: {
    backgroundColor: colors.primary,
  },
  cancelDateText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  confirmDateText: {
    color: colors.white,
    fontWeight: '600',
  },
  imagePickerButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.accent,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  imagePickerText: {
    color: colors.white,
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
    borderWidth: 3,
    borderColor: colors.accent,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.white,
    borderRadius: 12,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    elevation: 6,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  saveText: {
    fontWeight: '700',
    fontSize: 18,
    color: colors.white,
  },
  imagePickerButtonDisabled: {
    backgroundColor: colors.textMuted + '50', // 50% opacity
    borderColor: colors.textMuted + '30', // 30% opacity
  },
  imagePickerTextDisabled: {
    color: colors.textMuted,
  },
  noImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tagBackground,
    borderRadius: 12,
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.textMuted,
  },
  noImageText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  saveButtonDisabled: {
    backgroundColor: colors.textMuted,
    opacity: 0.6,
    borderColor: colors.textMuted + '50', // 50% opacity
  },
  saveTextDisabled: {
    color: colors.textMuted + 'CC', // 80% opacity
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 25,
    width: width * 0.85,
    maxWidth: 320,
    elevation: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: colors.accent + '30', // 30% opacity
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 25,
    color: colors.textPrimary,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: colors.tagBackground,
    borderWidth: 1,
    borderColor: colors.accent + '30', // 30% opacity
  },
  cancelButton: {
    borderTopWidth: 2,
    borderTopColor: colors.accent + '30', // 30% opacity
    marginTop: 15,
    paddingTop: 20,
    backgroundColor: colors.searchBackground,
  },
  optionText: {
    fontSize: 17,
    marginLeft: 15,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    minWidth: 200,
    borderWidth: 2,
    borderColor: colors.accent,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'center',
    fontWeight: '500',
  },
});