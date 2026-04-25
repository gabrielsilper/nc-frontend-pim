import { Profile } from './profile.enum';

export interface ResponseUserDTO {
  id: string;
  name: string;
  email: string;
  profile: Profile;
}

export interface AuthUserDTO {
  id: string;
  profile: Profile;
  name?: string;
  email?: string;
}
