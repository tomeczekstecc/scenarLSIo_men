const express = require("express");
const router = express.Router();
const Book = require("../models/book");
const Author = require("../models/author");
const imageMimeTypes = ["image/jpeg", "image/png", "images/gif"];

// All Books Route
router.get("/", async (req, res) => {
  let query = Book.find();
  if (req.query.title != null && req.query.title != "") {
    query = query.regex("title", new RegExp(req.query.title, "i"));
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore != "") {
    query = query.lte("publishDate", req.query.publishedBefore);
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != "") {
    query = query.gte("publishDate", req.query.publishedAfter);
  }
  try {
    const books = await query.sort({ sort: "asc" }).exec();
    res.render("books/index", {
      books: books,
      searchOptions: req.query
    });
  } catch {
    res.redirect("/");
  }
});

// New Book Route
router.get("/new", async (req, res) => {
  renderNewPage(res, new Book());
});

// Create Book Route
router.post("/", async (req, res) => {
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description,
    sort: req.body.sort
  });
  saveCover(book, req.body.cover);

  try {

    resetSortsSuccess(req.body.sort,1);
    const newBook = await book.save();
    res.redirect(`books/${newBook.id}`);
    console.log(typeof newBook);
  } catch {
    resetSortsFail(req.body.sort,1);
    renderNewPage(res, book, true);
  }
});

// Show Book Route
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate("author")
      .exec();
    res.render("books/show", { book: book });
  } catch {
    res.redirect("/");
  }
});

// Edit Book Route
router.get("/:id/edit", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    renderEditPage(res, book);
  } catch {
    res.redirect("/");
  }
});
// Update Book Route
// Update Book Route
router.put("/:id", async (req, res) => {
  let book;

  try {
    book = await Book.findById(req.params.id);
    book.title = req.body.title;
    book.author = req.body.author;
    book.publishDate = new Date(req.body.publishDate);
    book.pageCount = req.body.pageCount;
    book.description = req.body.description;
    book.sort = req.body.sort;
    if (req.body.cover != null && req.body.cover !== "") {
      saveCover(book, req.body.cover);
    }

    await book.save();

    res.redirect(`/books/${book.id}`);
  } catch {
    if (book != null) {
      renderEditPage(res, book, true);
    } else {
      redirect("/");
    }
  }
});

router.delete("/:id", async (req, res) => {
  let book;
  try {
    book = await Book.findById(req.params.id);
    await book.remove();
    res.redirect("/books");
  } catch {
    if (book != null) {
      res.render("books/show", {
        book: book,
        errorMessage: "Nie udało się usunąć sceny"
      });
    } else {
      res.redirect("/");
    }
  }
});

async function renderNewPage(res, book, hasError = false) {
  renderFormPage(res, book, "new", hasError);
}

async function renderEditPage(res, book, hasError = false) {
  renderFormPage(res, book, "edit", hasError);
}

function saveCover(book, coverEncoded) {
  if (coverEncoded == null) return;
  const cover = JSON.parse(coverEncoded);
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, "base64");
    book.coverImageType = cover.type;
  }
}

async function renderFormPage(res, book, form, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book
    };
    if (hasError) {
      if (form === "edit") {
        params.errorMessage =
          "Wystąpił błąd w czasie edycji sceny. Książka skarg i zażaleń znajduje sie u Kierownika!";
      } else {
        params.errorMessage =
          "Wystąpił błąd w czasie tworzenia sceny. Książka skarg i zażaleń znajduje sie u Kierownika!";
      }
    }

    res.render(`books/${form}`, params);
  } catch {
    res.redirect("/books");
  }
}

async function resetSortsSuccess(num,plus) {
  let query = Book.find();
  const booksToUpdate = await query.where({ sort: {$gte: num } }).exec();
  booksToUpdate.forEach(item => {
    item.sort = item.sort + plus;
    item.save();
  });
}
async function resetSortsFail(num,minus) {
  let query = Book.find();
  const booksToUpdate = await query.where({ sort: {$gte: num } }).exec();
  booksToUpdate.forEach(item => {
    item.sort = item.sort - minus;
    item.save();
  });
}

module.exports = router;
