console.log("Modern UI Loaded");

let allProducts = [];

/* TOAST FUNCTION */

function showToast(message) {

    const toast = document.getElementById("toast");

    toast.innerText = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}

/* CART FUNCTIONS */

function getCart() {

    return JSON.parse(localStorage.getItem("cart")) || [];

}

function saveCart(cart) {

    localStorage.setItem("cart", JSON.stringify(cart));

}

function addToCart(name, price) {

    let cart = getCart();

    let existingItem = cart.find(item => item.name === name);

    if(existingItem) {

        existingItem.quantity += 1;

    }
    else {

        cart.push({

            name,

            price,

            quantity: 1

        });

    }

    saveCart(cart);
    updateCartCount();  
    showToast(name + " added to cart 🛒");

}

/* DISPLAY PRODUCTS */

function displayProducts(products) {

    const container =
        document.getElementById("products");

    container.innerHTML = "";

    products.forEach(p => {

        let reviewsHTML = "";

        if(
            p.reviews &&
            p.reviews.length > 0
        ){

            p.reviews.forEach(r => {

                reviewsHTML += `

                    <div class="review-box">

                        <b>

                            ${r.username}

                        </b>

                        <p>

                            ⭐ ${r.rating}/5

                        </p>

                        <p>

                            ${r.comment}

                        </p>

                    </div>

                `;

            });

        }

        container.innerHTML += `

            <div class="card">

                <div class="badge">

                    ${p.badge || "BEST SELLER"}

                </div>

                <img

                    src="${p.image}"

                    onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'"

                >

                <div class="card-content">

                    <h3>

                        ${p.name}

                    </h3>

                    <p>

                        ${p.description}

                    </p>

                    <div class="price">

                        ₹${p.price}

                    </div>

                    <button
                        onclick="addToCart(

                            '${p.name}',

                            ${p.price}

                        )"
                    >

                        Add To Cart 🛒

                    </button>

                    <hr
                        style="
                            margin:20px 0;
                            border-color:#333;
                        "
                    >

                    <h4>

                        ⭐ Reviews

                    </h4>

                    ${reviewsHTML}

                    <input
                        type="text"
                        id="user-${p._id}"
                        placeholder="Your Name"
                    >

                    <input
                        type="number"
                        id="rating-${p._id}"
                        placeholder="Rating (1-5)"
                        min="1"
                        max="5"
                    >

                    <input
                        type="text"
                        id="comment-${p._id}"
                        placeholder="Write Review"
                    >

                    <button
                        onclick="addReview('${p._id}')"
                    >

                        Submit Review ⭐

                    </button>

                </div>

            </div>

        `;

    });

}

/* ADD REVIEW */

async function addReview(productId) {

    const username = document.getElementById(
        `user-${productId}`
    ).value;

    const rating = document.getElementById(
        `rating-${productId}`
    ).value;

    const comment = document.getElementById(
        `comment-${productId}`
    ).value;

    if(username === "" || rating === "" || comment === "") {

        showToast("Please fill all review fields");

        return;

    }

    await fetch(`/add-review/${productId}`, {

        method: "POST",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify({

            username,

            rating,

            comment

        })

    });

    showToast("⭐ Review Added");

    loadProducts();

}

/* SEARCH */

function searchProducts() {

    const search = document
        .getElementById("search")
        .value
        .toLowerCase();

    const filtered = allProducts.filter(product =>

        product.name.toLowerCase().includes(search)

    );

    displayProducts(filtered);

}

/* LOAD PRODUCTS */

async function loadProducts() {

    const res = await fetch("/products");

    const data = await res.json();

    allProducts = data;

    displayProducts(allProducts);

}

loadProducts();
/* COUNTER ANIMATION */

const counters = document.querySelectorAll(".counter");

counters.forEach(counter => {

    counter.innerText = "0";

    const updateCounter = () => {

        const target = +counter.getAttribute("data-target");

        const current = +counter.innerText;

        const increment = target / 100;

        if(current < target) {

            counter.innerText =
                `${Math.ceil(current + increment)}`;

            setTimeout(updateCounter, 25);

        }
        else {

            counter.innerText = target + "+";

        }

    };

    updateCounter();

});
/* MOBILE MENU */

function toggleMenu() {

    document
        .getElementById("mobile-menu")
        .classList.toggle("active");

}
/* FILTER PRODUCTS */

function filterProducts(category) {

    if(category === "all") {

        displayProducts(allProducts);

        return;

    }

    const filtered =
        allProducts.filter(product =>

            product.name
                .toLowerCase()
                .includes(category.toLowerCase())

        );

    displayProducts(filtered);

}
/* SCROLL ANIMATION */

const observer =
    new IntersectionObserver(entries => {

        entries.forEach(entry => {

            if(entry.isIntersecting) {

                entry.target.classList.add("show");

            }

        });

    });

const hiddenElements =
    document.querySelectorAll(
        ".card, .glass-box, .about-box, .stat-box"
    );

hiddenElements.forEach(el => {

    el.classList.add("hidden");

    observer.observe(el);

});
/* CART COUNT */

function updateCartCount() {

    const cart =
        JSON.parse(
            localStorage.getItem("cart")
        ) || [];

    let total = 0;

    cart.forEach(item => {

        total += item.quantity;

    });

    const count =
        document.getElementById(
            "cart-count"
        );

    if(count) {

        count.innerText = total;

    }

}

/* UPDATE ON LOAD */

updateCartCount();
/* TOAST FUNCTION */

function showToast(message) {

    const toast =
        document.getElementById("toast");

    toast.innerText = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}