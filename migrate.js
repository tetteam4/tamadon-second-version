const { exec } = require("child_process");

function runCommand(command, name, callback) {
  const process = exec(command, { shell: true });

  process.stdout.on("data", (data) => {
    console.log(`[${name}] ${data}`);
  });

  process.stderr.on("data", (data) => {
    console.error(`[${name} Error] ${data}`);
  });

  process.on("close", (code) => {
    if (code === 0) {
      console.log(`[${name}] Process completed successfully.`);
    } else {
      console.error(`[${name}] Process exited with code ${code}`);
    }
    if (callback) callback();
  });
}

runCommand(
  "cd Backend && .\\dj-venv\\Scripts\\activate && python .\\manage.py makemigrations",
  "Backend Makemigrations",
  () => {
    runCommand(
      "cd Backend && .\\venv\\Scripts\\activate && python .\\manage.py migrate",
      "Backend Migrate",
      () => {
        console.log("[Backend] Migrations completed successfully.");
      }
    );
  }
);
