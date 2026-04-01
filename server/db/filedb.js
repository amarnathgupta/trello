import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Project root /data — cwd se independent (warna server/ se node chalane par ./data galat jagah jaata hai)
const DATA_DIR = path.join(__dirname, "../../data");

const writeQueue = {};

async function enqueueWrite(filename, fn) {
  if (!writeQueue[filename]) {
    writeQueue[filename] = Promise.resolve();
  }

  writeQueue[filename] = writeQueue[filename].then(fn);
  return writeQueue[filename];
}

export async function readData(filename) {
  const key = filename.toLowerCase();
  try {
    const data = await fs.readFile(path.join(DATA_DIR, `${key}.json`), "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return {
      [key]: [],
    };
  }
}

export async function insertData(filename, data) {
  const key = filename.toLowerCase();

  return enqueueWrite(key, async () => {
    const res = await readData(filename);
    const records = res[key];
    records.push(data);
    await fs.writeFile(
      path.join(DATA_DIR, `${key}.json`),
      JSON.stringify({ [key]: records }, null, 2),
    );
  });
}

export async function deleteData(filename, id) {
  const key = filename.toLowerCase();

  return enqueueWrite(key, async () => {
    const res = await readData(key);
    const filtered = res[key].filter((record) => record.id != id);
    await fs.writeFile(
      path.join(DATA_DIR, `${key}.json`),
      JSON.stringify({ [key]: filtered }, null, 2),
    );
  });
}

export async function replaceData(filename, data) {
  const key = filename.toLowerCase();
  return enqueueWrite(key, async () => {
    return await fs.writeFile(
      path.join(DATA_DIR, `${key}.json`),
      JSON.stringify({ [key]: data }, null, 2),
    );
  });
}
