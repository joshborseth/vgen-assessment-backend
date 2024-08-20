export default (db) => {
  const { TODO_COLLECTION } = process.env;
  const collection = db.collection(TODO_COLLECTION);

  async function insertOne(todo) {
    return await collection.insertOne(todo);
  }

  async function findAllByUserID(userID, filter) {
    const query = { userID };
    if (filter === "completed") {
      query.completed = true;
    }
    if (filter === "incompleted") {
      query.completed = false;
    }
    return await collection.find(query).sort({ created: -1 }).toArray();
  }

  async function toggleCompleted(todoID, userID, completed) {
    return await collection.findOneAndUpdate(
      {
        todoID,
        userID,
      },
      {
        $set: {
          completed: !completed,
        },
      },
      {
        returnDocument: "after",
      }
    );
  }

  return {
    insertOne,
    findAllByUserID,
    toggleCompleted,
  };
};
