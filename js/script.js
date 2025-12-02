/*
 * Filename: Script.js
 * Authors: John Hershey, Jacob Karasow, Ian Swartz
 * Creation Date: 2025-10-21
 * Last Edit Date: 2025-12-02
 * Class: CMSC 421 Web Development
 * Description: contains code to add components present on every page.
 * currently adds styles.css and fontawesomelinks, and navbar and header links
 */
/***function calls***/
addHeadData();
createNav();
setLoginName();

/***function definitions***/
function addHeadData() {
  let head = document.head;

  stylelink = document.createElement("link");
  stylelink.rel = "stylesheet";
  stylelink.href = "/css/styles.css";
  head.appendChild(stylelink);

  fontawesomelink = document.createElement("script");
  fontawesomelink.src = "https://kit.fontawesome.com/a352848a69.js";
  fontawesomelink.crossorigin = "anonymous";
  head.appendChild(fontawesomelink);
}

function createNav() {
  const container = document.getElementById("navbar-container");
  if (!container) return;

  container.innerHTML = `
      <nav id="nav">
        <div class="nav-left">
          <a href="index.html">
            <img src="images/logo.webp" alt="Deals N' Discounts Logo" class="logo" />
          </a>
          <h1>Deals N' Discounts</h1>
        </div>
        <div class="nav-center">
          <ul class="nav-links">
            <li><a href="products.html"><i class="fa-solid fa-box"></i> Products</a></li>
            <li><a href="order.html"><i class="fa-solid fa-truck"></i> My Cart</a></li>
            <li><a id="nav-login" href="login.ejs"><i class="fa-solid fa-user"></i> Login</a></li>
          </ul>
        </div>
        <div class="nav-right">
          <input type="text" id="searchBar" placeholder="Search products..." />
          <button id="searchBtn"><i class="fa-solid fa-magnifying-glass"></i></button>
        </div>
      </nav>
    `;

  // Highlight active page
  const path = window.location.pathname.split("/").pop();
  document.querySelectorAll(".nav-links a").forEach((link) => {
    if (link.getAttribute("href") === path) {
      link.classList.add("active");
    }
  });

  // Scroll effect
  window.addEventListener("scroll", () => {
    const nav = document.getElementById("nav");
    if (window.scrollY > 10) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  });

  // =============================
  // GLOBAL SEARCH FUNCTIONALITY
  // =============================
  const searchBtn = document.getElementById("searchBtn");
  const searchBar = document.getElementById("searchBar");

  if (searchBtn && searchBar) {
    function triggerSearch() {
      const query = searchBar.value.trim();
      if (query.length === 0) return;

      const onHome =
        window.location.pathname.endsWith("index.html") ||
        window.location.pathname.endsWith("/") ||
        window.location.pathname === "";

      if (!onHome) {
        // redirect to homepage and pass query
        window.location.href = `index.html?search=${encodeURIComponent(query)}`;
        return;
      }

      // already on home page → run filters
      window.currentSearchQuery = query.toLowerCase();
      if (window.applyFilters) window.applyFilters();
    }

    searchBtn.addEventListener("click", triggerSearch);
    searchBar.addEventListener("keydown", (e) => {
      if (e.key === "Enter") triggerSearch();
    });
  }
}
// sets navbar to "my account"
function setLoginName() {
  const XMLreq = new XMLHttpRequest();
  XMLreq.open("GET", "http://localhost:5000/user", true);
  XMLreq.send();
  XMLreq.onreadystatechange = function () {
    if (XMLreq.readyState == 4 && XMLreq.status == 200) {
      try {
        const user = JSON.parse(XMLreq.response).user;
      } catch {
        return;
      }
      loginheader = document.getElementById("nav-login");
      loginheader.innerHTML = '<i class="fa-solid fa-user"></i> My Account';
    }
  };
}

function testCall() {
  console.log("test passed");
}
