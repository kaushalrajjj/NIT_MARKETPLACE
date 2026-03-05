import { getUserInfo } from '../api/authApi.js';
import { initNavigation } from '../utils/navigation-utils.js';

const userInfo = getUserInfo();
if (!userInfo) window.location.href = '/auth';

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
});

document.getElementById('sellForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Publishing...';

    const productData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        price: Number(document.getElementById('price').value),
        category: document.getElementById('category').value,
        condition: document.getElementById('condition').value,
        location: document.getElementById('location').value
    };

    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userInfo.token}`
            },
            body: JSON.stringify(productData)
        });

        const data = await response.json();

        if (response.ok) {
            alert('Listing published successfully!');
            window.location.href = '/dashboard';
        } else {
            alert(data.message || 'Error creating listing');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Publish Listing';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Publish Listing';
    }
});
