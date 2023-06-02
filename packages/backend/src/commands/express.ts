/* istanbul ignore file */
import setupApp from "../api/routes";

export const command = "start-server";
export const describe = "start web server";

export function handler(): void {
  const app = setupApp();

  const port = 8080;
  app.listen(port, () => console.log(`API up and running on port ${port}`));
}
