import fs from 'fs';

import chalk from 'chalk';

import getAbsolutePath from '../helpers/getAbsolutePath';
import log from '../log/default/large';

/* Make sure that we only print some feedback once */
let onceApp = true;

/**
 * Gets the project configuration by reading a file.
 *
 * Will give a warning if ROC_CONFIG_PATH has been set since that will then be used as the path to get the configuration
 * file, even if one is provided to the function.
 *
 * Reads configuration files in this manner:
 * 1. Environment variable ROC_CONFIG_PATH.
 * 2. Path given as projectConfigPath.
 * 3. Default by trying to read "roc.config.js" in the current working directory.
 * 4. Return a empty object along with a warning.
 *
 * @param {string} projectConfigPath - Path to application configuration file. Can be either relative or absolute.
 * @param {string} [directory=process.cwd()] - The directory to resolve relative paths to. By default will use the
 *     current working directory.
 * @param {boolean} [verbose=false] - If extra information should be printed.
 *
 * @returns {object} - The application configuration object.
 * @throws {Error} - When an invalid path override is specified.
 */
export default function getProjectConfig(projectConfigPath, directory = process.cwd(), verbose = false) {
    if (projectConfigPath === false) {
        return {};
    }

    let configPath = getAbsolutePath(process.env.ROC_CONFIG_PATH || projectConfigPath, directory);

    if (onceApp && projectConfigPath && process.env.ROC_CONFIG_PATH) {
        onceApp = false;
        log.warn(
            'You have configured a location for the application configuration file but the ' +
            `environment variable ${chalk.bold('ROC_CONFIG_PATH')} is set and that will be used instead. The ` +
            `path that will be used is ${configPath}`,
            'Configuration'
        );
    }

    try {
        if (configPath) {
            const stats = fs.statSync(configPath);
            if (!stats.isFile()) {
                throw new Error('Not a file.');
            }
        }
    } catch (err) {
        log.error(
            `Configuration path points to unaccessible file: ${configPath}`,
            'Configuration'
        );
    }

    // Return correct project configuration with fallback to empty object
    configPath = configPath || getAbsolutePath('roc.config.js', directory);
    try {
        const config = require(configPath); // eslint-disable-line

        if (Object.keys(config).length === 0) {
            log.warn(
                `The configuration file at ${chalk.bold(configPath)} was empty.`,
                'Configuration'
            );
        }

        return config;
    } catch (err) {
        if (err.constructor === SyntaxError) {
            log.warn(
                `
                Something is wrong with the configuration file at ${chalk.bold(configPath)} and it will be ignored.
                Received: ${chalk.underline(err.message)}`,
                'Configuration'
            );
        } else if (verbose) {
            log.warn(
                `Could not find the configuration file at ${chalk.bold(configPath)}.`,
                'Configuration'
            );
        }

        return {};
    }
}
