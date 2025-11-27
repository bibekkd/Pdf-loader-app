import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

export interface PDFFile {
    name: string;
    path: string;
    size?: number;
    modificationTime?: number;
}

export const getLocalPDFs = async (): Promise<PDFFile[]> => {
    try {
        // Ensure document directory exists (it should, but good practice)
        // @ts-ignore: documentDirectory exists on FileSystem
        if (!FileSystem.documentDirectory) {
            return [];
        }

        // @ts-ignore: documentDirectory exists on FileSystem
        const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);

        const pdfFiles = await Promise.all(
            files
                .filter((file) => file.toLowerCase().endsWith('.pdf'))
                .map(async (file) => {
                    // @ts-ignore: documentDirectory exists on FileSystem
                    const path = FileSystem.documentDirectory + file;
                    const info = await FileSystem.getInfoAsync(path);
                    return {
                        name: file,
                        path: path,
                        size: info.exists ? info.size : 0,
                        modificationTime: info.exists ? info.modificationTime : 0,
                    };
                })
        );

        return pdfFiles;
    } catch (error) {
        console.error('Error reading directory:', error);
        return [];
    }
};

export const importPDF = async (): Promise<string | null> => {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'application/pdf',
            copyToCacheDirectory: true,
        });

        if (result.canceled) {
            return null;
        }

        const file = result.assets[0];
        // @ts-ignore: documentDirectory exists on FileSystem
        if (!FileSystem.documentDirectory) {
            console.error("Document directory is null");
            return null;
        }

        // Sanitize filename to avoid issues
        const fileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        // @ts-ignore: documentDirectory exists on FileSystem
        const dest = FileSystem.documentDirectory + fileName;

        await FileSystem.copyAsync({
            from: file.uri,
            to: dest,
        });

        return dest;
    } catch (error) {
        console.error('Error importing PDF:', error);
        return null;
    }
};
