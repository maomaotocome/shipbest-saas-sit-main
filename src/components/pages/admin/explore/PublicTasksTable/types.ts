export interface PublicTasksTableProps {
  taskTypeFilter: string;
  searchFilter: string;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
}

export interface MediaItem {
  taskId: string;
  subTaskId: string;
  index: number;
  type: 'image' | 'video';
  url: string;
  width?: number;
  height?: number;
  objectId: string;
}