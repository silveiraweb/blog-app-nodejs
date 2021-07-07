const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const passport = require("passport");

const router = express.Router();

require("../models/Usuario");
const Usuario = mongoose.model("usuarios")


router.get("/registro", (req, res)  => {
    res.render("usuarios/registro");
})

router.post("/registro", (req, res) => {
  let error = [];
    if(!req.body.nome || req.body.nome == undefined || req.body.nome == null){
        error.push({ text: "Nome invalido" })
    }
    if (!req.body.email || req.body.email == undefined || req.body.email == null) {
      error.push({ text: "Email invalido" });
    }
    if (!req.body.senha || req.body.senha == undefined || req.body.senha == null) {
      error.push({ text: "Senha invalida" });
    }
    if (req.body.senha.length < 4) {
      error.push({ text: "Senha deve conter  no  minimo 4 carateres" });
    }
    if (req.body.senha != req.body.repita_senha) {
      error.push({ text: "Senhas não conferem" });
    }

    if(error.length > 0 ){
        res.render("usuarios/registro", { error: error });
    }else{
        Usuario.findOne({email: req.body.email}).then((usuario) => {
            if(usuario){
                req.flash("error_msg", "Email já cadastrado");
                res.redirect("/users/registro");
            }else{
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                });
                bcrypt.genSalt(10, (erro, salt) =>  {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if(erro){
                            req.flash("error_msg",  "Houve erro ao salvar usuario")
                            res.redirect("/users/registro")
                        }
                        novoUsuario.senha = hash;
                        novoUsuario.save().then(() => {
                            req.flash("success_msg", "Usuario criado com sucesso");
                            res.redirect("/");
                        }).catch((error)  => {
                            req.flash("error_msg", "Falha ao criar usuario");
                            res.redirect("/registro");
                        })
                    })
                }) 
            }        
        }).catch((error) => {
            req.flash("error_msg", "Houve um  erro interno");
            res.redirect("/");
        })
        
    }
});

router.get("/login", (req, res) => {
    res.render("usuarios/login");
});

router.get("/login", (req, res) => {
  res.render("usuarios/login");
});
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success_msg", "Deslogado com sucesso");
    res.redirect("/");
})

module.exports = router;