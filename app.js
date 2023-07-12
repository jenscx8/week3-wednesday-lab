import express from 'express';
import nunjucks from 'nunjucks';
import morgan from 'morgan';
import session from 'express-session';
import users from './users.json' assert { type: 'json' };
import stuffedAnimalData from './stuffed-animal-data.json' assert { type: 'json' };

const app = express();
const port = '8000';

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(session({ secret: 'ssshhhhh', saveUninitialized: true, resave: false }));

nunjucks.configure('views', {
  autoescape: true,
  express: app,
});

function getAnimalDetails(animalId) {
  return stuffedAnimalData[animalId];
}

app.get('/', (req, res) => {
  res.render('index.html');
});

app.get('/all-animals', (req, res) => {
  res.render('all-animals.html.njk', { animals: Object.values(stuffedAnimalData) });
});

app.get('/animal-details/:animalId', (req, res) => {
  const animalDetails = getAnimalDetails(req.params.animalId)

  res.render('animal-details.html.njk', { animal: animalDetails });
});

app.get('/add-to-cart/:animalId', (req, res) => {
  // TODO: Finish add to cart functionality
  // The logic here should be something like:
  // - check if a "cart" exists in the session, and create one (an empty
  // object keyed to the string "cart") if not
  if (!req.session.cart) {
    req.session.cart = {}
  } 
  // - check if the desired animal id is in the cart, and if not, put it in
  if (!(req.params.animalId in req.session.cart)) {
    // - increment the count for that animal id by 1
    req.session.cart[req.params.animalId]++
    console.log(req.session.cart)
  }
  // - redirect the user to the cart page
  res.redirect('/cart')
});

app.get('/cart', (req, res) => {
  // TODO: Display the contents of the shopping cart.

  // Make sure your function can also handle the case where no cart has
  // been added to the session
  if (!req.session.cart) {
   
    req.session.cart = {}
  }
  // - get the cart object from the session
  const cart = req.session.cart
  // - create an array to hold the animals in the cart
  const animals = []
  // - and a variable to hold the total cost of the order
  let total = 0
  // - loop over the cart object, and for each animal id:
  for (const animalId in cart) {
    //   - get the animal object by calling getAnimalDetails
    const animalDetails = getAnimalDetails(animalId)
    const quantity = cart[animalId]
    //   - compute the total cost for that type of animal
    animalDetails.quantity = quantity
    const subtotal = quantity * animalDetails.price
    animalDetails.subtotal = subtotal
    //   - add this to the order total
    total += subtotal
    //   - add quantity and total cost as properties on the animal object
    animals.push(animalDetails)
  }
  //   - add the animal object to the array created above
  // - pass the total order cost and the array of animal objects to the template
  res.render('cart.html.njk', {
    total: total, animals: animals } );
});

app.get('/checkout', (req, res) => {
  // Empty the cart.
  req.session.cart = {};
  res.redirect('/all-animals');
});

app.get('/login', (req, res) => {
  // TODO: Implement this
  res.render('login.html.njk');
});

app.post('/process-login', (req, res) => {
  // TODO: Implement this
  for (const user of users) {
    if (req.body.email === user.username && req.body.password === user.password) {
      req.session.username = user.username
      res.redirect('/all-animals');
      return;
    }
  }
  res.render('login.html.njk', { message: 'Invalid username or password' })
});
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect('/');
  });
});



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}...`);
});
