const express = require("express");
const router = express.Router();
const Medicine = require("../models/Medicine");

//create
router.post("/", async(req, res) => {
    try{
        const medicine = await Medicine.create(req.body);
        res.status(201).json(medicine);
    }catch(err){
        res.status(400).json({ error: err.message });
    }
});

//read all
router.get("/", async(req, res) => {
    try{
        const medicines = await Medicine.find();
        res.json(medicines);
    }catch(err){
        res.status(500).json({ error: "Server error" });
    }
});

//read one
router.get("/:id", async (req, res) => {
    try{
        const medicine = await Medicine.findById(req.params.id);
        if(!medicine){
            return res.status(404).json({ error: "Medicine not found" });
        }
        res.json(medicine);
    }catch(err){
        res.status(500).json({ error: "Inavalid ID" });
    }
});

//update
router.put("/:id", async (req, res) => {
    try{
        const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if(!medicine){
            return res.status(404).json({ error: "Medicine not found" });
        }
        res.json(medicine);
    }catch(err){
        res.status(400).json({ error: err.message });
    }
});

//delete
router.delete("/:id", async (req, res) => {
    try{
        const medicine = await Medicine.findByIdAndDelete(req.params.id);
        if(!medicine){
            return res.status(404).json({ error: "Medicine not found" });
        }
        res.json({ message: "Medicine deleted successfully"});
    }catch(err){
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;

