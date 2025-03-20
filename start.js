const { exec } = require("child_process");

// Start the backend server
const backend = exec(
  "cd Backend && .\\dj-venv\\Scripts\\activate && python .\\manage.py runserver",
  { shell: true }
);

backend.stdout.on("data", (data) => {
  console.log(`[Backend] ${data}`);
});

backend.stderr.on("data", (data) => {
  console.error(`[Backend State] ${data}`);
});

const frontend = exec("cd frontend && npm run dev", { shell: true });

frontend.stdout.on("data", (data) => {
  console.log(`[Frontend] ${data}`);
});

frontend.stderr.on("data", (data) => {
  console.error(`[Frontend State] ${data}`);
});
