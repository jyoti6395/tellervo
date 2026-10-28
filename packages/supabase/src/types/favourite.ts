export interface FavouriteRecord {
  user_id: string;
  order_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface UpsertFavouriteInput {
  user_id: string;
  order_ids: string[];
  updated_at?: string;
}

