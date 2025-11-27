import { Check, X } from 'lucide-react-native';
import React from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SortOption, SortOptionItem } from '../types';

interface SortModalProps {
    visible: boolean;
    currentSort: SortOption;
    onClose: () => void;
    onSelect: (sort: SortOption) => void;
}

const sortOptions: SortOptionItem[] = [
    { label: 'Name (A-Z)', value: 'nameAsc' },
    { label: 'Name (Z-A)', value: 'nameDesc' },
    { label: 'Date (Newest First)', value: 'dateDesc' },
    { label: 'Date (Oldest First)', value: 'dateAsc' },
    { label: 'Size (Largest First)', value: 'sizeDesc' },
    { label: 'Size (Smallest First)', value: 'sizeAsc' },
];

export const SortModal: React.FC<SortModalProps> = ({
    visible,
    currentSort,
    onClose,
    onSelect,
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Sort By</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color="#374151" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.optionsContainer}>
                        {sortOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.option,
                                    currentSort === option.value && styles.optionActive,
                                ]}
                                onPress={() => {
                                    onSelect(option.value);
                                    onClose();
                                }}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        currentSort === option.value && styles.optionTextActive,
                                    ]}
                                >
                                    {option.label}
                                </Text>
                                {currentSort === option.value && (
                                    <Check size={20} color="#2563eb" strokeWidth={2.5} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modal: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 24,
        paddingBottom: 40,
        maxHeight: '70%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    closeButton: {
        padding: 4,
    },
    optionsContainer: {
        paddingHorizontal: 24,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    optionActive: {
        backgroundColor: '#eff6ff',
    },
    optionText: {
        fontSize: 16,
        color: '#374151',
    },
    optionTextActive: {
        color: '#2563eb',
        fontWeight: '600',
    },
});
