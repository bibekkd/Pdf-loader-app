import { FileText } from 'lucide-react-native';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

interface EmptyStateProps {
    searchQuery: string;
}

export function EmptyState({ searchQuery }: EmptyStateProps) {
    const getMessage = () => {
        if (searchQuery) {
            return {
                title: 'No results found',
                subtitle: `No PDFs match "${searchQuery}"`,
            };
        }

        if (Platform.OS === 'android') {
            return {
                title: 'No PDFs found',
                subtitle: 'Select a folder to scan for PDF files',
            };
        }

        return {
            title: 'No PDFs found',
            subtitle: 'Add PDFs to this app via Files app or document picker',
        };
    };

    const { title, subtitle } = getMessage();

    return (
        <View style={styles.container}>
            <FileText size={64} color="#d1d5db" strokeWidth={1.5} />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        marginTop: 60,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#374151',
        marginTop: 16,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#9ca3af',
        textAlign: 'center',
        lineHeight: 20,
    },
});
