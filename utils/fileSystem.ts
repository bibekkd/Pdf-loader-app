import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { PDFFile } from '../types';

const STORAGE_URI_KEY = 'pdf_viewer_storage_uri';

/**
 * Recursively scans a directory for PDF files
 */
const scanDirectory = (directory: Directory, depth: number = 0): PDFFile[] => {
    const pdfFiles: PDFFile[] = [];

    try {
        if (!directory.exists) {
            console.warn('Directory does not exist:', directory.uri);
            return pdfFiles;
        }

        console.log(`${'  '.repeat(depth)}Scanning: ${directory.uri}`);
        const items = directory.list();
        console.log(`${'  '.repeat(depth)}Found ${items.length} items`);

        for (const item of items) {
            try {
                if (item instanceof Directory) {
                    // Recursively scan subdirectories (limit depth to avoid infinite loops)
                    if (depth < 10) {
                        const subDirPdfs = scanDirectory(item, depth + 1);
                        pdfFiles.push(...subDirPdfs);
                    }
                } else if (item instanceof File) {
                    // Check if it's a PDF
                    const itemName = Paths.basename(item.uri);
                    if (itemName.toLowerCase().endsWith('.pdf')) {
                        console.log(`${'  '.repeat(depth)}Found PDF: ${itemName}`);
                        pdfFiles.push({
                            id: item.uri,
                            name: itemName,
                            size: item.size || 0,
                            modificationTime: item.modificationTime || Date.now(),
                            uri: item.uri,
                        });
                    }
                }
            } catch (itemError) {
                console.warn('Error processing item:', itemError);
            }
        }
    } catch (error) {
        console.warn('Error scanning directory:', directory.uri, error);
    }

    return pdfFiles;
};

/**
 * Removes duplicate PDFs from the list
 * Duplicates are identified by matching name AND size
 */
const removeDuplicatePDFs = (pdfs: PDFFile[]): PDFFile[] => {
    const seen = new Map<string, PDFFile>();

    for (const pdf of pdfs) {
        // Create a unique key based on name and size
        const key = `${pdf.name}_${pdf.size}`;

        if (!seen.has(key)) {
            // First occurrence - keep it
            seen.set(key, pdf);
        } else {
            // Duplicate found - prefer file:// URIs over content:// URIs
            const existing = seen.get(key)!;
            if (pdf.uri.startsWith('file://') && !existing.uri.startsWith('file://')) {
                seen.set(key, pdf);
            }
        }
    }

    const uniquePdfs = Array.from(seen.values());
    console.log(`Removed ${pdfs.length - uniquePdfs.length} duplicate PDFs`);
    return uniquePdfs;
};

/**
 * Scans for PDF files on the device
 * - Android: Scans user-selected directory (if previously chosen)
 * - iOS: Scans Paths.document and Paths.cache
 */
export const scanForPDFs = async (): Promise<PDFFile[]> => {
    try {
        let pdfFiles: PDFFile[] = [];

        if (Platform.OS === 'android') {
            // Check if user has previously selected a directory
            const savedUri = await AsyncStorage.getItem(STORAGE_URI_KEY);

            if (savedUri) {
                try {
                    // Create Directory instance from saved URI
                    const directory = new Directory(savedUri);

                    if (directory.exists) {
                        pdfFiles = scanDirectory(directory);
                    } else {
                        console.log('Saved directory no longer exists');
                        await AsyncStorage.removeItem(STORAGE_URI_KEY);
                    }
                } catch (error) {
                    console.log('Error accessing saved directory:', error);
                    await AsyncStorage.removeItem(STORAGE_URI_KEY);
                }
            }

            // Remove duplicates before returning
            return removeDuplicatePDFs(pdfFiles);

        } else {
            // iOS: Scan app's sandboxed directories
            const directoriesToScan = [
                new Directory(Paths.document),
                new Directory(Paths.cache),
            ];

            for (const dir of directoriesToScan) {
                if (dir.exists) {
                    const dirPdfs = scanDirectory(dir);
                    pdfFiles.push(...dirPdfs);
                }
            }

            // Remove duplicates before returning
            return removeDuplicatePDFs(pdfFiles);
        }
    } catch (error) {
        console.error('Error scanning for PDFs:', error);
        return [];
    }
};

/**
 * Opens Android directory picker and saves selection
 */
export const requestAndroidDirectory = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return false;

    try {
        const directory = await Directory.pickDirectoryAsync();

        if (directory && directory.exists) {
            // Save the directory URI for future scans
            await AsyncStorage.setItem(STORAGE_URI_KEY, directory.uri);
            return true;
        }

        return false;
    } catch (error) {
        console.error('Error selecting directory:', error);
        return false;
    }
};

/**
 * Prepares a file for viewing by copying to cache if needed
 * WebView needs file:// URIs in accessible locations
 */
export const prepareFileForViewing = async (uri: string, name: string): Promise<string | null> => {
    try {
        console.log('Preparing file for viewing:', uri);

        // For iOS, if it's a DocumentPicker temp file, copy to cache
        if (Platform.OS === 'ios' && uri.includes('DocumentPicker')) {
            const cacheDir = new Directory(Paths.cache);
            const sanitizedName = name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const destFile = new File(cacheDir, sanitizedName);

            // If file already exists in cache, just return it
            if (destFile.exists) {
                console.log('File already in cache:', destFile.uri);
                return destFile.uri;
            }

            const sourceFile = new File(uri);
            if (sourceFile.exists) {
                sourceFile.copy(destFile);
                console.log('Copied to cache:', destFile.uri);
                return destFile.uri;
            }
        }

        // For Android content:// URIs, we need to use legacy API which supports content URIs
        if (Platform.OS === 'android' && uri.startsWith('content://')) {
            // Import legacy FileSystem API dynamically
            const LegacyFS = require('expo-file-system/legacy');

            const cacheDir = new Directory(Paths.cache);
            const sanitizedName = name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const destPath = cacheDir.uri + sanitizedName;

            // Check if file already exists in cache
            const destFile = new File(destPath);
            if (destFile.exists) {
                console.log('File already in cache:', destPath);
                return destPath;
            }

            // Use legacy copyAsync which supports content:// URIs
            console.log('Copying from content URI to cache...');
            await LegacyFS.copyAsync({
                from: uri,
                to: destPath
            });

            console.log('Copied to cache:', destPath);
            return destPath;
        }

        // For regular file:// URIs, return as-is
        console.log('Using original URI:', uri);
        return uri;
    } catch (error) {
        console.error('Error preparing file for viewing:', error);
        return null;
    }
};

/**
 * Picks a PDF document using system picker
 */
export const pickPDFDocument = async (): Promise<PDFFile | null> => {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'application/pdf',
            copyToCacheDirectory: true,
        });

        if (result.canceled) {
            return null;
        }

        const asset = result.assets[0];

        // On iOS, copy to document directory to persist it
        if (Platform.OS === 'ios') {
            const docDir = new Directory(Paths.document);
            const destFile = new File(docDir, asset.name);
            const sourceFile = new File(asset.uri);

            sourceFile.copy(destFile);

            return {
                id: destFile.uri,
                name: asset.name,
                size: destFile.size || 0,
                modificationTime: Date.now(),
                uri: destFile.uri,
            };
        }

        return {
            id: asset.uri,
            name: asset.name,
            size: asset.size || 0,
            modificationTime: Date.now(),
            uri: asset.uri,
        };
    } catch (error) {
        console.error('Error picking document:', error);
        return null;
    }
};

/**
 * Shares a PDF file
 */
export const sharePDF = async (pdf: PDFFile): Promise<void> => {
    try {
        const canShare = await Sharing.isAvailableAsync();
        if (!canShare) return;

        await Sharing.shareAsync(pdf.uri, {
            mimeType: 'application/pdf',
            dialogTitle: `Share ${pdf.name}`,
        });
    } catch (error) {
        console.error('Error sharing PDF:', error);
    }
};

/**
 * Deletes a PDF file
 */
export const deletePDF = async (pdf: PDFFile): Promise<boolean> => {
    try {
        const file = new File(pdf.uri);

        if (file.exists) {
            file.delete();
            return true;
        }

        return false;
    } catch (error) {
        console.error('Error deleting PDF:', error);
        return false;
    }
};
