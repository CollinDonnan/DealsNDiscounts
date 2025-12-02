// Tanner Ness
// functions exclusive to order.html
// revisions then
const order_list_div = document.getElementById("order-list");
const total_span = document.getElementById("total");
const total_value_div = document.getElementById("total-value");
const summary_h1 = document.getElementById("summary");
const confirm_order_button = document.getElementById("confirm");
const clear_cart = document.getElementById("clear-cart");

var isHidden = false;
var empty_cart = true;
var order_confirmed = false;
var total = 0;

// one cart item contains [title, price, image, amount, stock]

// NEW: Load cart from localStorage
let storedCart = JSON.parse(localStorage.getItem("cart")) || [];

// NEW: cart_list now starts empty and is filled from product data
var cart_list = [];

// NEW: Fetch product data and convert stored cart IDs -> cart_list items
fetch("products_real_titles.json")
  .then((response) => response.json())
  .then((data) => {
    const productList = data.items;

    storedCart.forEach((id) => {
      const product = productList[id - 1]; // product IDs are 1-based
      if (product) {
        let title = product.fields.title;
        let price = product.fields.price;
        let stock = product.fields.stock;
        let imagePath = "images/product" + id + ".jpg";

        // If the item is already in cart_list, increment quantity
        let existing = cart_list.find((p) => p[0] === title);
        if (existing) {
          if (existing[3] >= existing[4]) {
            // do nothing since at maximum amount
          } else {
            // otherwise add
            existing[3] += 1;
          }
        } else {
          cart_list.push([title, price, imagePath, 1, stock]);
        }
      }
    });

    check_is_empty();
    displayProducts();
  })
  .catch(() => {
    console.log("Error loading product data.");
    check_is_empty();
  });

// only if the cart is empty, clear cart, total, and confirm button are hidden
// otherwise revealed
function check_is_empty() {
  // if cart is empty, hide the total, clear cart and confirm button.
  if (cart_list.length == 0) {
    total_value_div.hidden = true;
    confirm_order_button.hidden = true;
    clear_cart.hidden = true;
    summary_h1.style.display = "none";
    isHidden = true;
    empty_cart_text();
    return isHidden;
    // otherwise visible
  } else {
    total_value_div.hidden = false;
    confirm_order_button.hidden = false;
    clear_cart.hidden = false;
    summary_h1.style.display = "block";
    isHidden = false;
    empty_cart_text();
    return isHidden;
  }
}

// if the cart is empty, print some flavor text for the user to look active
// works in conjunction with the check_is_empty function
//TODO
function empty_cart_text() {
  const alt = document.getElementById("empty-cart");
  if (isHidden && !order_confirmed) {
    alt.hidden = false;
  } else {
    alt.hidden = true;
  }
}

// takes each element in cart_list and displays thems in the cart
// if cart is empty, display text: "cart is empty", TODO
function displayProducts() {
  for (product in cart_list) {
    createProduct(cart_list[product]);
  }
  getTotalCartCost();
}

// creates a product w/the ability to increment, decrement, and remove the product
// works but my eyes burn
function createProduct(a_product) {
  const item = document.createElement("div");
  item.className = "item";
  item.id = "item-" + a_product[0];

  // the image of the product
  const product = document.createElement("div");
  product.className = "product";
  const img = document.createElement("img");
  img.src = a_product[2];
  img.alt = a_product[0];
  img.width = 150;
  img.height = 200;
  product.appendChild(img);

  // information about a product
  const product_info = document.createElement("div");
  product_info.className = "product-info";
  // the name
  const h3 = document.createElement("h3");
  h3.textContent = a_product[0];
  // the price
  const h4 = document.createElement("h4");
  h4.textContent = "Price:  $";
  const price_span = document.createElement("span");
  price_span.id = "price";
  price_span.textContent = a_product[1];
  // the remove button
  const p = document.createElement("p");
  p.id = "remove";
  p.textContent = "remove";
  p.addEventListener("click", () => remove_from_cart(a_product));

  // appends the first set (image and information) to item
  product_info.appendChild(h3);
  h4.appendChild(price_span);
  product_info.appendChild(h4);
  product_info.appendChild(p);
  product.appendChild(product_info);
  item.appendChild(product);

  //increment, decrement, counter
  const increase_decrease_amount = document.createElement("div");
  increase_decrease_amount.className = "increase-decrease-amount";
  // the increment button
  const increase = document.createElement("div");
  increase.id = "increment";
  const i_up = document.createElement("i");
  i_up.className = "fa-solid fa-square-caret-up";
  i_up.addEventListener("click", () => increment(a_product));
  // the quantity
  var quantity_span = document.createElement("span");
  quantity_span.id = "quantity-" + a_product[0];
  quantity_span.textContent = a_product[3];
  // the decrement button
  const decrease = document.createElement("div");
  decrease.id = "decrement";
  const i_down = document.createElement("i");
  i_down.className = "fa-solid fa-square-caret-down";
  i_down.addEventListener("click", () => decrement(a_product));

  // appends the second set (increment, decrement, counter) to item
  increase.appendChild(i_up);
  increase_decrease_amount.append(increase);
  increase_decrease_amount.appendChild(quantity_span);
  decrease.appendChild(i_down);
  increase_decrease_amount.append(decrease);
  item.append(increase_decrease_amount);

  order_list_div.appendChild(item);
}

// gets the total cost of the user's cart_list
// and displays the price
function getTotalCartCost() {
  let acc = 0;
  for (product in cart_list) {
    // price of item * amount
    acc += cart_list[product][1] * cart_list[product][3];
  }
  total = acc;
  total_span.innerHTML = total.toFixed(2);
}

// increments the amount , up to the amount in stock
// changes total in addition
function increment(product) {
  let name = document.getElementById("quantity-" + product[0]);
  // if amount is less than stock
  if (product[3] < product[4]) {
    ++product[3];
  }

  updateLocalStorage();

  name.innerHTML = product[3];
  getTotalCartCost();
}

// decrements the amount
// changes total in addition
function decrement(product) {
  let name = document.getElementById("quantity-" + product[0]);

  --product[3];

  if (product[3] == 0) {
    remove_from_cart(product);
  }

  updateLocalStorage();

  name.innerHTML = product[3];
  getTotalCartCost();
}

// removes the item in the cart
function remove_from_cart(product) {
  let name = document.getElementById("item-" + product[0]);
  // removes from html
  name.remove();
  // removes from cart_list
  let index = cart_list.indexOf(product);
  cart_list.splice(index, 1);

  check_is_empty();
  getTotalCartCost();
}

// removes all items in the cart
// resets total as well
function clear_cart_order() {
  while (cart_list.length != 0) {
    remove_from_cart(cart_list[product]);
  }
  total = 0;
  total_span.innerHTML = total;

  // NEW: Clear stored cart
  localStorage.removeItem("cart");
}

// updates localstorage
function updateLocalStorage() {
  const ids = [];
  cart_list.forEach((product) => {
    // paein
    // gets the product id from the image
    const productId = parseInt(product[2].match(/\d+/)[0]);
    // pushes product id based on amount to localstorage
    for (let i = 0; i < product[3]; i++) {
      ids.push(productId);
    }
  });
  localStorage.setItem("cart", JSON.stringify(ids));
}

// confirms the order and stores it in the database
async function confirm_order() {
  try {
    // Check if user is logged
    const userCheck = await fetch("/user", { credentials: "include" });
    if (!userCheck.ok) {
      // redirect to login page if not logged in
      window.location.href = "/login.ejs";
      return;
    }

    // If cart is empty, do nothing
    if (!cart_list || cart_list.length === 0) {
      return;
    }

    // Build cart data
    const cart_data = cart_list.map((product) => {
      const prodID = parseInt(product[2].match(/\d+/)[0]);
      return {
        product_id: prodID,
        quantity: product[3],
        price: product[1],
      };
    });
    // Sends order to server
    const response = await fetch("/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart: cart_data }),
      credentials: "include",
    });
    // order sent to database
    if (response.ok) {
      const data = await response.json();
      console.log(data.message);
      console.log("Order sent!");
      order_confirmed = true;
      confirmation_popup();
      clear_cart_order();
      // something happened and order can't be sent to database
    } else {
      alert("Failed to confirm order. Please try again.");
    }
    // if an error during confirming the order
  } catch (error) {
    console.error("Error confirming order:", error);
    window.location.href = "/login.ejs";
  }
}

// a popup that confirms the user's order has been sent to the database
function confirmation_popup() {
  const order_confirmed_div = document.getElementById("order-confirmed");
  if (order_confirmed) {
    order_confirmed_div.hidden = false;
  } else {
    order_confirmed_div.hidden = true;
  }
}

clear_cart.addEventListener("click", () => clear_cart_order());
confirm_order_button.addEventListener("click", () => confirm_order());
