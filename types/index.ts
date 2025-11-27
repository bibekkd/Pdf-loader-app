export interface PDFFile {
    id: string;
    name: string;
    size: number;
    modificationTime: number;
    uri: string;
}

export type SortOption =
    | 'nameAsc'
    | 'nameDesc'
    | 'dateDesc'
    | 'dateAsc'
    | 'sizeDesc'
    | 'sizeAsc';

export interface SortOptionItem {
    label: string;
    value: SortOption;
}
