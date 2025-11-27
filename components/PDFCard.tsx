import { Calendar, FileText, HardDrive, Share2, Trash2 } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PDFFile } from '../types';
import { formatDate, formatFileSize } from '../utils/formatters';

interface PDFCardProps {
    pdf: PDFFile;
    onPress: () => void;
    onShare: () => void;
    onDelete: () => void;
}

export const PDFCard: React.FC<PDFCardProps> = ({
    pdf,
    onPress,
    onShare,
    onDelete,
}) => {
    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <FileText size={32} color="#ef4444" strokeWidth={1.5} />
                </View>
                <View style={styles.content}>
                    <Text style={styles.fileName} numberOfLines={2}>
                        {pdf.name}
                    </Text>
                    <View style={styles.metadata}>
                        <View style={styles.metadataItem}>
                            <HardDrive size={14} color="#6b7280" />
                            <Text style={styles.metadataText}>{formatFileSize(pdf.size)}</Text>
                        </View>
                        <View style={styles.metadataItem}>
                            <Calendar size={14} color="#6b7280" />
                            <Text style={styles.metadataText}>
                                {formatDate(pdf.modificationTime)}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => {
                        e.stopPropagation();
                        onShare();
                    }}
                >
                    <Share2 size={18} color="#3b82f6" />
                    <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                >
                    <Trash2 size={18} color="#ef4444" />
                    <Text style={styles.actionText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    iconContainer: {
        width: 56,
        height: 56,
        backgroundColor: '#fef2f2',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
    },
    fileName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
        lineHeight: 22,
    },
    metadata: {
        flexDirection: 'row',
        gap: 16,
        flexWrap: 'wrap',
    },
    metadataItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metadataText: {
        fontSize: 13,
        color: '#6b7280',
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    actionButton: {
        flex: 1,
        height: 40,
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
});
