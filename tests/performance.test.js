const { exec } = require('child_process');
const path = require('path');

describe('Performance Tests', () => {
  it('should run performance tests using Artillery', (done) => {
    const artilleryPath = path.resolve(__dirname, '../node_modules/.bin/artillery');
    const testScriptPath = path.resolve(__dirname, 'performance.yml');

    exec(`${artilleryPath} run ${testScriptPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return done(error);
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return done(new Error(stderr));
      }
      console.log(`Stdout: ${stdout}`);
      done();
    });
  });
});
