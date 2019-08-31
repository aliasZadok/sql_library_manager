var express = require('express');
var router = express.Router();

const db = require('../db');
const { Book } = db.models;

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const pageSize = 10;

function asyncHandler(callBack) {
  return async (req, res, next) => {
    try {
      await callBack(req, res, next);
    } catch(err){
      res.render('error');
    }
  }
}

//redirecting to '/books'
router.get('/', (req, res, next) => {
  res.redirect('/books');
});

//main page
router.get('/books', asyncHandler(
  async (req, res, next) => {
    const bookCount = await Book.findAll();
    const books = await Book.findAll({ limit: pageSize });
    res.render('index', { books, bookCount, title: 'Books' });
  }
));

//pagination
router.get('/books/page/:id', asyncHandler(
  async (req, res, next) => {
    let number = req.params.id;
    const bookCount = await Book.findAll();
    const books = await Book.findAll({
      offset: number * pageSize,
      limit: pageSize
    });
    res.render('index', { books, bookCount, title: 'Books' });
  }
));

//search
router.get('/books/search', asyncHandler(
  async (req, res, next) => {
    const { term } = req.query;
    const bookCount = await Book.findAll();
    const books = await Book.findAll({
        where: { [Op.or]: [
          { title: { [Op.like]: '%' + term + '%' } },
          { author: { [Op.like]: '%' + term + '%' } },
          { genre: { [Op.like]: '%' + term + '%' } },
          { year: { [Op.like]: '%' + term + '%' } }
        ] }
    });
    res.render('index', { books, bookCount, title: 'Books' });
  }
));

//new book form
router.get('/books/new', (req, res, next) => {
  res.render('new-book', { book: Book.build(), title: 'New Book' });
});

//add new book to db
router.post('/books/new', async (req, res, next) => {
    const book = await Book.create(req.body);
    res.redirect('/books/' + book.id);
    if (err.name === "SequelizeValidationError") {
      res.render('new-book', {
        book: Book.build(req.body),
        title: 'New Book',
        errors: err.errors
      });
    } else {
      throw err;
    }
    res.render('error');
});

//book detail form
router.get('/books/:id', asyncHandler(
  async (req, res, next) => {
    const book = await Book.findByPk(req.params.id);
    res.render('update-book', { book, title: 'Update Book' });
  }
));

//update detail form
router.post('/books/:id', async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);
    await book.update(req.body);
    res.redirect('/books/' + book.id);
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      let book = Book.build(req.body);
      book.id = req.params.id;
      res.render('update-book', {
        book: book,
        title: 'Update Book',
        errors: err.errors
      });
    } else {
      throw err;
    }
    res.render('error');
  }
});

//delete book
router.post('/books/:id/delete', asyncHandler(
  async (req, res) => {
    const bookToDelete = await Book.findByPk(req.params.id);
    await bookToDelete.destroy();
    res.redirect('/books');
  }
));

module.exports = router;
