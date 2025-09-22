let contacts = [];
let editId = null;

const addContactBtn = document.getElementById('addContactBtn');
const contactsTableBody = document.getElementById('contactsTableBody');
const errorMessage = document.getElementById('errorMessage');
const contactModal = document.getElementById('contactModal');
const contactForm = document.getElementById('contactForm');
const cancelBtn = document.getElementById('cancelBtn');
const lastNameInput = document.getElementById('lastName');
const firstNameInput = document.getElementById('firstName');
const emailInput = document.getElementById('email');
const contactNumberInput = document.getElementById('contactNumber');

const API_BASE = 'api/contacts.php';

addContactBtn.addEventListener('click', () => {
    openModal();
});

cancelBtn.addEventListener('click', () => {
    closeModal();
});

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        firstName: firstNameInput.value.trim(),
        lastName: lastNameInput.value.trim(),
        email: emailInput.value.trim(),
        contactNumber: contactNumberInput.value.trim()
    };

    // Client-side validation
    if (!validateForm(formData)) {
        return;
    }

    try {
        if (editId === null) {
            // Create new contact
            await createContact(formData);
        } else {
            // Update existing contact
            formData.id = editId;
            await updateContact(formData);
        }
        
        await loadContacts();
        closeModal();
        contactForm.reset();
    } catch (error) {
        showError(error.message);
    }
});

async function loadContacts() {
    try {
        const response = await fetch(API_BASE);
        const result = await response.json();
        
        if (result.success) {
            contacts = result.data;
            renderContacts();
        } else {
            throw new Error(result.error || 'Failed to load contacts');
        }
    } catch (error) {
        showError('Failed to load contacts: ' + error.message);
    }
}

async function createContact(contactData) {
    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contactData)
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to create contact');
        }
        
        showSuccess('Contact created successfully!');
    } catch (error) {
        throw error;
    }
}

async function updateContact(contactData) {
    try {
        const response = await fetch(API_BASE, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contactData)
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to update contact');
        }
        
        showSuccess('Contact updated successfully!');
    } catch (error) {
        throw error;
    }
}

async function deleteContact(contactId) {
    try {
        const response = await fetch(API_BASE, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: contactId })
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to delete contact');
        }
        
        await loadContacts();
        showSuccess('Contact deleted successfully!');
    } catch (error) {
        showError('Failed to delete contact: ' + error.message);
    }
}

// Validation function
function validateForm(data) {
    // Check required fields
    if (!data.firstName || !data.lastName || !data.email || !data.contactNumber) {
        showError('All fields are required.');
        return false;
    }

    if (data.firstName.length > 50) {
        showError('First name must not exceed 50 characters.');
        return false;
    }
    
    if (data.lastName.length > 50) {
        showError('Last name must not exceed 50 characters.');
        return false;
    }
    
    if (data.email.length > 50) {
        showError('Email must not exceed 50 characters.');
        return false;
    }
    
    if (data.contactNumber.length > 15) {
        showError('Contact number must not exceed 15 characters.');
        return false;
    }

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(data.email)) {
        showError('Invalid email format.');
        return false;
    }

    // Validate contact number (only digits)
    const contactNumberPattern = /^\d+$/;
    if (!contactNumberPattern.test(data.contactNumber)) {
        showError('Contact number must contain only digits.');
        return false;
    }

    clearError();
    return true;
}

// UI functions
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.className = 'text-red-500 text-center';
}

function showSuccess(message) {
    errorMessage.textContent = message;
    errorMessage.className = 'text-green-500 text-center';
    setTimeout(() => {
        clearError();
    }, 3000);
}

function clearError() {
    errorMessage.textContent = '';
    errorMessage.className = 'text-red-500 text-center';
}

function openModal() {
    contactModal.classList.remove('hidden');
    document.querySelector('#contactModal h3').textContent = editId ? 'Edit Contact' : 'Add Contact';
}

function closeModal() {
    contactModal.classList.add('hidden');
    clearError();
    contactForm.reset();
    editId = null;
}

function renderContacts() {
    contactsTableBody.innerHTML = '';
    
    if (contacts.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                No contacts found. Click "Add Contact" to get started.
            </td>
        `;
        contactsTableBody.appendChild(row);
        return;
    }
    
    contacts.forEach((contact) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${escapeHtml(contact.last_name)}</td>
            <td class="px-6 py-4 whitespace-nowrap">${escapeHtml(contact.first_name)}</td>
            <td class="px-6 py-4 whitespace-nowrap">${escapeHtml(contact.email)}</td>
            <td class="px-6 py-4 whitespace-nowrap">${escapeHtml(contact.contact_number)}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <button class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded editBtn mr-2">Edit</button>
                <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded deleteBtn">Delete</button>
            </td>
        `;
        contactsTableBody.appendChild(row);

        const editBtn = row.querySelector('.editBtn');
        const deleteBtn = row.querySelector('.deleteBtn');

        editBtn.addEventListener('click', () => {
            editId = contact.id;
            lastNameInput.value = contact.last_name;
            firstNameInput.value = contact.first_name;
            emailInput.value = contact.email;
            contactNumberInput.value = contact.contact_number;
            openModal();
        });

        deleteBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this contact?')) {
                deleteContact(contact.id);
            }
        });
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadContacts();
});