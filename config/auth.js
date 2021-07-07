const localStrategy = require("passport-local");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

// model usuario
require("../models/Usuario");

const Usuario = mongoose.model("usuarios");

module.exports = function (passport) {
  passport.use(
    new localStrategy({ 
      usernameField: "email", 
      passwordField: "senha" 
    },(email, senha, done) => {
        Usuario.findOne({ email: email }).then((usuario) => {
          if (!usuario) {
            return done(null, false, { message: "Esta conta não exite" });
          }
          bcrypt.compare(senha, usuario.senha, (error, senhaCompare) => {
            if (senhaCompare) {
              return done(null, usuario, { message: "Login bem sucedido" });
            } else {
              return done(null, false, { message: "Senha incorreta" });
            }
          });
        });
      }
    )
  );

  // salva dados do usuario na sessao
  passport.serializeUser((usuario, done) => { done(null, usuario.id); });

  passport.deserializeUser((id, done) => {
    Usuario.findById(id, (error, usuario) => {
      done(error, usuario);
    });
  });
};
