import type { ProfileRecord } from './auth';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRecord;
        Insert: Partial<ProfileRecord> & { id: string };
        Update: Partial<ProfileRecord>;
      };
    };
  };
}
