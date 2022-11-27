import { createServer } from './api';
import { initializeDependency } from './ioc';

async function main() {
  const { config } = await initializeDependency();

  const server = await createServer(config);
  server.listen(config.port, () => console.log(`slacktower started on http://localhost:${config.port}`));
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err.stack);
    process.exit(1);
  });
}
