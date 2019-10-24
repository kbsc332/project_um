let dotenv = require('dotenv');

// Set default to "development"
const nodeEnv = process.env.ENV_FILE || 'development';
const config = dotenv.config({
    path: `./env/${nodeEnv}.env`,
});

if (config.error) {
    throw config.error;
}
