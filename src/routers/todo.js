import express from "express";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { v4 as uuidv4 } from "uuid";
import { validateTodo } from "../schemas/validators.js";
import auth from "../middleware/auth.js";
import { verifyToken } from "../functions/cookies.js";

dayjs.extend(utc);
const router = express.Router();

export default ({ todoRepository }) => {
  // Create new todo
  router.post("/", auth, async (req, res) => {
    try {
      let session = verifyToken(req.cookies["todox-session"]);

      const todoID = uuidv4();
      const created = dayjs().utc().toISOString();

      let newTodo = {
        ...req.body,
        todoID,
        userID: session.userID,
        created,
        completed: false,
      };

      if (validateTodo(newTodo)) {
        let resultTodo = await todoRepository.insertOne(newTodo);
        return res.status(201).send(resultTodo);
      }
      console.error(validateTodo.errors);
      return res.status(400).send({ error: "Invalid field used." });
    } catch (err) {
      console.error(err);
      return res.status(500).send({ error: "Todo creation failed." });
    }
  });
  //retrieve todos for a user
  //We ended up filtering the todos on the client side instead of doing so on the server.
  //However, if someone in the future wanted to use this endpoint elsewhere for getting todos based on their completion status, they could do so.
  router.get("/", auth, async (req, res) => {
    try {
      const session = verifyToken(req.cookies["todox-session"]);
      const todosResult = await todoRepository.findAllByUserID(session.userID, req.query.filter);
      return res.status(200).send(todosResult);
    } catch (err) {
      console.error(err);
      return res.status(500).send({ error: "Failed to retrieve todos." });
    }
  });
  //mark a todo as complete or incomplete
  router.patch("/:todoID", auth, async (req, res) => {
    try {
      const session = verifyToken(req.cookies["todox-session"]);
      const todoResult = await todoRepository.toggleCompleted(req.params.todoID, session.userID, req.body.completed);
      return res.status(200).send(todoResult);
    } catch (err) {
      console.error(err);
      return res.status(500).send({ error: "Failed to update todo." });
    }
  });

  return router;
};
