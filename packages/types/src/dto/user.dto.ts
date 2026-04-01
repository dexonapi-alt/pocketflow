export interface UserProfileDto {
  id: string;
  email: string;
  fullName: string;
  currency: string;
  timezone: string;
  createdAt: string;
}

export interface UpdateUserDto {
  fullName?: string;
  currency?: string;
  timezone?: string;
}
