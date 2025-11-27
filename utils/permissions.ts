
/**
 * Requests storage permission
 * Modern FileSystem API handles permissions internally via directory picker
 */
export const requestStoragePermission = async (): Promise<boolean> => {
    // iOS: No permissions needed for app's sandboxed directories
    // Android: Directory picker handles permissions
    return true;
};
