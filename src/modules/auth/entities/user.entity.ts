export class UserEntity {
  readonly id: number;
  readonly name: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone: string;
  readonly role: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }

  get fullName(): string {
    return `${this.name} ${this.lastName}`;
  }
}
