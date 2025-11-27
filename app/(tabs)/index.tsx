import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { FileText, FolderOpen, Plus, Search, SlidersHorizontal } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { EmptyState } from '../../components/EmptyState';
import { PDFCard } from '../../components/PDFCard';
import { SortModal } from '../../components/SortModal';
import { PDFFile, SortOption } from '../../types';
import {
  deletePDF,
  pickPDFDocument,
  prepareFileForViewing,
  requestAndroidDirectory,
  scanForPDFs,
  sharePDF,
} from '../../utils/fileSystem';
import { requestStoragePermission } from '../../utils/permissions';

export default function HomeScreen() {
  const [pdfs, setPdfs] = useState<PDFFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('dateDesc');
  const [showSortModal, setShowSortModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [openingPdf, setOpeningPdf] = useState(false);
  const router = useRouter();

  const initializeApp = async () => {
    const hasPermission = await requestStoragePermission();
    if (hasPermission) {
      await loadPDFs();
    }
  };

  // Reload PDFs when screen comes into focus (detects new files)
  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused, reloading PDFs...');
      initializeApp();
    }, [])
  );

  const loadPDFs = async () => {
    try {
      const files = await scanForPDFs();
      setPdfs(files);
    } catch (error) {
      console.error('Error loading PDFs:', error);
      Alert.alert('Error', 'Failed to load PDF files');
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPDFs();
    setRefreshing(false);
  }, []);

  const handleAddPDF = async () => {
    const pdf = await pickPDFDocument();
    if (pdf) {
      // If we picked a file, we might want to reload the list if it was added to the directory
      // Or just add it to state temporarily
      await loadPDFs();
    }
  };

  const handleSetDirectory = async () => {
    const success = await requestAndroidDirectory();
    if (success) {
      await loadPDFs();
    } else {
      Alert.alert("Permission Denied", "Could not access the selected directory.");
    }
  }

  const handleShare = async (pdf: PDFFile) => {
    await sharePDF(pdf);
  };

  const handleDelete = (pdf: PDFFile) => {
    Alert.alert(
      'Delete PDF',
      `Are you sure you want to delete "${pdf.name}" ? `,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deletePDF(pdf);
            if (success) {
              setPdfs((prev) => prev.filter((p) => p.id !== pdf.id));
            } else {
              Alert.alert('Error', 'Failed to delete PDF');
            }
          },
        },
      ]
    );
  };

  const handleOpenPDF = async (pdf: PDFFile) => {
    if (openingPdf) return;
    setOpeningPdf(true);
    try {
      const viewableUri = await prepareFileForViewing(pdf.uri, pdf.name);
      if (viewableUri) {
        router.push({
          pathname: '/pdf-viewer',
          params: { path: viewableUri, name: pdf.name }
        });
      } else {
        Alert.alert("Error", "Could not prepare file for viewing.");
      }
    } catch (e) {
      console.error("Error opening PDF", e);
      Alert.alert("Error", "Failed to open PDF.");
    } finally {
      setOpeningPdf(false);
    }
  };

  const filteredAndSortedPDFs = useMemo(() => {
    let result = [...pdfs];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((pdf) =>
        pdf.name.toLowerCase().includes(query)
      );
    }

    // Sort
    const sortFunctions: Record<SortOption, (a: PDFFile, b: PDFFile) => number> = {
      nameAsc: (a, b) => a.name.localeCompare(b.name),
      nameDesc: (a, b) => b.name.localeCompare(a.name),
      dateDesc: (a, b) => (b.modificationTime || 0) - (a.modificationTime || 0),
      dateAsc: (a, b) => (a.modificationTime || 0) - (b.modificationTime || 0),
      sizeDesc: (a, b) => (b.size || 0) - (a.size || 0),
      sizeAsc: (a, b) => (a.size || 0) - (b.size || 0),
    };

    result.sort(sortFunctions[sortBy]);
    return result;
  }, [pdfs, searchQuery, sortBy]);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {openingPdf && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Opening PDF...</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <FileText size={32} color="#ef4444" strokeWidth={2} />
          <Text style={styles.headerTitle}>PDF Viewer</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          {filteredAndSortedPDFs.length} document
          {filteredAndSortedPDFs.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Search and Actions Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search PDFs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setShowSortModal(true)}
        >
          <SlidersHorizontal size={20} color="#374151" />
        </TouchableOpacity>

        {Platform.OS === 'android' && (
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: '#e0e7ff' }]}
            onPress={handleSetDirectory}
          >
            <FolderOpen size={20} color="#2563eb" />
          </TouchableOpacity>
        )}

        {/* Hide Add button on Android if user wants strictly no uploads, but keeping it as fallback or for iOS */}
        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={[styles.iconButton, styles.primaryButton]}
            onPress={handleAddPDF}
          >
            <Plus size={20} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>

      {/* PDF List */}
      {filteredAndSortedPDFs.length === 0 ? (
        <View style={{ flex: 1 }}>
          <EmptyState searchQuery={searchQuery} />
          {Platform.OS === 'android' && !searchQuery && (
            <View style={styles.emptyActionContainer}>
              <TouchableOpacity style={styles.bigButton} onPress={handleSetDirectory}>
                <FolderOpen size={24} color="#fff" />
                <Text style={styles.bigButtonText}>Select Folder to Scan</Text>
              </TouchableOpacity>
              <Text style={styles.helperText}>
                Choose a folder (like Downloads) to list all PDFs found there.
              </Text>
            </View>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredAndSortedPDFs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PDFCard
              pdf={item}
              onPress={() => handleOpenPDF(item)}
              onShare={() => handleShare(item)}
              onDelete={() => handleDelete(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Sort Modal */}
      <SortModal
        visible={showSortModal}
        currentSort={sortBy}
        onClose={() => setShowSortModal(false)}
        onSelect={setSortBy}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 44,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: '#ffffff',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  iconButton: {
    width: 48,
    height: 48,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyActionContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 40,
  },
  bigButton: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  bigButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  helperText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
  },
});
