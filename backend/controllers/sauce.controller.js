const Sauce = require('../model/sauce.model')
const fs = require('fs');

/*
// Permet de créer une sauce. 
*/

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
        .then(() => res.status(201).json({ message: 'La sauce a été enregistrée' }))
        .catch(error => res.status(400).json({ error }));
};

/*
// Permet de récupérer toutes les sauces, afin de les afficher sur la page d'acceuil.
*/

exports.getAllSauce = (req, res) => {
    Sauce.find()
        .then(sauces => {
            res.status(200).json(sauces);
        })
        .catch(error => {
            res.status(404).json({ error })
        });
};

/*
// Permet de d'avoir une sauce en particulière grâce à l'ID.
*/

exports.getOneSauce = (req, res) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            res.status(200).json(sauce);
        })
        .catch(error => res.status(404).json({ error }));
};

/*
// Permet de mettre à jour une sauce en particulière.
*/

exports.updateSauce = (req, res, next) => {
    // création d'un objet sauce, afin de remplacer le contenu des variables du body.
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete sauceObject._userId;
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Vous n êtes pas autorisée' });
            } else {
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'La sauce a bien été mise à jour' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

/*
// Permet de supprimer une sauce.
*/

exports.deleteSauce = (req, res) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Vous n êtes pas autorisée' });
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'La sauce a été supprimée' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

/*
// Permet de liker ou ne pas liker une sauce.
// il existe 3 cas de figures:
// Soit on aime (==1)
// Soit on aime pas (==-1)
// Soit met à jour le like (==0)
*/

exports.likeSauce = (req, res, next) => {

    if(req.body.like == 1) {
        Sauce.findOne({ _id: req.params.id }) 
            .then((sauce) => {
                if(!sauce.usersLiked.includes(req.body.userId)) {
                    Sauce.updateOne(
                        { _id: req.params.id },
                        {
                            $inc: {
                                likes: 1
                            },
                            $push: {usersLiked: req.body.userId}
                        }
                    )
                    .then(() => res.status(201).json({ message: 'Vous aimé la sauce'}))
                    .catch((error) => res.status(400).json({ error }));
                }
            })
        .catch((error) => res.status(400).json({ error }));
    }

    if(req.body.like === -1) {
        Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if(!sauce.usersDisliked.includes(req.body.userId)) {
                Sauce.updateOne(
                    { _id: req.params.id },
                    {
                        $inc: {
                            dislikes: 1
                        },
                        $push: {usersDisliked: req.body.userId}
                    }
                )
                .then(() => res.status(201).json({ message: 'Vous n aimez pas la sauce'}))
                .catch((error) => res.status(400).json({ error }));  
            }
        })
        .catch((error) => res.status(400).json({ error }));
    }

    if(req.body.like===0) {
        Sauce.findOne({ _id: req.params.id })
            .then((sauce) => {
                if(sauce.usersLiked.includes(req.body.userId)) {
                    Sauce.updateOne(
                        { _id: req.params.id },
                        {
                            $inc: {
                                likes: -1
                            },
                            $pull: {usersLiked: req.body.userId}
                        }
                    )
                    .then(() => res.status(201).json({ message: 'Votre vote a ete mis a jour'}))
                    .catch((error) => res.status(400).json({ error }));
                }

                else {
                    Sauce.updateOne(
                        { _id: req.params.id },
                        { 
                            $inc: {
                                dislikes: -1
                            },
                            $pull: {usersDisliked: req.body.userId}
                        }
                    )
                    .then(() => res.status(201).json({ message: 'Votre vote a ete mis a jour'}))
                    .catch((error) => res.status(400).json({ error }));
                }
            })
            .catch((error) => res.status(400).json({ error }));
    }
};