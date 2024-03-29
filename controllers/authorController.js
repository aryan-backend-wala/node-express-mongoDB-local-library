const Book = require('../models/book');
const Author = require('../models/author');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');

const author_list = asyncHandler(async (req, res, next) => {
  const allAuthors = await Author.find().sort({ "family_name": 1}).exec();
  // res.json({ allAuthors });
  res.render("author_list", {
    title: "Author List",
    author_list: allAuthors,
  })
});

const author_detail = asyncHandler(async (req, res, next) => {
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, "title summary").exec(),
  ]);
  // res.json({ author, allBooksByAuthor });
  if(author === null){
    const err = new Error("Author not found");
    err.status = 404;
    return next(err);
  }

  res.render("author_detail", {
    title: "Author Detail",
    author: author,
    author_books: allBooksByAuthor,
  });
});

const author_create_get = asyncHandler(async (req, res, next) => {
  res.render("author_form", { title: "Create Author" });
});

const author_create_post = [
  body("first_name")
    .trim()
    .isLength({ min: 2 })
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric character."),
  
  body("family_name")
    .trim()
    .isLength({ min: 2 })
    .escape()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has no-alphanumeric character."),
  
  body("date_of_birth", "Invalid date of birth")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),
  
  body("date_of_death", "Invalid date of death")
    .optional({ values: "falsy"})
    .isISO8601()
    .toDate(),
  
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const author = Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
    });
    // console.log('errors', errors.array());
    // console.log('Author', author);
    if(!errors.isEmpty()){
      res.render("author_form", {
        title: "Create Author",
        author: author,
        errors: errors.array(),
      });
      return;
    } else {
      await author.save();
      res.redirect(author.url);
    }
  }),
  
];

const author_delete_get = asyncHandler(async (req, res, next) => {
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, "title summary" ).exec(),
  ]);

  if(author === null){
    res.redirect("/catalog/authors");
  }
  // res.json({ author, allBooksByAuthor });
  res.render("author_delete", {
    title: "Delete Author",
    author: author,
    author_books: allBooksByAuthor,
  });
});

const author_delete_post = asyncHandler(async (req, res, next) => {
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, "title summary").exec(),
  ]);
  // console.log(req.body);
  if(allBooksByAuthor.length > 0){
    // res.json({author, allBooksByAuthor});
    res.render("author_delete", {
      title: "Delete AuthorS",
      author: author,
      author_books: allBooksByAuthor,
    });
    return;
  } else {
    // console.log(req.body);
    await Author.findByIdAndDelete(req.body.authorid);
    res.redirect("/catalog/authors");
  }
});

const author_update_get = asyncHandler(async (req, res, next) => {
  const author = await Author.findById(req.params.id).exec();
  if(author === null){
    const err = new Error("Author not found");
    err.status = 400;
    next(err);
  }
  // res.json({ author });
  res.render("author_form", {
    title: "Update Author",
    author: author,
  });
});

const author_update_post = [
  body("first_name")
    .trim()
    .isLength({ min: 3 })
    .escape()
    .withMessage("First name must be specified")
    .isAlphanumeric()
    .withMessage("First name has non alphanumeric character"),
  body("family_name")
    .trim()
    .isLength({ min: 3 })
    .escape()
    .withMessage("Family name must be specified")
    .isAlphanumeric()
    .withMessage("Family name has non alphanumeric character"),
  body("date_of_birth", "Invalid date")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),
  body("date_of_death", "Invalid date")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const author = Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
      _id: req.params.id,
    });
    if(!errors.isEmpty()){
      // const author = await Author.findById(req.params.id).exec();
      res.render("author_form", {
        title: "Update Author",
        author: author,
        errors: errors.array(),
      });
      return;
    } else {
      const updatedAuthor = await Author.findByIdAndUpdate(req.params.id, author);
      res.redirect(updatedAuthor.url);
    }
  }),
];

module.exports = {
  author_list,
  author_detail,
  author_create_get,
  author_create_post,
  author_update_get,
  author_update_post,
  author_delete_get,
  author_delete_post,
};