var express = require('express');
var router = express.Router();

const db = require('../db');
const { Book } = db.models;

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const pageSize = 10;

//redirecting to '/books'
router.get('/', (req, res, next) => {
  res.redirect('/books');
});

//main page
router.get('/books', async (req, res, next) => {
  try {
    const bookCount = await Book.findAll();
    const books = await Book.findAll({ limit: pageSize });
    res.render('index', { books, bookCount, title: 'Books' });
  } catch (err) {
    res.render('error');
  }
});

//pagination
router.get('/books/page/:id', async (req, res, next) => {
  try {
    let number = req.params.id;
    const bookCount = await Book.findAll();
    const books = await Book.findAll({
      offset: number * pageSize,
      limit: pageSize
    });
    res.render('index', { books, bookCount, title: 'Books' });
  } catch (err) {
    res.render('error');
  }
});

//search
router.get('/books/search', async (req, res, next) => {
  try {
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
  } catch (err) {
    res.render('error');
  }
});

//new book form
router.get('/books/new', (req, res, next) => {
  res.render('new-book', { book: Book.build(), title: 'New Book' });
});

//add new book to db
router.post('/books/new', async (req, res, next) => {
  try {
    const book = await Book.create(req.body);
    res.redirect('/books/' + book.id);
  } catch (err) {
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
  }
});

//book detail form
router.get('/books/:id', async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);
    res.render('update-book', { book, title: 'Update Book' });
  } catch (err) {
    res.render('error');
  }
});

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
router.post('/books/:id/delete', async (req, res) => {
  const bookToDelete = await Book.findByPk(req.params.id);
  await bookToDelete.destroy();
  res.redirect('/books');
});

module.exports = router;
