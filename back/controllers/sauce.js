const Sauce = require("../models/Sauce");
const fs = require("fs");

// création sauce
exports.creatSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce enregistrée" }))
    .catch((error) => res.status(400).json({ error }));
};

// récupération de toutes les sauces
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

//récupération d'une sauce
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(400).json({ error }));
};

// modification sauce
exports.modifySauce = (req, res, next) => {
  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(() => res.status(200).json({ message: "Sauce modifiée" }))
    .catch((error) => res.status(404).json({ error }));
};

//suppression d'une sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (!sauce) {
        return res.status(404).json({ error: "Sauce non trouvée" });
      }
      if (sauce.userId !== req.auth.userId) {
        return res.status(401).json({ error: "Requête non autorisée" });
      }

      Sauce.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: "Sauce supprimée" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).jsons({ error }));
};
