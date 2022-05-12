const Sauce = require("../models/Sauce");
const fs = require("fs");

// création sauce
exports.createSauce = (req, res, next) => {
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
  // modification de l'image

  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

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
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce supprimée" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).jsons({ error }));
};

// Gestion like et dislike

exports.rateSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(function (likedSauce) {
      switch (req.body.like) {
        // Like = 1 => L'utilisateur aime la sauce (like = +1)
        case 1:
          if (
            !likedSauce.usersLiked.includes(req.body.userId) &&
            req.body.like === 1
          ) {
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { likes: 1 },
                $push: { usersLiked: req.body.userId },
              }
            )
              .then(() => {
                res.status(201).json({ message: "Like ajouté a la sauce!" });
              })
              .catch((error) => {
                res.status(400).json({ error });
              });
          }
          break;
        // L'utilisateur n'aime pas la sauce (like = -1)
        case -1:
          if (
            !likedSauce.usersDisliked.includes(req.body.userId) &&
            req.body.like === -1
          ) {
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { dislikes: 1 },
                $push: { usersDisliked: req.body.userId },
              }
            )
              .then(() => {
                res
                  .status(201)
                  .json({ message: "Dislike ajouté à la sauce !" });
              })
              .catch((error) => {
                res.status(400).json({ error });
              });
          }
          break;
        // Annulation du like par l'utilisateur
        case 0:
          if (likedSauce.usersLiked.includes(req.body.userId)) {
            Sauce.updateOne(
              { _id: req.params.id },
              { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId } }
            )
              .then(() => {
                res.status(201).json({ message: "Like retiré !" });
              })
              .catch((error) => {
                res.status(400).json({ error });
              });
          }
          // Annulation du dislike
          if (likedSauce.usersDisliked.includes(req.body.userId)) {
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { dislikes: -1 },
                $pull: { usersDisliked: req.body.userId },
              }
            )
              .then(() => {
                res.status(201).json({ message: "Dislike retiré !" });
              })
              .catch((error) => {
                res.status(400).json({ error });
              });
          }
          break;
      }
    })
    .catch((error) => {
      res.status(404).json({ error });
    });
};
