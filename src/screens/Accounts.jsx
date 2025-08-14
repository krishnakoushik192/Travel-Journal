import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  ImageBackground,
  Dimensions,
  TextInput,
  Modal,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

// Same color palette as previous screens
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
  overlay: 'rgba(45, 80, 22, 0.4)', // Deep green overlay
  white: '#FFFFFF',
  danger: '#C53030',
};

export default function Accounts(props) {
  const [editMode, setEditMode] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: 'Alex Thompson',
    email: 'alex.thompson@example.com',
    bio: 'Adventure seeker and travel enthusiast. Capturing moments from around the world 🌍',
    location: 'San Francisco, CA',
    joinDate: 'January 2023',
  });

  const [tempUserInfo, setTempUserInfo] = useState(userInfo);

  const stats = {
    journalEntries: 47,
    countriesVisited: 12,
    totalDistance: '25,430',
    favoriteSpots: 8,
  };

  const handleSave = () => {
    setUserInfo(tempUserInfo);
    setEditMode(false);
  };

  const handleCancel = () => {
    setTempUserInfo(userInfo);
    setEditMode(false);
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    // Add logout logic here
    console.log('User logged out');
  };


  return (
    <ImageBackground 
      source={require('../assets/BG.jpg')} // Add your background image here
      style={styles.background}
    >
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Pressable 
            onPress={() => editMode ? handleSave() : setEditMode(true)}
            style={styles.editButton}
          >
            <MaterialCommunityIcons 
              name={editMode ? "check" : "pencil"} 
              size={20} 
              color={colors.white} 
            />
            <Text style={styles.editButtonText}>
              {editMode ? 'Save' : 'Edit'}
            </Text>
          </Pressable>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Info */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image 
                // source={require('../assets/avatar.jpg')} // Add default avatar
                style={styles.avatar}
                // defaultSource={require('../assets/default-avatar.png')}
              />
              <Pressable style={styles.avatarEditButton}>
                <MaterialCommunityIcons 
                  name="camera" 
                  size={16} 
                  color={colors.white} 
                />
              </Pressable>
            </View>

            <View style={styles.profileInfo}>
              {editMode ? (
                <>
                  <TextInput
                    style={styles.nameInput}
                    value={tempUserInfo.name}
                    onChangeText={(text) => setTempUserInfo({...tempUserInfo, name: text})}
                    placeholder="Enter your name"
                    placeholderTextColor={colors.textMuted}
                  />
                  <TextInput
                    style={styles.emailInput}
                    value={tempUserInfo.email}
                    onChangeText={(text) => setTempUserInfo({...tempUserInfo, email: text})}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                  />
                  <TextInput
                    style={styles.bioInput}
                    value={tempUserInfo.bio}
                    onChangeText={(text) => setTempUserInfo({...tempUserInfo, bio: text})}
                    placeholder="Tell us about yourself"
                    placeholderTextColor={colors.textMuted}
                    multiline
                    numberOfLines={3}
                  />
                  <TextInput
                    style={styles.locationInput}
                    value={tempUserInfo.location}
                    onChangeText={(text) => setTempUserInfo({...tempUserInfo, location: text})}
                    placeholder="Your location"
                    placeholderTextColor={colors.textMuted}
                  />
                </>
              ) : (
                <>
                  <Text style={styles.profileName}>{userInfo.name}</Text>
                  <Text style={styles.profileEmail}>{userInfo.email}</Text>
                  <Text style={styles.profileBio}>{userInfo.bio}</Text>
                  <View style={styles.locationContainer}>
                    <MaterialCommunityIcons 
                      name="map-marker" 
                      size={16} 
                      color={colors.accent} 
                    />
                    <Text style={styles.profileLocation}>{userInfo.location}</Text>
                  </View>
                  <Text style={styles.joinDate}>Member since {userInfo.joinDate}</Text>
                </>
              )}
            </View>
          </View>

          {/* Logout Button */}
          <Pressable 
            style={styles.logoutButton}
            onPress={() => setShowLogoutModal(true)}
          >
            <MaterialCommunityIcons 
              name="logout" 
              size={20} 
              color={colors.danger} 
            />
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>

          {/* Cancel Button (Edit Mode) */}
          {editMode && (
            <Pressable style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          )}
        </ScrollView>

        {/* Logout Confirmation Modal */}
        <Modal
          visible={showLogoutModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLogoutModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <MaterialCommunityIcons 
                name="logout-variant" 
                size={48} 
                color={colors.danger} 
                style={styles.modalIcon}
              />
              <Text style={styles.modalTitle}>Logout</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to logout from your account?
              </Text>
              <View style={styles.modalButtons}>
                <Pressable 
                  style={styles.modalCancelButton}
                  onPress={() => setShowLogoutModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </Pressable>
                <Pressable 
                  style={styles.modalConfirmButton}
                  onPress={handleLogout}
                >
                  <Text style={styles.modalConfirmText}>Logout</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.background,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    gap: 4,
  },
  editButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  profileSection: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.searchBackground,
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 8,
    borderWidth: 2,
    borderColor: colors.white,
  },
  profileInfo: {
    alignItems: 'center',
    width: '100%',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  profileBio: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  profileLocation: {
    fontSize: 14,
    color: colors.textMuted,
  },
  joinDate: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  // Edit mode inputs
  nameInput: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.accent,
    paddingVertical: 8,
    marginBottom: 8,
    minWidth: 200,
  },
  emailInput: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.accent,
    paddingVertical: 8,
    marginBottom: 12,
    minWidth: 250,
  },
  bioInput: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    minHeight: 80,
    width: '100%',
  },
  locationInput: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.accent,
    paddingVertical: 8,
    minWidth: 200,
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: (width - 56) / 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    fontWeight: '500',
  },
  menuSection: {
    marginBottom: 24,
  },
  menuItem: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.danger,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 16,
    color: colors.danger,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: colors.textMuted,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: colors.searchBackground,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: colors.danger,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: colors.white,
    fontWeight: '600',
  },
});