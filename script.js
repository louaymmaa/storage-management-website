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

// Language toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const languageToggle = document.getElementById('languageToggle');
    if (languageToggle) {
        languageToggle.addEventListener('click', function() {
            const currentLang = document.documentElement.lang === 'ar' ? 'en' : 'ar';
            setLanguage(currentLang);
        });
    }
});

// Delete item function with confirmation
function deleteItem(itemId) {
    if (confirm('Are you sure you want to delete this item?')) {
        let items = JSON.parse(localStorage.getItem('inventoryItems')) || [];
        items = items.filter(item => item.itemId !== itemId);
        localStorage.setItem('inventoryItems', JSON.stringify(items));
        updateInventoryTable();
    }
}

// Edit item function
function editItem(itemId) {
    const items = JSON.parse(localStorage.getItem('inventoryItems')) || [];
    const item = items.find(item => item.itemId === itemId);
    if (!item) return;

    // Create edit form HTML
    const row = document.querySelector(`tr[data-id="${itemId}"]`);
    row.innerHTML = `
        <td>
            <input type="number" id="edit-itemId" value="${item.itemId}" min="1" required>
        </td>
        <td>
            <input type="text" id="edit-itemName" value="${item.itemName}" pattern="[a-zA-Z\s]+" required>
        </td>
        <td>
            <input type="number" id="edit-quantity" value="${item.quantity}" min="1" required>
        </td>
        <td>
            <input type="number" id="edit-price" value="${item.price}" min="0.5" step="0.01" required>
        </td>
        <td>
            <input type="date" id="edit-expiryDate" value="${item.expiryDate}" min="${getTomorrow()}" required>
        </td>
        <td>
            <select id="edit-storage" required>
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

// Save edited item
function saveEdit(itemId) {
    // Get all edit fields
    const editedItem = {
        itemId: parseInt(document.getElementById('edit-itemId').value),
        itemName: document.getElementById('edit-itemName').value,
        quantity: parseInt(document.getElementById('edit-quantity').value),
        price: parseFloat(document.getElementById('edit-price').value),
        expiryDate: document.getElementById('edit-expiryDate').value,
        storage: document.getElementById('edit-storage').value
    };

    // Validate inputs
    if (!validateItem(editedItem)) return;

    // Update item in localStorage
    let items = JSON.parse(localStorage.getItem('inventoryItems')) || [];
    const index = items.findIndex(item => item.itemId === itemId);
    if (index !== -1) {
        items[index] = editedItem;
        localStorage.setItem('inventoryItems', JSON.stringify(items));
        updateInventoryTable();
    }
}

// Cancel edit operation
function cancelEdit() {
    updateInventoryTable();
}

// Validate item data
function validateItem(item) {
    if (item.itemId < 0) {
        alert('Item ID must be 0 or greater');
        return false;
    }
    if (!/^[a-zA-Z\s]+$/.test(item.itemName)) {
        alert('Item name must contain only letters');
        return false;
    }
    if (item.quantity <= 0) {
        alert('Quantity must be greater than 0');
        return false;
    }
    if (item.price <= 0) {
        alert('Price must be greater than 0');
        return false;
    }
    if (new Date(item.expiryDate) <= new Date()) {
        alert('Expiry date must be in the future');
        return false;
    }
    return true;
}

// Get tomorrow's date in YYYY-MM-DD format
function getTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
}

// Update the inventory table function
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

// Initialize the appropriate page based on the current URL
function initPage() {
    const currentPage = window.location.pathname.split("/").pop();
    
    if (currentPage === "Index.html" || currentPage === "") {
        const loginForm = document.querySelector("form");
        if (loginForm) {
            loginForm.addEventListener("submit", handleLogin);
        }
        // Set initial language
        setLanguage('en');
    } 
    else if (currentPage === "Dashboard.html") {
        const user = checkLoginStatus();
        if (user) {
            updateDashboardUI(user.username);
            updateInventoryTable();
            
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
            
            // Set up Add Item form
            const itemForm = document.getElementById("itemForm");
            if (itemForm) {
                itemForm.addEventListener("submit", handleAddItem);
            }
            
            // Set initial language
            setLanguage('en');
        }
    }
}

// Handle Add Item form submission
function handleAddItem(e) {
    e.preventDefault();
    
    const newItem = {
        itemId: parseInt(document.getElementById("itemId").value),
        itemName: document.getElementById("itemName").value,
        quantity: parseInt(document.getElementById("quantity").value),
        price: parseFloat(document.getElementById("price").value),
        expiryDate: document.getElementById("expiryDate").value,
        storage: document.getElementById("storage").value
    };
    
    if (!validateItem(newItem)) return;
    
    let items = JSON.parse(localStorage.getItem('inventoryItems')) || [];
    items.push(newItem);
    localStorage.setItem('inventoryItems', JSON.stringify(items));
    
    updateInventoryTable();
    this.reset();
    document.getElementById("addItemForm").style.display = "none";
}

// Call initPage when the DOM is loaded
document.addEventListener('DOMContentLoaded', initPage);