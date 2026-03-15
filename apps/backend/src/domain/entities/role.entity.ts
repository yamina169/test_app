export class Role {
  constructor(
    public readonly id: number,
    public readonly type: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
