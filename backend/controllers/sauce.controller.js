const Sauce = require('../model/sauce.model')
const fs = require('fs');

exports.createSauce = (req, res) => {
    const sauceObject = JSON.parse(req.body.sauce);
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce enregistrée !' }))
        .catch(error => res.status(400).json({ error }));
};

exports.getAllSauce = (req, res) => {
    Sauce.find()
        .then(sauces => {
            res.status(200).json(sauces);
        })
        .catch(error => {
            res.status(404).json({ error })
        });
};

exports.getOneSauce = (req, res) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            res.status(200).json(sauce);
        })
        .catch(error => res.status(404).json({ error }));
};


exports.updateSauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete sauceObject._userId;
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet modifié!' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deleteSauce = (req, res) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

exports.likeSauce = (req, res, next) => {

    // on like la sauce
    if (req.body.like == 1) {
        Sauce.updateOne({ _id: req.params.id },
            {
                $inc: {
                    likes: 1
                }, $push: { usersLiked: req.body.userId }
            })
            .then(() => res.status(200).json({ message: 'Objet modifié !' }))
            .catch(error => res.status(400).json({ error }));
    }
    // on dislike la sauce
    if (req.body.like == -1) {
        Sauce.updateOne({ _id: req.params.id },
            {
                $inc: {
                    dislikes: 1
                }, $push: { usersDisliked: req.body.userId }
            })
            .then(() => res.status(200).json({ message: 'Objet modifié !' }))
            .catch(error => res.status(400).json({ error }));
    }
    // on supprime le vote
    if (req.body.like == 0) {
        Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
        if (sauce.usersLiked.includes(req.params.id)) {
            Sauce.updateOne({ _id: req.params.id },
                {
                    $inc: {
                        likes: -1
                    }, $push: { usersLiked: req.body.userId }
                })
                .then(() => res.status(200).json({ message: 'Objet modifié !' }))
                .catch(error => res.status(400).json({ error }));
        }
        else {
            Sauce.updateOne({ _id: req.params.id },
                {
                    $inc: {
                        dislikes: -1
                    }, $push: { usersLiked: req.body.userId }
                })
                .then(() => res.status(200).json({ message: 'Objet modifié !' }))
                .catch(error => res.status(400).json({ error }));
        }
    })
    .catch(error => res.status(400).json({ error }));
    }
}
