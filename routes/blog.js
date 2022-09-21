const express = require('express');

const mongodb = require('mongodb');

const router = express.Router();

const db = require('../data/database');


//function that you can use to create the object id mongodb recognizes.
const ObjectId = mongodb.ObjectId;



//root route
router.get('/', function (req, res) {
  res.redirect('/posts');
});


//all posts
router.get('/posts', async function (req, res) {

  //2nd parameter of find is what data you want.
  //you only want the title, summary, and author name (1 means yes)
  const posts = await db.getDb().collection('posts').find({}).project({ title: 1, summary: 1, _id: 1, 'author.name': 1 }).toArray();

  res.render('posts-list', { posts: posts });

});


//When you click create post
router.get('/new-post', async function (req, res) {

  //get all documents in the authors collection.
  //find() returns a promise, and gives us a cursor that points
  //to our documents. if you add .toArray at the end, it will
  //grab all documents and put it into an array
  const authors = await db.getDb().collection('authors').find().toArray();
  res.render('create-post', { authors: authors });
});


//insert new post
router.post('/posts', async function (req, res) {

  const authorId = new ObjectId(req.body.author);

  const author = await db.getDb().collection('authors').findOne({ _id: authorId })

  //js object that contains user inputted data from the 
  //create post form
  const newPost = {
    title: req.body.title,
    summary: req.body.summary,
    body: req.body.content,
    date: new Date(),
    author: {
      id: authorId,
      name: author.name,
      email: author.email
    }
  }

  const result = await db.getDb().collection('posts').insertOne(newPost);

  res.redirect('/posts');
});



//VIEW post
//next parameter is a function that can be executed. It is used
//to move the request to the next middleware in line
router.get('/posts/:id', async function (req, res, next) {
  let postId = req.params.id;

try {
  postId = new ObjectId(postId) 
} catch (error) {
  return res.status(404).render('404')}


  const post = await db.getDb().collection('posts').findOne({ _id: new ObjectId(postId) }, { summary: 0 });

  if (!post) {
    return res.status(404).render('404');
  }

  post.humanReadableDate = post.date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  res.render('post-detail', { post: post })

})


//DELETE a post
router.get('/delete/:id', async function (req, res) {
  const postId = req.params.id;

  await db.getDb().collection('posts').deleteOne({ _id: new ObjectId(postId) }).then(

    res.redirect('/posts')
  )


})


//When you click edit post, redirect to update-post page
router.get('/update/:id', async function (req, res) {

  const postId = req.params.id;

  const post = await db.getDb().collection('posts').findOne({ _id: new ObjectId(postId) }, { date: 0, author: 0 });

if (!post) {
  return res.status(404).render('404');

}

  res.render('update-post', { post: post })
}
)


//UPDATE the post
router.post('/update/:id', async function (req, res) {

  const postId = req.params.id;

  //updatedPost
  const updatedPost = {
    title: req.body.title,
    summary: req.body.summary,
    body: req.body.content
  }



  const result = await db.getDb().collection('posts').updateOne({ _id: new ObjectId(postId) }, { $set: updatedPost })

  res.redirect('/posts')
});




module.exports = router;