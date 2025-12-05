// // import type { Role } from '@prisma/client';

// /**
//  * Base de User
// //  */
// // export interface UserBase {
// //   id: number;
// //   name: string;
// //   phone: string;
// //   password: string;
// //   role: Role;
// //   isActive: boolean;
// //   createdAt: Date;
// //   updatedAt: Date;
// // }

// /**
//  * Base de UserProfile
//  */
// export interface UserProfileBase {
//   id: number;
//   userId: number;
//   bio: string | null;
//   avatarUrl: string | null;
// }

// /**
//  * Tipos derivados
//  */
// export type UserIdentifier = Pick<UserBase, 'id' | 'phone'>;
// export type UserBasicInfo = Pick<UserBase, 'id' | 'name' | 'phone'>;
// export type UserStatus = Pick<UserBase, 'isActive' | 'role'>;
