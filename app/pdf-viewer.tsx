import { File } from 'expo-file-system';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { ExternalLink, FileText, Share2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PDFViewerScreen() {
    const { path, name } = useLocalSearchParams<{ path: string; name: string }>();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fileInfo, setFileInfo] = useState<{ size: number; exists: boolean } | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Verify file exists and get info
        const verifyFile = async () => {
            if (path) {
                try {
                    console.log('Verifying PDF file:', path);
                    const file = new File(path);
                    if (!file.exists) {
                        setError('PDF file not found');
                        Alert.alert('Error', 'The PDF file could not be found');
                        setIsLoading(false);
                    } else {
                        console.log('PDF file verified, size:', file.size);
                        setFileInfo({ size: file.size, exists: true });
                        setIsLoading(false);
                        // Automatically open the PDF in external viewer
                        await openInExternalViewer();
                    }
                } catch (err) {
                    console.error('Error verifying file:', err);
                    setError('Failed to verify PDF file');
                    setIsLoading(false);
                }
            }
        };

        verifyFile();
    }, [path]);

    const openInExternalViewer = async () => {
        if (!path) return;

        try {
            const canShare = await Sharing.isAvailableAsync();
            if (!canShare) {
                Alert.alert('Not Available', 'Sharing is not available on this device');
                return;
            }

            console.log('Opening PDF in external viewer:', path);
            await Sharing.shareAsync(path, {
                mimeType: 'application/pdf',
                dialogTitle: name || 'Open PDF',
                UTI: 'com.adobe.pdf', // iOS Universal Type Identifier for PDFs
            });

            // After sharing, go back to the list
            setTimeout(() => {
                router.back();
            }, 500);
        } catch (err) {
            console.error('Error opening PDF:', err);
            Alert.alert('Error', 'Failed to open PDF in external viewer');
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#111827" />
            <Stack.Screen
                options={{
                    headerStyle: { backgroundColor: '#111827' },
                    headerTintColor: '#fff',
                    headerTitle: name || 'PDF Viewer',
                    headerTitleStyle: { color: '#fff' }
                }}
            />

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2563eb" />
                    <Text style={styles.loadingText}>Opening PDF...</Text>
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorIcon}>⚠️</Text>
                    <Text style={styles.errorMessage}>{error}</Text>
                    <Text style={styles.errorSubtext}>Please try again</Text>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.contentContainer}>
                    <View style={styles.iconContainer}>
                        <FileText size={80} color="#2563eb" strokeWidth={1.5} />
                    </View>

                    <Text style={styles.fileName}>{name}</Text>

                    {fileInfo && (
                        <Text style={styles.fileSize}>
                            {formatFileSize(fileInfo.size)}
                        </Text>
                    )}

                    <View style={styles.infoBox}>
                        <ExternalLink size={20} color="#6b7280" />
                        <Text style={styles.infoText}>
                            PDF opened in your default viewer app
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={openInExternalViewer}
                    >
                        <Share2 size={20} color="#ffffff" />
                        <Text style={styles.primaryButtonText}>Open Again</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.secondaryButtonText}>Back to List</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#ffffff',
        fontWeight: '500',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    errorMessage: {
        fontSize: 18,
        color: '#ffffff',
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    errorSubtext: {
        fontSize: 14,
        color: '#9ca3af',
        textAlign: 'center',
        marginBottom: 24,
    },
    backButton: {
        backgroundColor: '#374151',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    iconContainer: {
        marginBottom: 24,
    },
    fileName: {
        fontSize: 20,
        fontWeight: '600',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 8,
        paddingHorizontal: 20,
    },
    fileSize: {
        fontSize: 14,
        color: '#9ca3af',
        marginBottom: 32,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1f2937',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 32,
        gap: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#d1d5db',
        lineHeight: 20,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2563eb',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
        marginBottom: 12,
        gap: 8,
    },
    primaryButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
    },
    secondaryButtonText: {
        color: '#9ca3af',
        fontSize: 16,
        fontWeight: '600',
    },
});
