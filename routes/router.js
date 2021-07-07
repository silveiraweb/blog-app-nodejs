const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");

require("../models/Postagem");
const Postagem = mongoose.model("postagens");
require("../models/Categoria");
const Categoria = mongoose.model("categorias");

router.get("/", (req, res) => {
    Postagem.find()
      .populate("categoria")
      .sort({ data: "desc" })
      .then((postagens) => {
        res.render("public/index", {
          postagens: postagens
        });
      })
      .catch((error) => {
        req.flash("error_msg", "Houve um erro");
        res.render("/404");
      });
  
});

router.get("/postagem/:slug", (req, res) => {
    Postagem.findOne({ slug: req.params.slug }).then((postagem) => {
        if(postagem){
            res.render("public/postagem/index", {postagem:postagem});
        }else{
            req.flash("error_msg", "Postagem não existe");
            res.redirect("/");
        }
    }).catch((error) => {
        req.flash("error_msg", "Houve um  erro");
        res.redirect("/");
    })
});

router.get("/categorias", (req, res) => {
    Categoria
      .find()
      .then((categorias) => {
        if (categorias) {
          res.render("public/categorias/index", { categorias: categorias });
        } else {
          req.flash("error_msg", "Categoria não existe");
          res.redirect("/");
        }
      })
      .catch((error) => {
        req.flash("error_msg", "Houve um  erro");
        res.redirect("/");
      });
});
router.get("/categorias/:slug", (req, res) => {
  Categoria.findOne({ slug: req.params.slug })
    .then((categoria) => {
      if (categoria) {
        Postagem.find({categoria: categoria._id}).then((postagens) => {
          res.render("public/categorias/postagens", {
            categoria: categoria,
            postagens: postagens
          });
        }).catch((error) => {
          req.flash("error_msg", "Categorias não localizada");
          res.redirect("/");
        })
      } else {
        req.flash("error_msg", "Categorias não existe");
        res.redirect("/");
      }
    })
    .catch((error) => {
      req.flash("error_msg", "Houve um  erro");
      res.redirect("/");
    });
});
router.get("/404", (req, res) => {
    res.send("Erro 404");
});

module.exports = router;