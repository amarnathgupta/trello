import List from "../db/list.db.js";

export async function checkListExists(req, res, next) {
  const { listId } = req.params;
  if (!listId || listId.trim() === "") {
    return res
      .status(400)
      .json({ message: "List ID is required in the route parameters." });
  }
  try {
    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ message: "List not found." });
    }
    next();
  } catch (error) {
    console.error("Error checking list existence: ", error);
    return res
      .status(500)
      .json({ message: "Server error checking list existence." });
  }
}
