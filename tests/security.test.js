const { exec } = require('child_process');
const path = require('path');

describe('Security Tests', () => {
  it('should run security tests using OWASP ZAP', (done) => {
    const zapPath = path.resolve(__dirname, '../node_modules/.bin/owasp-zap-cli');
    const targetUrl = 'http://localhost:3000';

    exec(`${zapPath} quick-scan ${targetUrl}`, (error, stdout, stderr) => {
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
