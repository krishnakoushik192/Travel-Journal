// src/components/DeleteConfirmationModal.jsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from './Colors';

const { width } = Dimensions.get('window');

// Responsive breakpoints
const isTablet = width >= 768;
const isSmallScreen = width < 375;

// Responsive scaling functions
const scale = (size) => {
  const baseWidth = 375;
  return Math.round((size * width) / baseWidth);
};

const verticalScale = (size) => {
  const baseHeight = 812;
  const { height } = Dimensions.get('window');
  return Math.round((size * height) / baseHeight);
};

const moderateScale = (size, factor = 0.5) => {
  return size + (scale(size) - size) * factor;
};

const DeleteConfirmationModal = ({
  visible,
  onConfirm,
  onCancel,
  title = "Delete Journal Entry",
  message = "Are you sure you want to delete this journal entry? This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  iconName = "delete-alert-outline",
  customContent = null,
  showSubMessage = false,
  subMessage = "This action cannot be undone and all associated data will be permanently removed."
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <MaterialCommunityIcons
              name={iconName}
              size={moderateScale(48)}
              color={colors.danger}
            />
            <Text style={styles.modalTitle}>{title}</Text>
            <Text style={styles.modalMessage}>{message}</Text>
            {showSubMessage && (
              <Text style={styles.modalSubMessage}>{subMessage}</Text>
            )}
            {customContent}
          </View>

          <View style={styles.modalActions}>
            <Pressable
              style={styles.cancelButton}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </Pressable>

            <Pressable
              style={styles.confirmDeleteButton}
              onPress={onConfirm}
            >
              <MaterialCommunityIcons
                name="delete"
                size={moderateScale(18)}
                color={colors.white}
              />
              <Text style={styles.confirmDeleteButtonText}>{confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.modalBackground,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(24),
  },
  modalCard: {
    backgroundColor: colors.modalCard,
    borderRadius: moderateScale(20),
    padding: moderateScale(24),
    width: '100%',
    maxWidth: isTablet ? 400 : width - 48,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  modalTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: verticalScale(16),
    marginBottom: verticalScale(8),
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: moderateScale(16),
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: moderateScale(22),
  },
  modalSubMessage: {
    fontSize: moderateScale(14),
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: moderateScale(20),
    marginTop: verticalScale(8),
  },
  modalActions: {
    flexDirection: isSmallScreen ? 'column' : 'row',
    gap: moderateScale(12),
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: isSmallScreen ? undefined : 1,
    backgroundColor: colors.searchBackground,
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    paddingHorizontal: moderateScale(20),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.textMuted,
  },
  cancelButtonText: {
    color: colors.textPrimary,
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  confirmDeleteButton: {
    flex: isSmallScreen ? undefined : 1,
    backgroundColor: colors.danger,
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    paddingHorizontal: moderateScale(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(8),
  },
  confirmDeleteButtonText: {
    color: colors.white,
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
});

export default DeleteConfirmationModal;