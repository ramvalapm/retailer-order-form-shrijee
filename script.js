document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const orderForm = document.getElementById('orderForm');
    const addRowButton = document.getElementById('addRow');
    const orderTableBody = document.getElementById('orderTableBody');
    const cancelButton = document.getElementById('cancelButton');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const summaryContainer = document.getElementById('summaryContainer');
    const orderSummary = document.getElementById('orderSummary');
    const newOrderButton = document.getElementById('newOrderButton');
    const formContainer = document.querySelector('.container');

    // Add row to order table
    addRowButton.addEventListener('click', function() {
        const newRow = document.createElement('tr');
        newRow.className = 'item-row';
        newRow.innerHTML = `
            <td><input type="text" name="sku[]" required></td>
            <td><input type="text" name="type[]" required></td>
            <td><input type="number" name="c1[]" min="0"></td>
            <td><input type="number" name="c2[]" min="0"></td>
            <td><input type="number" name="c3[]" min="0"></td>
            <td><input type="number" name="c4[]" min="0"></td>
            <td><input type="number" name="c5[]" min="0"></td>
            <td><input type="number" name="c6[]" min="0"></td>
            <td><input type="number" name="c7[]" min="0"></td>
            <td><input type="number" name="c8[]" min="0"></td>
            <td><input type="number" name="c9[]" min="0"></td>
            <td><button type="button" class="remove-row">Remove</button></td>
        `;
        orderTableBody.appendChild(newRow);
        
        // Add event listener to the new remove button
        const removeButton = newRow.querySelector('.remove-row');
        removeButton.addEventListener('click', function() {
            orderTableBody.removeChild(newRow);
        });
    });

    // Remove row event delegation
    orderTableBody.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-row')) {
            const row = e.target.closest('tr');
            if (orderTableBody.children.length > 1) {
                orderTableBody.removeChild(row);
            } else {
                // Clear the inputs instead of removing the last row
                const inputs = row.querySelectorAll('input');
                inputs.forEach(input => input.value = '');
            }
        }
    });

    // Cancel button click handler
    cancelButton.addEventListener('click', function() {
        resetForm();
    });

    // New order button click handler
    newOrderButton.addEventListener('click', function() {
        summaryContainer.classList.add('hidden');
        formContainer.classList.remove('hidden');
        resetForm();
    });

    // Form submission handler
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show loading overlay
        loadingOverlay.classList.remove('hidden');
        
        // Get form data
        const formData = {
            salesExec: document.getElementById('salesExec').value,
            retailerName: document.getElementById('retailerName').value,
            timestamp: new Date().toISOString(),
            items: []
        };
        
        // Get all rows
        const rows = orderTableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const item = {
                sku: row.querySelector('input[name="sku[]"]').value,
                type: row.querySelector('input[name="type[]"]').value,
                c1: row.querySelector('input[name="c1[]"]').value || '0',
                c2: row.querySelector('input[name="c2[]"]').value || '0',
                c3: row.querySelector('input[name="c3[]"]').value || '0',
                c4: row.querySelector('input[name="c4[]"]').value || '0',
                c5: row.querySelector('input[name="c5[]"]').value || '0',
                c6: row.querySelector('input[name="c6[]"]').value || '0',
                c7: row.querySelector('input[name="c7[]"]').value || '0',
                c8: row.querySelector('input[name="c8[]"]').value || '0',
                c9: row.querySelector('input[name="c9[]"]').value || '0'
            };
            formData.items.push(item);
        });
        
        // Send data to Google Sheets
        submitToGoogleSheets(formData);
    });

    // Function to submit data to Google Sheets
    function submitToGoogleSheets(formData) {
        // Get your Google Apps Script Web App URL after deployment
        const scriptURL = ''; // You'll need to replace this with your Google Apps Script URL
        
        // Prepare the data to be sent
        const rowsToSend = formData.items.map(item => {
            return [
                formData.timestamp,
                formData.salesExec,
                formData.retailerName,
                item.sku,
                item.type,
                item.c1,
                item.c2,
                item.c3,
                item.c4,
                item.c5,
                item.c6,
                item.c7,
                item.c8,
                item.c9
            ];
        });
        
        // Fetch API to send data
        fetch(scriptURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({rows: rowsToSend}),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            showOrderSummary(formData);
            loadingOverlay.classList.add('hidden');
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('There was an error submitting your order. Please try again.');
            loadingOverlay.classList.add('hidden');
            
            // For demo/development - show summary even if Google Sheets submission fails
            // In production, you would remove this line
            showOrderSummary(formData);
        });
    }

    // Function to show order summary
    function showOrderSummary(formData) {
        // Create summary HTML
        let summaryHTML = `
            <div class="summary-info">
                <strong>Date:</strong> ${new Date().toLocaleString()}
            </div>
            <div class="summary-info">
                <strong>Sales Executive:</strong> ${formData.salesExec}
            </div>
            <div class="summary-info">
                <strong>Retailer:</strong> ${formData.retailerName}
            </div>
            <h3>Order Items</h3>
            <table class="summary-table">
                <thead>
                    <tr>
                        <th>SKU</th>
                        <th>Type</th>
                        <th>C1</th>
                        <th>C2</th>
                        <th>C3</th>
                        <th>C4</th>
                        <th>C5</th>
                        <th>C6</th>
                        <th>C7</th>
                        <th>C8</th>
                        <th>C9</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        formData.items.forEach(item => {
            summaryHTML += `
                <tr>
                    <td>${item.sku}</td>
                    <td>${item.type}</td>
                    <td>${item.c1 || '0'}</td>
                    <td>${item.c2 || '0'}</td>
                    <td>${item.c3 || '0'}</td>
                    <td>${item.c4 || '0'}</td>
                    <td>${item.c5 || '0'}</td>
                    <td>${item.c6 || '0'}</td>
                    <td>${item.c7 || '0'}</td>
                    <td>${item.c8 || '0'}</td>
                    <td>${item.c9 || '0'}</td>
                </tr>
            `;
        });
        
        summaryHTML += `
                </tbody>
            </table>
        `;
        
        orderSummary.innerHTML = summaryHTML;
        
        // Hide form and show summary
        formContainer.classList.add('hidden');
        summaryContainer.classList.remove('hidden');
    }

    // Function to reset the form
    function resetForm() {
        document.getElementById('salesExec').value = '';
        document.getElementById('retailerName').value = '';
        
        // Keep only one empty row
        while (orderTableBody.children.length > 1) {
            orderTableBody.removeChild(orderTableBody.lastChild);
        }
        
        // Clear the inputs in the first row
        const firstRow = orderTableBody.querySelector('tr');
        const inputs = firstRow.querySelectorAll('input');
        inputs.forEach(input => input.value = '');
    }
});
