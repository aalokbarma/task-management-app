const fs = require('fs');
const path = require('path');

const ENVIRONMENTS = new Set(['development', 'staging', 'production']);

function resolveEnvironment(envFile) {
  const name = envFile || process.env.ENVFILE || '.env.development';
  if (name.includes('staging')) {
    return 'staging';
  }
  if (name.includes('production')) {
    return 'production';
  }
  return 'development';
}

function pickSource(directory, basename) {
  const realPath = path.join(directory, basename);
  const examplePath = path.join(directory, `${basename}.example`);

  if (fs.existsSync(realPath)) {
    return realPath;
  }

  if (fs.existsSync(examplePath)) {
    return examplePath;
  }

  throw new Error(
    `Missing Firebase native config at ${realPath} (or ${path.basename(examplePath)}). Download it from the Firebase console.`,
  );
}

function copyFile(source, destination) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

const root = path.resolve(__dirname, '..');
const environment = resolveEnvironment(process.env.ENVFILE);

if (!ENVIRONMENTS.has(environment)) {
  throw new Error(`Unsupported Firebase environment: ${environment}`);
}

const sourceDir = path.join(root, 'config', 'firebase', environment);

copyFile(
  pickSource(sourceDir, 'google-services.json'),
  path.join(root, 'android', 'app', 'google-services.json'),
);
copyFile(
  pickSource(sourceDir, 'GoogleService-Info.plist'),
  path.join(root, 'ios', 'taskapp', 'GoogleService-Info.plist'),
);

process.stdout.write(`Synced Firebase native config for ${environment}\n`);
