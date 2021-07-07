const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

require("../models/Categoria");
const Categoria = mongoose.model("categorias");
require("../models/Postagem")
const Postagem = mongoose.model("postagens");
require("../models/Usuario");
const Usuario = mongoose.model("usuarios")

const { eAdmin } = require("../helpers/eAdmin")

// router
router.get("/", eAdmin, (req, res) => {
  res.render("admin/index");
});

// POSTAGENS
router.get("/postagens", eAdmin, (req, res) => {
  Postagem.find()
    .populate("categoria")
    .sort({ data: "desc" })
    .then((postagens) => {
      res.render("admin/postagens", {
        postagens: postagens,
      });
    })
    .catch((error) => {
      req.flash("error_msg", "Houve um erro ao listar as postagens");
      res.redirect("/admin");
    });
});
router.get("/postagens/add", eAdmin, (req, res) => {
  Categoria.find()
    .then((categorias) => {
      res.render("admin/add-postagens", { categorias: categorias });
    })
    .catch((error) => {
      req.flash("error_msg", "Houve um erro ao carregar o formulario");
      res.redirect("/admin");
    });
});
router.post("/postagens/nova", eAdmin, (req, res) => {
  let error = [];
  if (
    !req.body.titulo ||
    typeof req.body.titulo == undefined ||
    req.body.titulo == null
  ) {
    error.push({ text: "Titulo inválido" });
  }
  if (req.body.titulo.length <= 2) {
    error.push({ text: "Titulo deve conter no mínimo de 3 caracteres" });
  }
  if (
    !req.body.subtitulo ||
    typeof req.body.subtitulo == undefined ||
    req.body.subtitulo == null
  ) {
    error.push({ text: "Subtitulo inválido" });
  }
  if (req.body.subtitulo.length <= 2) {
    error.push({ text: "Subtitulo deve conter no mínimo de 3 caracteres" });
  }
  if (error.length > 0) {
    res.render("admin/add-postagens", { error: error });
  } else {
    const novaPostagem = {
      titulo: req.body.titulo,
      subtitulo: req.body.subtitulo,
      descricao: req.body.descricao,
      conteudo: req.body.conteudo,
      slug: req.body.slug,
      categoria: req.body.categoria,
    };
    new Postagem(novaPostagem)
      .save()
      .then(() => {
        req.flash("success_msg", "Postagem criada com sucesso.");
        res.redirect("/admin/postagens");
      })
      .catch((err) => {
        req.flash("error_msg", "Erro ao gravar Postagem no banco de dados.");
        res.redirect("/admin/postagens");
      });
  }
});
router.get("/postagens/edit/:id", eAdmin, (req, res) => {
  Postagem.findOne({ _id: req.params.id })
    .then((postagem) => {
      Categoria.find()
        .then((categorias) => {
          res.render("admin/edit-postagens", {
            postagem: postagem,
            categorias: categorias,
          });
        })
        .catch((error) => {
          {
            req.flash("error_msg", "Erro ao listar categorias");
            res.redirect("/admin/postagens");
          }
        });
    })
    .catch((error) => {
      req.flash("error_msg", "Postagem não existe");
      res.redirect("/admin/postagens");
    });
});
router.post("/postagem/edit", eAdmin, (req, res) => {
  Postagem.findOne({ _id: req.body.id })
    .then((postagem) => {
      postagem.titulo = req.body.titulo;
      postagem.subtitulo = req.body.subtitulo;
      postagem.conteudo = req.body.conteudo;
      postagem.descricao = req.body.descricao;
      postagem.slug = req.body.slug;
      postagem.categoria = req.body.categoria;

      postagem
        .save()
        .then(() => {
          req.flash("success_msg", "Postagem editada com sucesso.");
          res.redirect("/admin/postagens");
        })
        .catch((error) => {
          console.log(error);
          req.flash("error_msg", "Erro interno");
          res.redirect("/admin/postagens");
        });
    })
    .catch((error) => {
      req.flash("error_msg", "Erro ao editar postagem no banco de dados.");
      res.redirect("/admin/postagens");
    });
});
/*
router.post("/postagem/delete", eAdmin, (req, res) => {
  Postagem.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso");
        res.redirect("/admin/postagens");
    }).catch((error) => {
        req.flash("error_msg", "Não foi possível deletar a postagem");
        res.redirect("/admin/postagens");
    })
});*/
router.get("/postagem/delete/:id", eAdmin, (req, res) => {
  Postagem.remove({ _id: req.params.id })
    .then(() => {
      req.flash("success_msg", "Postagem deletada com sucesso");
      res.redirect("/admin/postagens");
    })
    .catch((error) => {
      req.flash("error_msg", "Não foi possível deletar a postagem");
      res.redirect("/admin/postagens");
    });
});


// CATEGORIAS
router.get("/categorias", eAdmin, (req, res) => {
  Categoria.find()
    .lean()
    .sort({ data: "asc" })
    .then((categorias) => {
      res.render("admin/categorias", { categorias: categorias });
    })
    .catch((error) => {
      req.flash("error_msg", "Houve um erro ao listar categorias");
      res.redirect("/admin");
    });
});
router.get("/categorias/add", eAdmin, (req, res) => {
  res.render("admin/add-categorias");
});
router.post("/categorias/nova", eAdmin, (req, res) => {
  let error = [];
  if (
    !req.body.nome ||
    typeof req.body.nome == undefined ||
    req.body.nome == null
  ) {
    error.push({ text: "Nome inválido" });
  }
  if (req.body.nome.length <= 2) {
    error.push({ text: "Nome deve conter no mínimo de 3 caracteres" });
  }
  if (
    !req.body.slug ||
    typeof req.body.slug == undefined ||
    req.body.slug == null
  ) {
    error.push({ text: "Slug inválido" });
  }
  if (req.body.slug.length <= 2) {
    error.push({ text: "Slug deve conter no mínimo de 3 caracteres" });
  }
  if (error.length > 0) {
    res.render("admin/add-categorias", { error: error });
  } else {
    const novaCategoria = {
      nome: req.body.nome,
      slug: req.body.slug,
      descricao: req.body.descricao,
    };
    new Categoria(novaCategoria)
      .save()
      .then(() => {
        req.flash("success_msg", "Categoria criada com sucesso.");
        res.redirect("/admin/categorias");
      })
      .catch((err) => {
        req.flash("error_msg", "Erro ao gravar categoria no banco de dados.");
        res.redirect("/admin/categorias");
      });
  }
});

router.get("/categorias/edit/:id", eAdmin,  (req, res) => {
  Categoria.findOne({ _id: req.params.id })
    .lean()
    .then((categoria) => {
      res.render("admin/edit-categorias", { categoria: categoria });
    })
    .catch((error) => {
      req.flash("error_msg", "Categoria não existe");
      res.redirect("/admin/categorias");
    });
});
router.post("/categoria/edit", eAdmin, (req, res) => {
  Categoria.findOne({ _id: req.body.id })
    .then((categoria) => {
      categoria.nome = req.body.nome;
      categoria.slug = req.body.slug;
      categoria.descricao = req.body.descricao;

      categoria
        .save()
        .then(() => {
          req.flash("success_msg", "Categoria editada com sucesso.");
          req.redirect("/admin/categorias");
        })
        .catch((error) => {
          req.flash(
            "error_msg",
            "Erro ao salvar edição categoria no banco de dados."
          );
          res.redirect("/admin/categorias");
        });
    })
    .catch((error) => {
      req.flash("error_msg", "Erro ao editar categoria no banco de dados.");
      res.redirect("/admin/categorias");
    });
});
router.post("/categoria/delete", eAdmin, (req, res) => {
    Categoria.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso");
        res.redirect("/admin/categorias");
    }).catch((error) => {
        req.flash("error_msg", "Não foi possível deletar a categoria");
        res.redirect("/admin/categorias");
    })
})

module.exports = router;
