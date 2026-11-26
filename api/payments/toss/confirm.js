import { handleTossConfirm } from '../../../server/handlers.mjs';

export default async function handler(req, res) {
  await handleTossConfirm(req, res);
}
