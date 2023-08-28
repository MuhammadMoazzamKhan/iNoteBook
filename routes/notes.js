const express = require("express")
const router = express.Router()
const fetchuser = require("../middleware/fetchuser")
const { body, validationResult } = require('express-validator');

const Note = require("../models/Note")

router.get("/fetchallnotes", fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id })
        res.json(notes)
    } catch (error) {
        res.status(500).send("Interal server error");
    }

})

router.post("/addnote", fetchuser, [
    body('title', "Enter a vlaid title").isLength({ min: 3 }),
    body('description', "Description must be atleast 5 characters").isLength({ min: 5 }),
], async (req, res) => {
    try {

        const { title, description, tag } = req.body;

        const result = validationResult(req);
        if (!result.isEmpty()) {
            res.send({ errors: result.array() });
        }

        const note = new Note({
            title, description, tag, user: req.user.id
        })
        const saveNote = await note.save()

        res.json(saveNote)

    } catch (error) {
        console.log(error.message)
        res.status(500).send("Interal server error");
    }
})

router.put("/updatenote/:id", fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;

    const newNote = {};
    if (title) { newNote.title = title };
    if (description) { newNote.description = description };
    if (tag) { newNote.tag = tag };
    try {

        let note = await Note.findById(req.params.id);

        if (!note) { return res.status(404).send("Not found") };

        if (note.user.toString() !== req.user.id) { return res.status(404).send("Not found") };

        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })

        res.json({ note })
    } catch (error) {
        console.log(error.message)
        res.status(500).send("Interal server error");
    }
})

router.delete("/deletenote/:id", fetchuser, async (req, res) => {
    try {
        let note = await Note.findById(req.params.id)
        if (!note) { return res.status(404).send("Not found") };

        if (note.user.toString() !== req.user.id) { return res.status(404).send("Not found") };

        note = await Note.findByIdAndDelete(req.params.id)

        res.json({ "Success": "Note has been deleted", note })
    } catch (error) {
        console.log(error.message)
        res.status(500).send("Interal server error");
    }
})

module.exports = router
