export interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface TokenPairDto {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshDto {
  refreshToken: string;
}
