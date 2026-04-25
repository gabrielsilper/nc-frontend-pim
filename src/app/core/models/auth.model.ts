import { AuthUserDTO } from './user.model';

export interface LoginDTO {
  email: string;
  password: string;
}

export interface ResponseTokensDTO {
  accessToken: string;
  refreshToken: string;
  user: AuthUserDTO;
}
