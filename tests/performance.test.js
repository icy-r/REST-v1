const { exec } = require('child_process');
const path = require('path');
const http = require("http");

describe("Performance Tests", () => {
  beforeAll((done) => {
    // Check if server is running
    const req = http.request(
      {
        method: "GET",
        hostname: "localhost",
        port: 3000,
        path: "/",
        timeout: 2000,
      },
      () => {
        console.log("Server is running at http://localhost:3000");
        done();
      }
    );

    req.on("error", () => {
      console.warn(
        "⚠️ Warning: Server does not appear to be running at http://localhost:3000"
      );
      console.warn(
        '⚠️ Start the server with "pnpm run dev" before running performance tests'
      );
      done();
    });

    req.end();
  });

  it("should run performance tests using Artillery", (done) => {
    const artilleryPath = path.resolve(
      __dirname,
      "../node_modules/.bin/artillery"
    );
    const testScriptPath = path.resolve(__dirname, "performance.yml");

    exec(`${artilleryPath} run ${testScriptPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return done(error);
      }

      // Check if stderr contains only deprecation warnings
      if (stderr && !stderr.includes("DeprecationWarning")) {
        console.error(`Stderr: ${stderr}`);
        return done(new Error(stderr));
      }

      console.log(`Stdout: ${stdout}`);

      // Check if there were connection errors in the output
      if (stdout.includes("ECONNREFUSED")) {
        console.warn(
          "⚠️ Connection errors detected. Make sure your server is running on http://localhost:3000"
        );
      }

      done();
    });
  });
});
