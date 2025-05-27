/**
 * Storage Management System
 * Main JavaScript file for controlling Login and Dashboard functionality
 */

// Simulated user (in a real app, this would come from a server)
const USER = { username: "admin", password: "password" };

// Initialize local storage with some default items if empty
if (!localStorage.getItem('inventoryItems')) {
    localStorage.setItem('inventoryItems', JSON.stringify([]));
}

/**
 * Login Page Functions
 */
function username(){
    const regex = /^[a-zA-Z0-9_]{3,16}$/;
}
function password(){
    const regex = /^[a-zA-Z0-9_\.\-]{4,16}$/;
}
// Handle login form submission
function handleLogin(event) {
    // Prevent the default form submission
    if (event) event.preventDefault();
    
    // Get username and password from form
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    
    // Check if credentials match
    if (username === USER.username && (password === USER.password || password === "")) {
        // Store username in localStorage
        localStorage.setItem("username", username);
        
        // Redirect to dashboard
        window.location.href = "Dashboard.html";
    } else {
        // Show error message
        alert("Invalid username or password. Please try again.");
    }
}

/**
 * Dashboard Page Functions
 */

// Check if user is logged in
function checkLoginStatus() {
    const username = localStorage.getItem("username");
    
    // If no username found, redirect to login page
    if (!username) {
        window.location.href = "Login.html";
        return false;
    }
    
    return { username };
}

// Update dashboard UI
function updateDashboardUI(username) {
    // Display logged-in username
    const userSpan = document.getElementById("loggedInUser");
    if (userSpan) {
        userSpan.innerText = username;
    }
}

// Toggle the visibility of the Add Item form
function toggleAddItemForm() {
    const addItemForm = document.getElementById("addItemForm");
    if (addItemForm) {
        // Toggle between display block and none
        if (addItemForm.style.display === "block") {
            addItemForm.style.display = "none";
        } else {
            addItemForm.style.display = "block";
        }
    }
}

// Handle logout
function logout() {
    // Clear all localStorage items
    localStorage.clear();
    
    // Redirect to login page
    window.location.href = "Login.html";
}

/**
 * Language Functions
 */

// Function to set the language
function setLanguage(language) {
    const languageToggle = document.getElementById("languageToggle");
    if (languageToggle) {
        // Update the toggle button text (using short codes instead of full language names)
        languageToggle.textContent = language === 'en' ? 'ع' : 'EN';
    }
    
    // Update the HTML lang attribute
    document.documentElement.lang = language;
    
    // Update the text direction
    document.body.dir = language === 'ar' ? 'rtl' : 'ltr';
    
    // Update all translatable elements
    const elements = document.querySelectorAll('.translate');
    elements.forEach(element => {
        if (element.dataset[language]) {
            element.textContent = element.dataset[language];
        }
    });
    
    // Update placeholders for input fields
    updatePlaceholders(language);
}

// Function to update placeholders based on language
function updatePlaceholders(language) {
    if (document.getElementById('username')) {
        document.getElementById('username').placeholder = 
            language === 'en' ? 'Enter your username' : 'أدخل اسم المستخدم';
    }
    
    if (document.getElementById('password')) {
        document.getElementById('password').placeholder = 
            language === 'en' ? 'Enter your password' : 'أدخل كلمة المرور';
    }
}

/**
 * Page Initialization
 */

// Initialize the appropriate page based on the current URL
function initPage() {
    // Get the current page filename
    const currentPage = window.location.pathname.split("/").pop();
    
    if (currentPage === "Login.html" || currentPage === "") {
        // Login page initialization
        const loginForm = document.querySelector("form");
        if (loginForm) {
            loginForm.addEventListener("submit", handleLogin);
        }
    } 
    else if (currentPage === "Dashboard.html") {
        // Dashboard page initialization
        const user = checkLoginStatus();
        
        if (user) {
            // Update UI with username
            updateDashboardUI(user.username);
            
            // Set up Add New Item button
            const addNewItemBtn = document.getElementById("addNewItemBtn");
            if (addNewItemBtn) {
                addNewItemBtn.addEventListener("click", function() {
                    const addItemForm = document.getElementById("addItemForm");
                    if (addItemForm) {
                        addItemForm.style.display = "block";
                    }
                });
            }
            
            // Add event listener for Add Item form submission
            const itemForm = document.getElementById("itemForm");
            if (itemForm) {
                itemForm.addEventListener("submit", function(e) {
                    e.preventDefault();
                
                    // Validate item name (letters only)
                    const itemName = document.getElementById("itemName").value;
                    if (!/^[a-zA-Z\s]+$/.test(itemName)) {
                        alert("Item name must contain only letters");
                        return;
                    }
                
                    // Create new item object
                    const newItem = {
                        itemId: parseInt(document.getElementById("itemId").value),
                        itemName: itemName,
                        quantity: parseInt(document.getElementById("quantity").value),
                        price: parseFloat(document.getElementById("price").value),
                        expiryDate: document.getElementById("expiryDate").value,
                        storage: document.getElementById("storage").value
                    };
                    
                    // Get existing items from localStorage
                    let items = JSON.parse(localStorage.getItem('inventoryItems')) || [];
                    
                    // Add new item
                    items.push(newItem);
                    
                    // Save back to localStorage
                    localStorage.setItem('inventoryItems', JSON.stringify(items));
                    
                    // Update the table
                    updateInventoryTable();
                    
                    // Reset and hide form
                    itemForm.reset();
                    document.getElementById("addItemForm").style.display = "none";
                });
            }
            
            // Initialize table with existing items
            updateInventoryTable();
        }
    }
}

// Function to delete an item
function deleteItem(itemId) {
    if (confirm('Are you sure you want to delete this item?')) {
        let items = JSON.parse(localStorage.getItem('inventoryItems')) || [];
        items = items.filter(item => item.itemId !== itemId);
        localStorage.setItem('inventoryItems', JSON.stringify(items));
        updateInventoryTable();
    }
}

// Function to edit an item
function editItem(itemId) {
    const items = JSON.parse(localStorage.getItem('inventoryItems')) || [];
    const item = items.find(item => item.itemId === itemId);
    if (!item) return;

    // Create edit form HTML
    const row = document.querySelector(`tr[data-id="${itemId}"]`);
    row.innerHTML = `
        <td>
            <input type="number" value="${item.itemId}" min="0" required>
        </td>
        <td>
            <input type="text" value="${item.itemName}" pattern="[a-zA-Z\s]+" required>
        </td>
        <td>
            <input type="number" value="${item.quantity}" min="1" required>
        </td>
        <td>
            <input type="number" value="${item.price}" min="0.01" step="0.01" required>
        </td>
        <td>
            <input type="date" value="${item.expiryDate}" min="${new Date().toISOString().split('T')[0]}" required>
        </td>
        <td>
            <select required>
                <option value="Ryadh 1" ${item.storage === 'Ryadh 1' ? 'selected' : ''}>Ryadh 1</option>
                <option value="Ryadh 2" ${item.storage === 'Ryadh 2' ? 'selected' : ''}>Ryadh 2</option>
                <option value="Abha" ${item.storage === 'Abha' ? 'selected' : ''}>Abha</option>
                <option value="Jeddah" ${item.storage === 'Jeddah' ? 'selected' : ''}>Jeddah</option>
            </select>
        </td>
        <td>
            <button onclick="saveEdit(${itemId})">Save</button>
            <button onclick="cancelEdit(${itemId})">Cancel</button>
        </td>
    `;
}

// Function to save edited item
function saveEdit(itemId) {
    const row = document.querySelector(`tr[data-id="${itemId}"]`);
    const inputs = row.querySelectorAll('input, select');
    
    // Validate inputs
    const newItemId = parseInt(inputs[0].value);
    const newItemName = inputs[1].value;
    const newQuantity = parseInt(inputs[2].value);
    const newPrice = parseFloat(inputs[3].value);
    const newExpiryDate = inputs[4].value;
    const newStorage = inputs[5].value;

    // Validation checks
    if (!/^[a-zA-Z\s]+$/.test(newItemName)) {
        alert('Item name must contain only letters');
        return;
    }
    if (newQuantity <= 0) {
        alert('Quantity must be greater than 0');
        return;
    }
    if (newPrice <= 0) {
        alert('Price must be greater than 0');
        return;
    }
    if (new Date(newExpiryDate) <= new Date()) {
        alert('Expiry date must be in the future');
        return;
    }

    // Update item in localStorage
    let items = JSON.parse(localStorage.getItem('inventoryItems')) || [];
    const index = items.findIndex(item => item.itemId === itemId);
    if (index !== -1) {
        items[index] = {
            itemId: newItemId,
            itemName: newItemName,
            quantity: newQuantity,
            price: newPrice,
            expiryDate: newExpiryDate,
            storage: newStorage
        };
        localStorage.setItem('inventoryItems', JSON.stringify(items));
        updateInventoryTable();
    }
}

// Function to cancel edit
function cancelEdit(itemId) {
    updateInventoryTable();
}

// Function to update the inventory table
function updateInventoryTable() {
    const items = JSON.parse(localStorage.getItem('inventoryItems')) || [];
    const tableBody = document.querySelector('table tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    items.forEach(item => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', item.itemId);
        row.innerHTML = `
            <td>${item.itemId}</td>
            <td>${item.itemName}</td>
            <td>${item.quantity}</td>
            <td>${item.price}</td>
            <td>${item.expiryDate}</td>
            <td>${item.storage}</td>
            <td>
                <button onclick="editItem(${item.itemId})">Edit</button>
                <button onclick="deleteItem(${item.itemId})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Language toggle functionality
function initLanguageToggle() {
    const languageToggle = document.getElementById('languageToggle');
    if (languageToggle) {
        languageToggle.addEventListener('click', function() {
            const currentLang = document.documentElement.lang;
            setLanguage(currentLang === 'en' ? 'ar' : 'en');
        });
    }
}

// Initialize the appropriate page based on the current URL
function initPage() {
    const currentPage = window.location.pathname.split("/").pop().toLowerCase();
    
    // Initialize language toggle for all pages
    initLanguageToggle();
    
    if (currentPage === "login.html" || currentPage === "") {
        const loginForm = document.querySelector("form");
        if (loginForm) {
            loginForm.addEventListener("submit", handleLogin);
        }
    } 
    else if (currentPage === "dashboard.html") {
        const user = checkLoginStatus();
        if (user) {
            updateDashboardUI(user.username);
            
            // Set up Add New Item button
            const addNewItemBtn = document.getElementById("addNewItemBtn");
            if (addNewItemBtn) {
                addNewItemBtn.addEventListener("click", function() {
                    const addItemForm = document.getElementById("addItemForm");
                    if (addItemForm) {
                        addItemForm.style.display = "block";
                    }
                });
            }
            
            // Initialize table
            updateInventoryTable();
        }
    }
}

// Call initPage when the DOM is loaded
document.addEventListener('DOMContentLoaded', initPage);