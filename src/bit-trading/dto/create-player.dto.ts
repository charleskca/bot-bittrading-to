export class CreatePlayerDto {
  readonly telegramId: number;
  readonly accountName: string;
  readonly password: string;
  readonly token: string;
  readonly expiredDate: string;
}
