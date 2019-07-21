const express = require('express');
const router = express.Router();
const Author = require('../models/author');

//All authors route
router.get('/', async (req, res) => {
  let searchOptions = {}
  if (req.query.name != null && req.query.name != ''){
    searchOptions.name = new RegExp(req.query.name, 'i')
  }
  try {
    const authors = await Author.find(searchOptions)
    res.render('authors/index',{
      authors: authors,searchOptions: req.query
    });
  } catch  {
res.redirect('/')
  }

});

// New route - display
router.get('/new', (req, res) => {
  res.render('authors/new', { author: new Author() });
});

// New route - create - dlatego send - posyłamy jakieś nowe dane
router.post('/', async (req, res) => {
  const author = new Author({
    name: req.body.name
  });
  try {
    const newAuthor = await author.save();
    res.redirect('authors')
  } catch {
    res.render('authors/new', {
      author: author,
      errorMessage:
        'Nie udało się utworzyć Autora. Skontaktuj się z najbliższym posterunkiem Policji'
    });
  }
});

module.exports = router;
