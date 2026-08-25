export type CreateAlertInput = {
  email: string;
  gameSlug: string;
  gameName: string;
};

export type CreateAlertResult = { ok: true } | { ok: false; error: string };
