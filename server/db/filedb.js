import fs from "fs/promises";

const writeQueue = {};

async function enqueueWrite(filename, fn) {
  if (!writeQueue[filename]) {
    writeQueue[filename] = Promise.resolve();
  }

  writeQueue[filename] = writeQueue[filename].then(fn);
  return writeQueue[filename];
}

export async function readData(filename) {
  try {
    const data = await fs.readFile(
      `./data/${filename.toLowerCase()}.json`,
      "utf-8",
    );
    return JSON.parse(data);
  } catch (error) {
    return {
      [filename.toLowerCase()]: [],
    };
  }
}

export async function writeData(filename, data) {
  const key = filename.toLowerCase();

  return enqueueWrite(key, async () => {
    const res = await readData(filename);
    const records = res[key];
    records.push(data);
    return await fs.writeFile(
      `./data/${filename.toLowerCase()}.json`,
      JSON.stringify({ [key]: records }, null, 2),
    );
  });
}

export async function deleteData(filename, id) {
  const key = filename.toLowerCase();

  return enqueueWrite(key, async () => {
    const res = await readData(key);
    let deleted;
    const filtered = res[key].filter((record) => {
      if (record.id === id) {
        deleted = record;
        return false;
      }
      return true;
    });
    await fs.writeFile(
      `./data/${filename.toLowerCase()}.json`,
      JSON.stringify({ [key]: filtered }, null, 2),
    );
    return deleted;
  });
}

export async function overwriteData(filename, data) {
  const key = filename.toLowerCase();
  return enqueueWrite(key, async () => {
    return await fs.writeFile(
      `./data/${filename.toLowerCase()}.json`,
      JSON.stringify({ [key]: data }, null, 2),
    );
  });
}
