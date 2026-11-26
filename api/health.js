import { handleHealth } from '../server/handlers.mjs';

export default function handler(req, res) {
  handleHealth(req, res);
}
