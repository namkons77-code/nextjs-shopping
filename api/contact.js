import { handleContact } from '../server/handlers.mjs';

export default async function handler(req, res) {
  await handleContact(req, res);
}
