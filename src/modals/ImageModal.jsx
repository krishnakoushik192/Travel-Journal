import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ImagePicker from 'react-native-image-crop-picker';

const AndroidImageOptionsModal = () => {
    return (
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
};

export default AndroidImageOptionsModal;