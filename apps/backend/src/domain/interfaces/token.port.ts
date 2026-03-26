export type TokenPayload = {
  sub: string;
  email: string;
  roles?: string[];
  iat?: number;
  exp?: number;
};

export const TOKEN_PORT = Symbol('TOKEN_PORT');

export interface TokenPort {
  sign(payload: TokenPayload, expiresIn?: string): string;
  verify<T extends TokenPayload = TokenPayload>(token: string): T;
}
