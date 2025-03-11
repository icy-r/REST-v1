const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Running Snyk security test...');

try {
  // Try running the test
  const output = execSync('snyk test', { stdio: 'pipe' }).toString();
  console.log(output);
  process.exit(0);
} catch (error) {
  // Check if it's an authentication error
  if (error.stderr && error.stderr.toString().includes('Authentication error')) {
    console.log('\n💡 Snyk requires authentication before running security tests.');
    console.log('You need to authenticate with Snyk first.');
    
    rl.question('\nWould you like to authenticate now? (y/n): ', (answer) => {
      if (answer.toLowerCase() === 'y') {
        console.log('\nRunning Snyk authentication...');
        try {
          execSync('snyk auth', { stdio: 'inherit' });
          console.log('\nAuthentication completed. You can now run "pnpm test:security" again.');
        } catch (authError) {
          console.error('\nAuthentication failed. Please try manually with "pnpm snyk:auth"');
        }
      } else {
        console.log('\nTo authenticate manually, run "pnpm snyk:auth" and follow the instructions.');
        console.log('After authentication, you can run "pnpm test:security" to perform the security test.');
      }
      rl.close();
    });
  } else {
    // If it's not an authentication error, show the original error
    console.error(error.stderr ? error.stderr.toString() : error.message);
    process.exit(1);
  }
}
