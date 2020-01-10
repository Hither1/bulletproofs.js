const childProcess = require('child_process');
const fs = require('fs');

const { spawn } = childProcess;

/**
 * Takes in a proving key and a compiled code file and outputs a proof.
 *
 * TODO: Needs to check that files and whatnot all exist.
 * TODO: Haven't been able to test it yet, I need values from the Nightfall repository.
 *
 * @example
 * generateProof('./code/ft-mint/ft-mint-pk.key',
 *   './generators/ft-mint/ft-mint-compiled',
 *   {
 *     createFile: true,
 *     directory: './code/ft-mint',
 *     fileName: 'ft-mint-proof.json',
 *   },
 * );
 *
 * @param {String} provingKeyPath - Path to proving key
 * @param {String} genPath - Path to file that stores (Result of compile that doesn't end in .code)
 * @param {Object} [options] - Options for output
 * @param {Boolean} options.createFile - Whether or not to output a json file
 * @param {String} [options.directory=./] - Directory to output files in
 * @param {String} [options.fileName=proof.json] - Name of JSON proof file ()
 * @returns {Object} JSON of the proof.
 */
async function generateProof(provingKeyPath, genPath, options = {}) {
  if (!fs.existsSync(genPath)) {
    throw new Error('generate-proof genPath input file(s) not found');
  }

  if (!fs.existsSync(provingKeyPath)) {
    throw new Error('generate-proof proving key path file not found');
  }

  /*if (!genPath.endsWith('.code')) {
    throw new Error("Expected the compiled code that didn't end in .code");
  }
  */
  if (!provingKeyPath.endsWith('.key')) {
    throw new Error('Expected a .key file');
  }

  // Whether we need to create a file or not.
  const createFile = options && options.createFile;

  const args = [
    'generate-proof',
    '-i',
    genPath,
    '-p',
    provingKeyPath,
  ];

  if (createFile) {
    // Ensure path ends with '/'
    const { directory } = options;
    const parsedOutputPath = directory.endsWith('/') ? directory : `${directory}/`;

    const fileName = options.fileName ? options.fileName : 'proof.json';
    const parsedFileName = fileName.endsWith('.json') ? fileName : `${fileName}.json`;

    args.push('-j');
    args.push(`${parsedOutputPath}${parsedFileName}`);
  }

  // Deleted ENV variables in this step
  return new Promise((resolve, reject) => {
    const bulletproofs = spawn('/bulletproofs/target/debug/generate_proof', args, {
      stdio: ['ignore', 'ignore', 'pipe'],
    });

    bulletproofs.stderr.on('data', err => {
      reject(new Error(`Generate proof failed: ${err}`));
    });

    bulletproofs.on('close', () => {
      // Generate-proof doesn't seem to have any output, so we're not doing the same check as the other functions.
      resolve();
    });
  });
}

module.exports = generateProof;