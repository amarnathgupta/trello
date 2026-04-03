import Card from "../db/card.db.js";

export const createCardController = async (req, res) => {
  try {
    const { title, description = "" } = req.body;
    const { listId } = req.params;

    if (!title) {
      return res.status(400).json({ message: "Card title is required." });
    }
    const cards = await Card.findAll(listId);
    if (cards.some((card) => card.title === title)) {
      return res
        .status(400)
        .json({ message: "Card with this title already exists." });
    }

    // Create the new card
    const newCard = await Card.create({
      id: crypto.randomUUID(),
      title,
      description,
      listId,
      createdAt: new Date().toISOString(),
    });

    return res
      .status(201)
      .json({ message: "Card created successfully.", data: newCard });
  } catch (error) {
    console.error("Error creating card: ", error);
    return res
      .status(500)
      .json({ message: "Server error creating card.", error: error.message });
  }
};

export const getAllCardsController = async (req, res) => {
  const { listId } = req.params;
  try {
    const cards = await Card.findAll(listId);
    return res.status(200).json({ data: cards });
  } catch (error) {
    console.error("Error getting cards: ", error);
    return res.status(500).json({ error: "Failed to get cards" });
  }
};

export const getCardByIdController = async (req, res) => {
  const { cardId } = req.params;
  try {
    const card = await Card.findById(cardId);
    return res.status(200).json({ data: card });
  } catch (error) {
    console.error("Error getting card: ", error);
    return res.status(500).json({ error: "Failed to get card" });
  }
};

export const updateCardByIdController = async (req, res) => {
  const { cardId } = req.params;
  const { title, description, listId } = req.body;
  try {
    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: "Card not found." });
    }
    await Card.update(cardId, { title, description, listId });
    return res.status(200).json({ message: "Card updated successfully." });
  } catch (error) {
    console.error("Error updating card: ", error);
    return res
      .status(500)
      .json({ message: "Server error updating card.", error: error.message });
  }
};

export const deleteCardByIdController = async (req, res) => {
  const { cardId } = req.params;
  try {
    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: "Card not found." });
    }
    await Card.delete(cardId);
    return res.status(200).json({ message: "Card deleted successfully." });
  } catch (error) {
    console.error("Error deleting card: ", error);
    return res
      .status(500)
      .json({ message: "Server error deleting card.", error: error.message });
  }
};
