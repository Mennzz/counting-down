export type UserType = "Joris" | "Danfeng";
export type RelationshipMode = "LONG_DISTANCE" | "SAME_LOCATION" | "HYBRID";

export interface RelationshipPersonProfile {
  userType: UserType;
  preferredName: string;
  location: string;
  timezone: string;
  personalityNotes: string;
  preferencesNotes: string;
}

export interface RelationshipProfileInput {
  relationshipMode: RelationshipMode;
  currentlyTogether: boolean;
  togetherThrough: string | null;
  relationshipNotes: string;
  practicalNotes: string;
  people: RelationshipPersonProfile[];
}

export interface RelationshipProfile extends RelationshipProfileInput {
  id?: string | null;
  updatedByUserType?: UserType | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
